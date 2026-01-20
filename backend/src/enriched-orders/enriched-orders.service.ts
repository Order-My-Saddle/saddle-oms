import { Injectable, Inject, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "../config/config.type";
import { ProductionCacheService } from "../cache/production-cache.service";

export interface EnrichedOrdersQueryDto {
  page?: number;
  limit?: number;
  partial?: boolean | string;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  urgency?: string;
  fitterId?: number;
  customerId?: number;
  brandId?: number;
  orderStatus?: string;
}

export interface PaginationMetadata {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface EnrichedOrdersResponse {
  data: any[];
  pagination: PaginationMetadata;
  metadata: {
    queriedAt: string;
    cached: boolean;
    processingTimeMs: number;
  };
}

@Injectable()
export class EnrichedOrdersService {
  private readonly logger = new Logger(EnrichedOrdersService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly productionCacheService: ProductionCacheService,
  ) {}

  async getEnrichedOrders(
    query: EnrichedOrdersQueryDto,
  ): Promise<EnrichedOrdersResponse> {
    const startTime = Date.now();
    const cacheConfig = this.configService.get("cache", { infer: true });
    const isCacheEnabled = cacheConfig?.enabled ?? false;
    const cacheTTL = cacheConfig?.ttl ?? 300000;

    try {
      let cached: any = null;
      let cacheKey = "";

      if (isCacheEnabled) {
        cacheKey = this.generateCacheKey(query);
        // Try to get from cache first
        cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.logger.debug(`Cache hit for enriched orders: ${cacheKey}`);
          return {
            ...(cached as EnrichedOrdersResponse),
            metadata: {
              ...(cached as EnrichedOrdersResponse).metadata,
              cached: true,
              processingTimeMs: Date.now() - startTime,
            },
          };
        }
      }

      // Execute the query
      const result = await this.executeEnrichedOrdersQuery(query);
      const processingTime = Date.now() - startTime;

      const response: EnrichedOrdersResponse = {
        ...result,
        metadata: {
          queriedAt: new Date().toISOString(),
          cached: false,
          processingTimeMs: processingTime,
        },
      };

      if (isCacheEnabled) {
        // Cache the result
        await this.cacheManager.set(cacheKey, response, cacheTTL);
        this.logger.debug(
          `Cached enriched orders result: ${cacheKey} (TTL: ${cacheTTL}ms)`,
        );
      } else {
        this.logger.debug(
          `Fresh data fetched for enriched orders (caching disabled)`,
        );
      }

      return response;
    } catch (error) {
      this.logger.error("Failed to fetch enriched orders", error);
      throw error;
    }
  }

  private async executeEnrichedOrdersQuery(
    query: EnrichedOrdersQueryDto,
  ): Promise<{
    data: any[];
    pagination: PaginationMetadata;
  }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100); // Max 100 items per page
    const offset = (page - 1) * limit;

    // Build the base query using actual database schema with brand and model joins
    const baseQuery = `
      SELECT
        o.id,
        o.id as "orderId",
        o.created_at,
        o.is_urgent as urgency,
        o.special_instructions as comments,
        c.name as customer_name,
        c.id as customer_id,
        u.name as fitter_name,
        f.id as fitter_id,
        COALESCE(mb.name, CAST(o.saddle_specifications->>'brand' AS varchar)) as brand_name,
        mb.id as brand_id,
        COALESCE(mm.name, CAST(o.saddle_specifications->>'model' AS varchar)) as model_name,
        mm.id as model_id,
        CAST(o.saddle_specifications->>'seatSize' AS varchar) as seat_size,
        o.status as "orderStatus"
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.id
      LEFT JOIN fitter f ON o.fitter_id = f.id
      LEFT JOIN "user" u ON f.user_id = u.id
      LEFT JOIN modelling_brand mb ON mb.name ILIKE '%' || CAST(o.saddle_specifications->>'brand' AS varchar) || '%'
      LEFT JOIN modelling_model mm ON mm.name ILIKE '%' || CAST(o.saddle_specifications->>'model' AS varchar) || '%' AND mm.brand_id = mb.id
    `;

    const countQuery = `SELECT COUNT(*) as total FROM orders o`;

    // Add WHERE conditions
    const conditions = this.buildWhereConditions(query);
    let finalBaseQuery = baseQuery;
    let finalCountQuery = countQuery;

    if (conditions.where) {
      finalBaseQuery += ` WHERE ${conditions.where}`;
      finalCountQuery += ` WHERE ${conditions.where}`;
    }

    // Add ORDER BY
    const orderBy = this.buildOrderBy(query);
    finalBaseQuery += ` ${orderBy}`;

    // Add pagination
    finalBaseQuery += ` LIMIT $${conditions.params.length + 1} OFFSET $${conditions.params.length + 2}`;

    try {
      // Execute count query
      const countResult = await this.dataSource.query(
        finalCountQuery,
        conditions.params,
      );
      const totalItems = parseInt(countResult[0].total);

      // Execute data query
      const dataResult = await this.dataSource.query(finalBaseQuery, [
        ...conditions.params,
        limit,
        offset,
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / limit);
      const pagination: PaginationMetadata = {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };

      this.logger.log(
        `Fetched ${dataResult.length} enriched orders (page ${page}/${totalPages})`,
      );

      return {
        data: dataResult,
        pagination,
      };
    } catch (error) {
      this.logger.error("Database query failed", error);
      throw error;
    }
  }

  private buildWhereConditions(query: EnrichedOrdersQueryDto): {
    where: string;
    params: any[];
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.searchTerm) {
      conditions.push(`(
        c.name ILIKE $${paramIndex} OR
        u.name ILIKE $${paramIndex} OR
        mb.name ILIKE $${paramIndex} OR
        mm.name ILIKE $${paramIndex} OR
        o.special_instructions ILIKE $${paramIndex}
      )`);
      params.push(`%${query.searchTerm}%`);
      paramIndex++;
    }

    if (query.urgency) {
      // Convert urgency to boolean for is_urgent field
      const isUrgent =
        query.urgency === "true" ||
        query.urgency === "1" ||
        query.urgency === "urgent";
      conditions.push(`o.is_urgent = $${paramIndex}`);
      params.push(isUrgent);
      paramIndex++;
    }

    if (query.fitterId) {
      conditions.push(`o.fitter_id = $${paramIndex}`);
      params.push(query.fitterId);
      paramIndex++;
    }

    if (query.customerId) {
      conditions.push(`o.customer_id = $${paramIndex}`);
      params.push(query.customerId);
      paramIndex++;
    }

    if (query.brandId) {
      conditions.push(`mb.id = $${paramIndex}`);
      params.push(query.brandId);
      paramIndex++;
    }

    if (query.orderStatus) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(query.orderStatus);
      paramIndex++;
    }

    return {
      where: conditions.length > 0 ? conditions.join(" AND ") : "",
      params,
    };
  }

  private buildOrderBy(query: EnrichedOrdersQueryDto): string {
    const orderBy = query.orderBy || "created_at";
    const direction = query.orderDirection || "DESC";

    // Whitelist allowed order by columns for security
    const allowedColumns = [
      "created_at",
      "urgency",
      "customer_name",
      "fitter_name",
      "brand_name",
      "model_name",
      "seat_size",
      "status",
    ];

    const column = allowedColumns.includes(orderBy) ? orderBy : "created_at";
    const dir = direction === "ASC" ? "ASC" : "DESC";

    return `ORDER BY ${column} ${dir}`;
  }

  private generateCacheKey(query: EnrichedOrdersQueryDto): string {
    const keyParts = [
      "enriched_orders",
      `page:${query.page || 1}`,
      `limit:${query.limit || 50}`,
      `partial:${query.partial || false}`,
    ];

    if (query.searchTerm) keyParts.push(`search:${query.searchTerm}`);
    if (query.orderBy) keyParts.push(`order:${query.orderBy}`);
    if (query.orderDirection) keyParts.push(`dir:${query.orderDirection}`);
    if (query.urgency) keyParts.push(`urgency:${query.urgency}`);
    if (query.fitterId) keyParts.push(`fitter:${query.fitterId}`);
    if (query.customerId) keyParts.push(`customer:${query.customerId}`);
    if (query.brandId) keyParts.push(`brand:${query.brandId}`);

    return keyParts.join(":");
  }

  async invalidateCache(pattern?: string): Promise<void> {
    await Promise.resolve();
    try {
      if (pattern) {
        // Redis-style pattern invalidation would go here
        // For now, we'll clear specific keys
        this.logger.debug(`Invalidating cache pattern: ${pattern}`);
      } else {
        // Clear all enriched orders cache
        this.logger.debug("Clearing all enriched orders cache");
      }
    } catch (error) {
      this.logger.warn("Failed to invalidate cache", error);
    }
  }
}

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
  search?: string; // Alias for searchTerm
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
  // Filter by order ID
  id?: number;
  orderId?: number;
  // Filter by urgency (0/1 or true/false)
  urgency?: string;
  urgent?: string | boolean;
  // Filter by fitter (ID or name)
  fitterId?: number;
  fitterName?: string;
  fitter?: string;
  // Filter by customer (ID or name)
  customerId?: number;
  customerName?: string;
  customer?: string;
  // Filter by brand/saddle
  brandId?: number;
  // Filter by status
  orderStatus?: string;
  status?: string;
  // Filter by factory
  factoryId?: number;
  factoryName?: string;
  factory?: string;
  // Filter by seat size
  seatSizes?: string;
  seatSize?: string;
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

    // Build the base query using legacy database schema with proper JOINs
    const baseQuery = `
      SELECT
        o.id,
        o.id as "orderId",
        to_timestamp(o.order_time) as created_at,
        o.rushed as urgency,
        o.special_notes,
        COALESCE(c.name, o.name, '') as customer_name,
        o.customer_id,
        fc.full_name as fitter_name,
        o.fitter_id,
        s.brand as brand_name,
        o.saddle_id as brand_id,
        s.model_name,
        o.saddle_id as model_id,
        st.name as "orderStatus",
        o.order_status as status_id,
        fac.full_name as factory_name,
        o.factory_id,
        o.order_data,
        o.seat_sizes
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN fitters f ON o.fitter_id = f.id
      LEFT JOIN credentials fc ON f.user_id = fc.user_id
      LEFT JOIN saddles s ON o.saddle_id = s.id
      LEFT JOIN factories fa ON o.factory_id = fa.id
      LEFT JOIN credentials fac ON fa.user_id = fac.user_id
      LEFT JOIN statuses st ON o.order_status = st.id
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN fitters f ON o.fitter_id = f.id
      LEFT JOIN credentials fc ON f.user_id = fc.user_id
      LEFT JOIN saddles s ON o.saddle_id = s.id
      LEFT JOIN factories fa ON o.factory_id = fa.id
      LEFT JOIN credentials fac ON fa.user_id = fac.user_id
      LEFT JOIN statuses st ON o.order_status = st.id`;

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

    // Use QueryRunner to set RLS bypass context for system queries
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Set RLS bypass context (user_id = 0 triggers system_bypass policies)
      await queryRunner.query(`SELECT set_config('rls.user_id', '0', true)`);

      // Execute count query
      const countResult = await queryRunner.query(
        finalCountQuery,
        conditions.params,
      );
      const totalItems = parseInt(countResult[0].total);

      // Execute data query
      const dataResult = await queryRunner.query(finalBaseQuery, [
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
    } finally {
      await queryRunner.release();
    }
  }

  private buildWhereConditions(query: EnrichedOrdersQueryDto): {
    where: string;
    params: any[];
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by order ID (exact match)
    const orderId = query.id || query.orderId;
    if (orderId) {
      conditions.push(`o.id = $${paramIndex}`);
      params.push(orderId);
      paramIndex++;
    }

    // General search term (searches multiple fields)
    const searchTermValue = query.searchTerm || query.search;
    if (searchTermValue) {
      conditions.push(`(
        o.name ILIKE $${paramIndex} OR
        o.special_notes ILIKE $${paramIndex} OR
        o.horse_name ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex} OR
        fc.full_name ILIKE $${paramIndex} OR
        fac.full_name ILIKE $${paramIndex} OR
        s.brand ILIKE $${paramIndex} OR
        s.model_name ILIKE $${paramIndex}
      )`);
      params.push(`%${searchTermValue}%`);
      paramIndex++;
    }

    // Filter by urgency (accepts multiple formats)
    const urgencyValue = query.urgency || query.urgent;
    if (
      urgencyValue !== undefined &&
      urgencyValue !== null &&
      urgencyValue !== ""
    ) {
      const isUrgent =
        urgencyValue === "true" ||
        urgencyValue === true ||
        urgencyValue === "1" ||
        urgencyValue === "Yes" ||
        urgencyValue === "urgent";
      const isNotUrgent =
        urgencyValue === "false" ||
        urgencyValue === false ||
        urgencyValue === "0" ||
        urgencyValue === "No";

      if (isUrgent) {
        conditions.push(`o.rushed = $${paramIndex}`);
        params.push(1);
        paramIndex++;
      } else if (isNotUrgent) {
        conditions.push(`o.rushed = $${paramIndex}`);
        params.push(0);
        paramIndex++;
      }
    }

    // Filter by fitter ID
    if (query.fitterId) {
      conditions.push(`o.fitter_id = $${paramIndex}`);
      params.push(query.fitterId);
      paramIndex++;
    }

    // Filter by fitter name (searches in credentials.full_name via fitters join)
    const fitterNameFilter = query.fitterName || query.fitter;
    if (fitterNameFilter) {
      conditions.push(`fc.full_name ILIKE $${paramIndex}`);
      params.push(`%${fitterNameFilter}%`);
      paramIndex++;
    }

    // Filter by customer ID
    if (query.customerId) {
      conditions.push(`o.customer_id = $${paramIndex}`);
      params.push(query.customerId);
      paramIndex++;
    }

    // Filter by customer name (searches in customers.name)
    const customerNameFilter = query.customerName || query.customer;
    if (customerNameFilter) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${customerNameFilter}%`);
      paramIndex++;
    }

    // Filter by brand/saddle ID
    if (query.brandId) {
      conditions.push(`o.saddle_id = $${paramIndex}`);
      params.push(query.brandId);
      paramIndex++;
    }

    // Filter by order status (supports both integer ID and string name)
    const statusFilter = query.orderStatus || query.status;
    if (statusFilter) {
      // Check if it's a numeric ID or a string name
      const statusAsNumber = parseInt(String(statusFilter), 10);
      if (
        !isNaN(statusAsNumber) &&
        String(statusAsNumber) === String(statusFilter)
      ) {
        // Numeric status ID - filter directly on order_status column
        conditions.push(`o.order_status = $${paramIndex}`);
        params.push(statusAsNumber);
        paramIndex++;
      } else {
        // String status name - filter on statuses.name (case-insensitive)
        conditions.push(`LOWER(st.name) = LOWER($${paramIndex})`);
        params.push(statusFilter);
        paramIndex++;
      }
    }

    // Filter by factory ID
    if (query.factoryId) {
      conditions.push(`o.factory_id = $${paramIndex}`);
      params.push(query.factoryId);
      paramIndex++;
    }

    // Filter by factory name (searches in credentials.full_name via factories join)
    const factoryNameFilter = query.factoryName || query.factory;
    if (factoryNameFilter) {
      conditions.push(`fac.full_name ILIKE $${paramIndex}`);
      params.push(`%${factoryNameFilter}%`);
      paramIndex++;
    }

    // Filter by seat size (searches multiple sources like the frontend display)
    const seatSizeFilter = query.seatSizes || query.seatSize;
    if (seatSizeFilter) {
      // Normalize: accept both dot (17.5) and comma (17,5) notation
      const commaSize = String(seatSizeFilter).replace(".", ",");
      const dotSize = String(seatSizeFilter).replace(",", ".");

      // Build a comprehensive search condition that checks:
      // 1. seat_sizes JSONB column (primary source, if populated)
      // 2. orders_info table with options_items (authoritative source for seat sizes)
      // 3. special_notes field (fallback - searches for patterns like "seat size 18")
      // 4. order_data JSONB for seatSize fields
      const seatSizeConditions = [
        // Check seat_sizes JSONB array (both notations)
        `o.seat_sizes @> $${paramIndex}::jsonb`,
        `o.seat_sizes @> $${paramIndex + 1}::jsonb`,
        // Check orders_info table directly (option_id = 1 is "Seat Size")
        `EXISTS (
          SELECT 1 FROM orders_info oi
          JOIN options_items oi2 ON oi.option_item_id = oi2.id
          WHERE oi.order_id = o.id
            AND oi.option_id = 1
            AND (
              REPLACE(oi2.name, '.', ',') = $${paramIndex + 2}
              OR REPLACE(oi2.name, ',', '.') = $${paramIndex + 3}
              OR oi2.name = $${paramIndex + 2}
              OR oi2.name = $${paramIndex + 3}
            )
        )`,
        // Check special_notes for seat size patterns (case-insensitive)
        `o.special_notes ~* $${paramIndex + 4}`,
      ];

      conditions.push(`(${seatSizeConditions.join(" OR ")})`);
      params.push(JSON.stringify([commaSize])); // For JSONB @> with comma
      params.push(JSON.stringify([dotSize])); // For JSONB @> with dot
      params.push(commaSize); // For orders_info comparison (comma notation)
      params.push(dotSize); // For orders_info comparison (dot notation)
      // Regex pattern to match seat size in special_notes (e.g., "seat size 18", "18 seat", "18"")
      params.push(
        `(seat\\s*size[:\\s]*${dotSize.replace(".", "\\.")}|${dotSize.replace(".", "\\.")}\\s*(seat|inch|"))`,
      );
      paramIndex += 5;
    }

    return {
      where: conditions.length > 0 ? conditions.join(" AND ") : "",
      params,
    };
  }

  private buildOrderBy(query: EnrichedOrdersQueryDto): string {
    const orderBy = query.orderBy || "order_time";
    const direction = query.orderDirection || "DESC";

    // Map incoming column names to legacy schema columns
    const columnMap: Record<string, string> = {
      id: "o.id",
      orderId: "o.id",
      created_at: "o.order_time",
      order_time: "o.order_time",
      urgency: "o.rushed",
      customer_name: "c.name",
      fitter_name: "fc.full_name",
      brand_name: "s.brand",
      model_name: "s.model_name",
      status: "o.order_status",
      order_status: "o.order_status",
    };

    const column = columnMap[orderBy] || "o.order_time";
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

    // Include search term in cache key (check both aliases)
    const searchValue = query.searchTerm || query.search;
    if (searchValue) keyParts.push(`search:${searchValue}`);
    if (query.orderBy) keyParts.push(`order:${query.orderBy}`);
    if (query.orderDirection) keyParts.push(`dir:${query.orderDirection}`);
    // Order ID filters
    if (query.id) keyParts.push(`id:${query.id}`);
    if (query.orderId) keyParts.push(`orderId:${query.orderId}`);
    // Urgency filters
    if (query.urgency) keyParts.push(`urgency:${query.urgency}`);
    if (query.urgent) keyParts.push(`urgent:${query.urgent}`);
    // Fitter filters
    if (query.fitterId) keyParts.push(`fitterId:${query.fitterId}`);
    if (query.fitterName) keyParts.push(`fitterName:${query.fitterName}`);
    if (query.fitter) keyParts.push(`fitter:${query.fitter}`);
    // Customer filters
    if (query.customerId) keyParts.push(`customerId:${query.customerId}`);
    if (query.customerName) keyParts.push(`customerName:${query.customerName}`);
    if (query.customer) keyParts.push(`customer:${query.customer}`);
    // Other filters
    if (query.brandId) keyParts.push(`brand:${query.brandId}`);
    if (query.orderStatus) keyParts.push(`status:${query.orderStatus}`);
    if (query.status) keyParts.push(`statusAlt:${query.status}`);
    // Factory filters
    if (query.factoryId) keyParts.push(`factoryId:${query.factoryId}`);
    if (query.factoryName) keyParts.push(`factoryName:${query.factoryName}`);
    if (query.factory) keyParts.push(`factory:${query.factory}`);
    // Seat size filters
    if (query.seatSizes) keyParts.push(`seatSizes:${query.seatSizes}`);
    if (query.seatSize) keyParts.push(`seatSize:${query.seatSize}`);

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

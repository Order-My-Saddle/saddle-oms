import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { OrderEntity } from "./infrastructure/persistence/relational/entities/order.entity";
import { OrderSearchDto } from "./dto/order-search.dto";
import { OrderDto } from "./dto/order.dto";
import { OrderMapper as DtoMapper } from "./mappers/order-dto.mapper";
import { OrderMapper } from "./infrastructure/persistence/relational/mappers/order.mapper";

/**
 * Order Search Service
 *
 * Provides optimized search functionality with multiple criteria support
 * Performance target: <100ms response times for 2.9M production records
 */
@Injectable()
export class OrderSearchService {
  private readonly logger = new Logger(OrderSearchService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dtoMapper: DtoMapper,
    private readonly domainMapper: OrderMapper,
  ) {}

  /**
   * Advanced search with multiple criteria
   * Optimized for production scale performance
   */
  async searchOrders(searchDto: OrderSearchDto): Promise<{
    orders: OrderDto[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const startTime = Date.now();

    try {
      // Build optimized query with proper indexes
      const queryBuilder = this.buildSearchQuery(searchDto);

      // Get total count for pagination (without LIMIT/OFFSET)
      const countQuery = queryBuilder.clone();
      const total = await countQuery.getCount();

      // Apply pagination and sorting
      queryBuilder
        .skip(searchDto.getOffset())
        .take(searchDto.getLimit())
        .orderBy(
          `order.${searchDto.sortBy || "createdAt"}`,
          searchDto.sortOrder || "DESC",
        );

      // Execute optimized query
      const entities = await queryBuilder.getMany();

      // Convert to domain objects and DTOs
      const domainOrders = entities.map((entity) =>
        this.domainMapper.toDomain(entity),
      );
      const orders = domainOrders.map((order) => this.dtoMapper.toDto(order));

      const page = searchDto.page || 1;
      const limit = searchDto.getLimit();
      const totalPages = Math.ceil(total / limit);

      const result = {
        orders,
        total,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      const duration = Date.now() - startTime;
      this.logger.log(
        `Order search completed in ${duration}ms - ` +
          `Found ${total} results, returned ${orders.length} orders ` +
          `(page ${page}/${totalPages})`,
      );

      if (duration > 100) {
        this.logger.warn(
          `Search performance warning: Query took ${duration}ms ` +
            `(target: <100ms) - Criteria: ${JSON.stringify(this.getSearchSummary(searchDto))}`,
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Order search failed after ${duration}ms: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Build optimized search query with proper index usage
   */
  private buildSearchQuery(
    searchDto: OrderSearchDto,
  ): SelectQueryBuilder<OrderEntity> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL"); // Only non-deleted orders

    // Customer name search with full-text search optimization
    if (searchDto.customer) {
      // Use ILIKE for PostgreSQL case-insensitive partial matching
      // This will use the GIN index on customer_name
      queryBuilder.andWhere("order.customerName ILIKE :customerName", {
        customerName: `%${searchDto.customer}%`,
      });
    }

    // Order ID search (exact match)
    if (searchDto.orderId) {
      queryBuilder.andWhere("CAST(order.id AS VARCHAR) = :orderIdStr", {
        orderIdStr: searchDto.orderId.toString(),
      });
    }

    // Order number search (exact match)
    if (searchDto.orderNumber) {
      queryBuilder.andWhere("order.orderNumber = :orderNumber", {
        orderNumber: searchDto.orderNumber,
      });
    }

    // Seat size ID search using JSONB containment
    if (searchDto.seatSizeId) {
      // PostgreSQL JSONB containment query - very efficient with GIN index
      queryBuilder.andWhere("order.seatSizes @> :seatSizeArray", {
        seatSizeArray: JSON.stringify([searchDto.seatSizeId]),
      });
    }

    // Urgency flag (uses boolean index)
    if (searchDto.isUrgent !== undefined) {
      queryBuilder.andWhere("order.isUrgent = :isUrgent", {
        isUrgent: searchDto.isUrgent,
      });
    }

    // Saddle type/model ID (uses index)
    if (searchDto.saddleId) {
      queryBuilder.andWhere("order.saddleId = :saddleId", {
        saddleId: searchDto.saddleId,
      });
    }

    // Fitter assignment (uses composite index with date)
    if (searchDto.fitterId) {
      queryBuilder.andWhere("order.fitterId = :fitterId", {
        fitterId: searchDto.fitterId,
      });
    }

    // Factory assignment
    if (searchDto.factoryId) {
      queryBuilder.andWhere("order.factoryId = :factoryId", {
        factoryId: searchDto.factoryId,
      });
    }

    // Customer ID
    if (searchDto.customerId) {
      queryBuilder.andWhere("order.customerId = :customerId", {
        customerId: searchDto.customerId,
      });
    }

    // Order status
    if (searchDto.status) {
      queryBuilder.andWhere("order.status = :status", {
        status: searchDto.status,
      });
    }

    // Order priority
    if (searchDto.priority) {
      queryBuilder.andWhere("order.priority = :priority", {
        priority: searchDto.priority,
      });
    }

    // Date range filtering (uses timestamp indexes)
    if (searchDto.dateFrom) {
      queryBuilder.andWhere("order.createdAt >= :dateFrom", {
        dateFrom: new Date(searchDto.dateFrom),
      });
    }

    if (searchDto.dateTo) {
      queryBuilder.andWhere("order.createdAt <= :dateTo", {
        dateTo: new Date(searchDto.dateTo),
      });
    }

    return queryBuilder;
  }

  /**
   * Get search summary for logging
   */
  private getSearchSummary(searchDto: OrderSearchDto): Record<string, any> {
    const summary: Record<string, any> = {};

    if (searchDto.customer) summary.customer = searchDto.customer;
    if (searchDto.orderId) summary.orderId = searchDto.orderId;
    if (searchDto.orderNumber) summary.orderNumber = searchDto.orderNumber;
    if (searchDto.seatSizeId) summary.seatSizeId = searchDto.seatSizeId;
    if (searchDto.isUrgent !== undefined) summary.isUrgent = searchDto.isUrgent;
    if (searchDto.saddleId) summary.saddleId = searchDto.saddleId;
    if (searchDto.fitterId) summary.fitterId = searchDto.fitterId;
    if (searchDto.factoryId) summary.factoryId = searchDto.factoryId;
    if (searchDto.customerId) summary.customerId = searchDto.customerId;
    if (searchDto.status) summary.status = searchDto.status;
    if (searchDto.priority) summary.priority = searchDto.priority;
    if (searchDto.dateFrom) summary.dateFrom = searchDto.dateFrom;
    if (searchDto.dateTo) summary.dateTo = searchDto.dateTo;

    summary.page = searchDto.page || 1;
    summary.limit = searchDto.getLimit();

    return summary;
  }

  /**
   * Get search suggestions based on partial input
   * Optimized for autocomplete functionality
   */
  async getSearchSuggestions(
    type: "customer" | "orderNumber",
    query: string,
    limit = 10,
  ): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .limit(limit);

    if (type === "customer" && query) {
      queryBuilder
        .select("DISTINCT order.customerName", "suggestion")
        .andWhere("order.customerName ILIKE :query", { query: `%${query}%` })
        .andWhere("order.customerName IS NOT NULL")
        .orderBy("order.customerName", "ASC");
    } else if (type === "orderNumber" && query) {
      queryBuilder
        .select("DISTINCT order.orderNumber", "suggestion")
        .andWhere("order.orderNumber ILIKE :query", { query: `%${query}%` })
        .orderBy("order.orderNumber", "ASC");
    }

    const results = await queryBuilder.getRawMany();
    return results.map((result) => result.suggestion).filter(Boolean);
  }

  /**
   * Get search statistics for analytics
   */
  async getSearchStats(searchDto: OrderSearchDto): Promise<{
    totalMatching: number;
    urgentCount: number;
    statusBreakdown: Record<string, number>;
    averageValue: number;
  }> {
    const queryBuilder = this.buildSearchQuery(searchDto);

    const [totalMatching, urgentCount, statusResults, avgResult] =
      await Promise.all([
        queryBuilder.getCount(),
        queryBuilder.clone().andWhere("order.isUrgent = true").getCount(),
        queryBuilder
          .clone()
          .select("order.status", "status")
          .addSelect("COUNT(*)", "count")
          .groupBy("order.status")
          .getRawMany(),
        queryBuilder
          .clone()
          .select("AVG(order.totalAmount)", "average")
          .getRawOne(),
      ]);

    const statusBreakdown: Record<string, number> = {};
    statusResults.forEach((result) => {
      statusBreakdown[result.status] = parseInt(result.count);
    });

    return {
      totalMatching,
      urgentCount,
      statusBreakdown,
      averageValue: parseFloat(avgResult?.average || "0"),
    };
  }
}

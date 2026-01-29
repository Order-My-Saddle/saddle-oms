import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AuditLogEntity } from "../entities/audit-log.entity";
import {
  QueryAuditLogDto,
  FilterAuditLogDto,
} from "../../../../dto/query-audit-log.dto";
import { PaginatedResponseDto } from "../../../../../common/dto/base-query.dto";

/**
 * TypeORM Repository for AuditLog entities
 * Optimized for handling 764K+ audit records with high performance
 */
@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repository: Repository<AuditLogEntity>,
  ) {}

  /**
   * Create a new audit log entry
   */
  async save(auditLogEntity: AuditLogEntity): Promise<AuditLogEntity> {
    return this.repository.save(auditLogEntity);
  }

  /**
   * Find audit log by ID
   */
  async findById(id: number): Promise<AuditLogEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [], // Use lazy loading for better performance
    });
  }

  /**
   * High-performance search with filtering, sorting, and pagination
   */
  async findManyWithQuery(
    queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLogEntity>> {
    const pagination = queryDto.getEffectivePagination();
    const filters = queryDto.getAuditLogFilters();
    const sort = queryDto.getAuditLogSort();

    const query = this.createFilteredQuery(
      this.repository.createQueryBuilder("audit"),
      filters,
    );

    // Apply sorting
    sort.forEach((sortItem, index) => {
      const direction = sortItem.direction.toUpperCase() as "ASC" | "DESC";
      if (index === 0) {
        query.orderBy(`audit.${sortItem.field}`, direction);
      } else {
        query.addOrderBy(`audit.${sortItem.field}`, direction);
      }
    });

    // Apply pagination
    query.take(pagination.take).skip(pagination.skip);

    // Get results and total count
    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
        count: items.length,
      },
    };
  }

  /**
   * Get audit trail for a specific order
   */
  async findByOrderId(
    orderId: number,
    limit = 50,
    offset = 0,
  ): Promise<{ items: AuditLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("audit")
      .where("audit.orderId = :orderId", { orderId })
      .orderBy("audit.timestamp", "DESC")
      .take(limit)
      .skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Get audit trail for a specific user
   */
  async findByUserId(
    userId: number,
    limit = 100,
    offset = 0,
  ): Promise<{ items: AuditLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("audit")
      .where("audit.userId = :userId", { userId })
      .orderBy("audit.timestamp", "DESC")
      .take(limit)
      .skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Get status change audit logs
   */
  async findStatusChanges(
    orderId?: number,
    fromStatus?: number,
    toStatus?: number,
    limit = 50,
    offset = 0,
  ): Promise<{ items: AuditLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("audit")
      .where(
        "audit.orderStatusFrom IS NOT NULL AND audit.orderStatusTo IS NOT NULL",
      );

    if (orderId) {
      query.andWhere("audit.orderId = :orderId", { orderId });
    }

    if (fromStatus !== undefined) {
      query.andWhere("audit.orderStatusFrom = :fromStatus", { fromStatus });
    }

    if (toStatus !== undefined) {
      query.andWhere("audit.orderStatusTo = :toStatus", { toStatus });
    }

    query.orderBy("audit.timestamp", "DESC").take(limit).skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Get audit statistics for dashboard
   */
  async getAuditStatistics(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    totalLogs: number;
    statusChanges: number;
    uniqueUsers: number;
    uniqueOrders: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    const baseQuery = this.repository.createQueryBuilder("audit");

    if (fromDate && toDate) {
      baseQuery.andWhere("audit.timestamp BETWEEN :fromDate AND :toDate", {
        fromDate,
        toDate,
      });
    }

    // Get total count
    const totalLogs = await baseQuery.getCount();

    // Get status changes count
    const statusChanges = await this.repository
      .createQueryBuilder("audit")
      .where(
        "audit.orderStatusFrom IS NOT NULL AND audit.orderStatusTo IS NOT NULL",
      )
      .andWhere(
        fromDate && toDate
          ? "audit.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .getCount();

    // Get unique users count
    const uniqueUsers = await this.repository
      .createQueryBuilder("audit")
      .select("COUNT(DISTINCT audit.userId)", "count")
      .where(
        fromDate && toDate
          ? "audit.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .getRawOne()
      .then((result) => parseInt(result.count));

    // Get unique orders count
    const uniqueOrders = await this.repository
      .createQueryBuilder("audit")
      .select("COUNT(DISTINCT audit.orderId)", "count")
      .where("audit.orderId IS NOT NULL")
      .andWhere(
        fromDate && toDate
          ? "audit.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .getRawOne()
      .then((result) => parseInt(result.count));

    // Get top 10 actions
    const topActions = await this.repository
      .createQueryBuilder("audit")
      .select("audit.action", "action")
      .addSelect("COUNT(*)", "count")
      .where(
        fromDate && toDate
          ? "audit.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .groupBy("audit.action")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          action: result.action,
          count: parseInt(result.count),
        })),
      );

    return {
      totalLogs,
      statusChanges,
      uniqueUsers,
      uniqueOrders,
      topActions,
    };
  }

  /**
   * Bulk insert for migration
   */
  async bulkInsert(auditLogs: Partial<AuditLogEntity>[]): Promise<void> {
    const chunkSize = 1000;
    for (let i = 0; i < auditLogs.length; i += chunkSize) {
      const chunk = auditLogs.slice(i, i + chunkSize);
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(AuditLogEntity)
        .values(chunk)
        .orIgnore()
        .execute();
    }
  }

  /**
   * Create filtered query builder with common filters
   */
  private createFilteredQuery(
    query: SelectQueryBuilder<AuditLogEntity>,
    filters: FilterAuditLogDto,
  ): SelectQueryBuilder<AuditLogEntity> {
    // User filters
    if (filters.userId) {
      query.andWhere("audit.userId = :userId", { userId: filters.userId });
    }

    if (filters.userType) {
      query.andWhere("audit.userType = :userType", {
        userType: filters.userType,
      });
    }

    // Order filters
    if (filters.orderId) {
      query.andWhere("audit.orderId = :orderId", { orderId: filters.orderId });
    }

    if (filters.hasOrder !== undefined) {
      if (filters.hasOrder) {
        query.andWhere("audit.orderId IS NOT NULL");
      } else {
        query.andWhere("audit.orderId IS NULL");
      }
    }

    // Action filters
    if (filters.action) {
      query.andWhere("audit.action = :action", { action: filters.action });
    }

    if (filters.actionContains) {
      query.andWhere("LOWER(audit.action) LIKE LOWER(:actionContains)", {
        actionContains: `%${filters.actionContains}%`,
      });
    }

    // Status change filters
    if (filters.orderStatusFrom !== undefined) {
      query.andWhere("audit.orderStatusFrom = :orderStatusFrom", {
        orderStatusFrom: filters.orderStatusFrom,
      });
    }

    if (filters.orderStatusTo !== undefined) {
      query.andWhere("audit.orderStatusTo = :orderStatusTo", {
        orderStatusTo: filters.orderStatusTo,
      });
    }

    if (filters.isStatusChange) {
      query.andWhere(
        "audit.orderStatusFrom IS NOT NULL AND audit.orderStatusTo IS NOT NULL",
      );
    }

    // Date filters
    if (filters.timestampFrom) {
      query.andWhere("audit.timestamp >= :timestampFrom", {
        timestampFrom: new Date(filters.timestampFrom),
      });
    }

    if (filters.timestampTo) {
      query.andWhere("audit.timestamp <= :timestampTo", {
        timestampTo: new Date(filters.timestampTo),
      });
    }

    if (filters.date) {
      const dateStart = new Date(filters.date);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      query.andWhere(
        "audit.timestamp >= :dateStart AND audit.timestamp < :dateEnd",
        {
          dateStart,
          dateEnd,
        },
      );
    }

    return query;
  }
}

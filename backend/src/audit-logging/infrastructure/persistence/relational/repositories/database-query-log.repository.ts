import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { DatabaseQueryLogEntity } from "../entities/database-query-log.entity";
import {
  QueryDatabaseQueryLogDto,
  FilterDatabaseQueryLogDto,
} from "../../../../dto/query-database-query-log.dto";
import { PaginatedResponseDto } from "../../../../../common/dto/base-query.dto";

/**
 * TypeORM Repository for DatabaseQueryLog entities
 * Optimized for handling 74K+ query records with high performance
 */
@Injectable()
export class DatabaseQueryLogRepository {
  constructor(
    @InjectRepository(DatabaseQueryLogEntity)
    private readonly repository: Repository<DatabaseQueryLogEntity>,
  ) {}

  /**
   * Create a new database query log entry
   */
  async save(
    queryLogEntity: DatabaseQueryLogEntity,
  ): Promise<DatabaseQueryLogEntity> {
    return this.repository.save(queryLogEntity);
  }

  /**
   * Find query log by ID
   */
  async findById(id: number): Promise<DatabaseQueryLogEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [], // Use lazy loading for better performance
    });
  }


  /**
   * High-performance search with filtering, sorting, and pagination
   */
  async findManyWithQuery(
    queryDto: QueryDatabaseQueryLogDto,
  ): Promise<PaginatedResponseDto<DatabaseQueryLogEntity>> {
    const pagination = queryDto.getEffectivePagination();
    const filters = queryDto.getDatabaseQueryLogFilters();
    const sort = queryDto.getDatabaseQueryLogSort();

    const query = this.createFilteredQuery(
      this.repository.createQueryBuilder("dblog"),
      filters,
    );

    // Apply sorting
    sort.forEach((sortItem, index) => {
      const direction = sortItem.direction.toUpperCase() as "ASC" | "DESC";
      if (index === 0) {
        query.orderBy(`dblog.${sortItem.field}`, direction);
      } else {
        query.addOrderBy(`dblog.${sortItem.field}`, direction);
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
   * Find queries by user ID
   */
  async findByUserId(
    userId: number,
    limit = 100,
    offset = 0,
  ): Promise<{ items: DatabaseQueryLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("dblog")
      .where("dblog.userId = :userId", { userId })
      .orderBy("dblog.timestamp", "DESC")
      .take(limit)
      .skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Find queries by page/endpoint
   */
  async findByPage(
    page: string,
    limit = 100,
    offset = 0,
  ): Promise<{ items: DatabaseQueryLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("dblog")
      .where("dblog.page LIKE :page", { page: `%${page}%` })
      .orderBy("dblog.timestamp", "DESC")
      .take(limit)
      .skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Find potentially slow queries based on patterns
   */
  async findPotentiallySlowQueries(
    limit = 50,
    offset = 0,
  ): Promise<{ items: DatabaseQueryLogEntity[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("dblog")
      .where(
        "(LOWER(dblog.query) LIKE '%select * from%' OR " +
          "LOWER(dblog.query) LIKE '%join%join%' OR " +
          "LOWER(dblog.query) LIKE '%order by%limit%' OR " +
          "LOWER(dblog.query) LIKE '%group by%having%')",
      )
      .orderBy("dblog.timestamp", "DESC")
      .take(limit)
      .skip(offset);

    const [items, total] = await query.getManyAndCount();

    return { items, total };
  }

  /**
   * Get query statistics for performance analysis
   */
  async getQueryStatistics(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    totalQueries: number;
    uniquePages: number;
    uniqueUsers: number;
    topPages: Array<{ page: string; count: number }>;
    topQueries: Array<{ query: string; count: number }>;
    sqlOperations: Array<{ operation: string; count: number }>;
  }> {
    const baseQuery = this.repository.createQueryBuilder("dblog");

    if (fromDate && toDate) {
      baseQuery.andWhere("dblog.timestamp BETWEEN :fromDate AND :toDate", {
        fromDate,
        toDate,
      });
    }

    // Get total count
    const totalQueries = await baseQuery.getCount();

    // Get unique pages count
    const uniquePages = await this.repository
      .createQueryBuilder("dblog")
      .select("COUNT(DISTINCT dblog.page)", "count")
      .where(
        fromDate && toDate
          ? "dblog.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .getRawOne()
      .then((result) => parseInt(result.count));

    // Get unique users count
    const uniqueUsers = await this.repository
      .createQueryBuilder("dblog")
      .select("COUNT(DISTINCT dblog.userId)", "count")
      .where(
        fromDate && toDate
          ? "dblog.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .getRawOne()
      .then((result) => parseInt(result.count));

    // Get top 10 pages by query count
    const topPages = await this.repository
      .createQueryBuilder("dblog")
      .select("dblog.page", "page")
      .addSelect("COUNT(*)", "count")
      .where(
        fromDate && toDate
          ? "dblog.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .groupBy("dblog.page")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          page: result.page,
          count: parseInt(result.count),
        })),
      );

    // Get top 10 query patterns (truncated for grouping)
    const topQueries = await this.repository
      .createQueryBuilder("dblog")
      .select("LEFT(dblog.query, 100)", "query")
      .addSelect("COUNT(*)", "count")
      .where(
        fromDate && toDate
          ? "dblog.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .groupBy("LEFT(dblog.query, 100)")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          query: result.query,
          count: parseInt(result.count),
        })),
      );

    // Get SQL operations breakdown
    const sqlOperations = await this.repository
      .createQueryBuilder("dblog")
      .select(
        "CASE " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'SELECT' THEN 'SELECT' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'INSERT' THEN 'INSERT' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'UPDATE' THEN 'UPDATE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'DELETE' THEN 'DELETE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'CREATE' THEN 'CREATE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 5)) = 'ALTER' THEN 'ALTER' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 4)) = 'DROP' THEN 'DROP' " +
          "ELSE 'OTHER' END",
        "operation",
      )
      .addSelect("COUNT(*)", "count")
      .where(
        fromDate && toDate
          ? "dblog.timestamp BETWEEN :fromDate AND :toDate"
          : "1=1",
        {
          fromDate,
          toDate,
        },
      )
      .groupBy(
        "CASE " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'SELECT' THEN 'SELECT' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'INSERT' THEN 'INSERT' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'UPDATE' THEN 'UPDATE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'DELETE' THEN 'DELETE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 6)) = 'CREATE' THEN 'CREATE' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 5)) = 'ALTER' THEN 'ALTER' " +
          "WHEN UPPER(LEFT(TRIM(dblog.query), 4)) = 'DROP' THEN 'DROP' " +
          "ELSE 'OTHER' END",
      )
      .orderBy("COUNT(*)", "DESC")
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          operation: result.operation,
          count: parseInt(result.count),
        })),
      );

    return {
      totalQueries,
      uniquePages,
      uniqueUsers,
      topPages,
      topQueries,
      sqlOperations,
    };
  }

  /**
   * Bulk insert for migration
   */
  async bulkInsert(
    queryLogs: Partial<DatabaseQueryLogEntity>[],
  ): Promise<void> {
    const chunkSize = 1000;
    for (let i = 0; i < queryLogs.length; i += chunkSize) {
      const chunk = queryLogs.slice(i, i + chunkSize);
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(DatabaseQueryLogEntity)
        .values(chunk)
        .orIgnore()
        .execute();
    }
  }

  /**
   * Create filtered query builder with common filters
   */
  private createFilteredQuery(
    query: SelectQueryBuilder<DatabaseQueryLogEntity>,
    filters: FilterDatabaseQueryLogDto,
  ): SelectQueryBuilder<DatabaseQueryLogEntity> {
    // User filters
    if (filters.userId) {
      query.andWhere("dblog.userId = :userId", { userId: filters.userId });
    }


    // Query filters
    if (filters.query) {
      query.andWhere("LOWER(dblog.query) LIKE LOWER(:query)", {
        query: `%${filters.query}%`,
      });
    }

    if (filters.queryContains) {
      query.andWhere("LOWER(dblog.query) LIKE LOWER(:queryContains)", {
        queryContains: `%${filters.queryContains}%`,
      });
    }

    if (filters.sqlOperation) {
      query.andWhere("UPPER(LEFT(TRIM(dblog.query), :opLength)) = :operation", {
        opLength: filters.sqlOperation.length,
        operation: filters.sqlOperation.toUpperCase(),
      });
    }

    // Page filters
    if (filters.page) {
      query.andWhere("dblog.page = :page", { page: filters.page });
    }

    if (filters.pageContains) {
      query.andWhere("LOWER(dblog.page) LIKE LOWER(:pageContains)", {
        pageContains: `%${filters.pageContains}%`,
      });
    }

    // Backtrace filters
    if (filters.backtraceContains) {
      query.andWhere("LOWER(dblog.backtrace) LIKE LOWER(:backtraceContains)", {
        backtraceContains: `%${filters.backtraceContains}%`,
      });
    }

    // Date filters
    if (filters.timestampFrom) {
      query.andWhere("dblog.timestamp >= :timestampFrom", {
        timestampFrom: new Date(filters.timestampFrom),
      });
    }

    if (filters.timestampTo) {
      query.andWhere("dblog.timestamp <= :timestampTo", {
        timestampTo: new Date(filters.timestampTo),
      });
    }

    if (filters.date) {
      const dateStart = new Date(filters.date);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      query.andWhere(
        "dblog.timestamp >= :dateStart AND dblog.timestamp < :dateEnd",
        {
          dateStart,
          dateEnd,
        },
      );
    }

    // Potentially slow queries
    if (filters.potentiallySlow) {
      query.andWhere(
        "(LOWER(dblog.query) LIKE '%select * from%' OR " +
          "LOWER(dblog.query) LIKE '%join%join%' OR " +
          "LOWER(dblog.query) LIKE '%order by%limit%' OR " +
          "LOWER(dblog.query) LIKE '%group by%having%')",
      );
    }

    return query;
  }
}

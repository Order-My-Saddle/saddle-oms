import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { DatabaseQueryLogRepository } from "./infrastructure/persistence/relational/repositories/database-query-log.repository";
import { DatabaseQueryLogEntity } from "./infrastructure/persistence/relational/entities/database-query-log.entity";
import { CreateDatabaseQueryLogDto } from "./dto/create-database-query-log.dto";
import { DatabaseQueryLogDto } from "./dto/database-query-log.dto";
import { QueryDatabaseQueryLogDto } from "./dto/query-database-query-log.dto";
import { PaginatedResponseDto } from "../common/dto/base-query.dto";
import { plainToInstance } from "class-transformer";

/**
 * DatabaseQueryLog Application Service
 *
 * Handles database query logging for performance analysis and debugging.
 * Optimized for search, filtering, and analysis of 74K+ query records.
 */
@Injectable()
export class DatabaseQueryLogService {
  private readonly logger = new Logger(DatabaseQueryLogService.name);

  constructor(
    private readonly queryLogRepository: DatabaseQueryLogRepository,
  ) {}

  /**
   * Create a new database query log entry
   * Used both for new query logging and legacy data migration
   */
  async create(
    createQueryLogDto: CreateDatabaseQueryLogDto,
  ): Promise<DatabaseQueryLogDto> {
    try {
      const queryLogEntity = this.createEntityFromDto(createQueryLogDto);
      const savedEntity = await this.queryLogRepository.save(queryLogEntity);

      this.logger.debug(
        `Created database query log entry: ${savedEntity.id} for user ${savedEntity.userId}`,
      );

      return this.toDto(savedEntity);
    } catch (error) {
      this.logger.error(
        `Failed to create database query log: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        "Failed to create database query log entry",
      );
    }
  }

  /**
   * Find database query log by ID
   */
  async findOne(id: number): Promise<DatabaseQueryLogDto> {
    const queryLog = await this.queryLogRepository.findById(id);

    if (!queryLog) {
      throw new NotFoundException("Database query log entry not found");
    }

    return this.toDto(queryLog);
  }

  /**
   * Search database query logs with high-performance filtering and pagination
   * Optimized for handling large datasets (74K+ records)
   */
  async findAll(
    queryDto: QueryDatabaseQueryLogDto,
  ): Promise<PaginatedResponseDto<DatabaseQueryLogDto>> {
    try {
      this.logger.debug(
        `Searching database query logs with filters: ${JSON.stringify(queryDto.getDatabaseQueryLogFilters())}`,
      );

      const result = await this.queryLogRepository.findManyWithQuery(queryDto);

      // Convert entities to DTOs with enhanced data
      const dtos = result.data.map((entity) => this.toEnhancedDto(entity));

      return {
        data: dtos,
        meta: result.meta,
      };
    } catch (error) {
      this.logger.error(
        `Failed to search database query logs: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to search database query logs");
    }
  }

  /**
   * Get query logs for a specific user
   * Useful for debugging user-specific performance issues
   */
  async getUserQueryLogs(
    userId: number,
    page = 1,
    limit = 100,
  ): Promise<PaginatedResponseDto<DatabaseQueryLogDto>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.queryLogRepository.findByUserId(
        userId,
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toEnhancedDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get query logs for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get user query logs");
    }
  }

  /**
   * Get query logs for a specific page/endpoint
   * Essential for page-specific performance analysis
   */
  async getPageQueryLogs(
    page: string,
    pageNum = 1,
    limit = 100,
  ): Promise<PaginatedResponseDto<DatabaseQueryLogDto>> {
    try {
      const offset = (pageNum - 1) * limit;
      const result = await this.queryLogRepository.findByPage(
        page,
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toEnhancedDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page: pageNum,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: pageNum < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get query logs for page ${page}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get page query logs");
    }
  }

  /**
   * Get potentially slow queries
   * Critical for performance optimization
   */
  async getPotentiallySlowQueries(
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<DatabaseQueryLogDto>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.queryLogRepository.findPotentiallySlowQueries(
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toEnhancedDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get potentially slow queries: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get potentially slow queries");
    }
  }

  /**
   * Get query statistics for performance dashboard
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
    try {
      return await this.queryLogRepository.getQueryStatistics(fromDate, toDate);
    } catch (error) {
      this.logger.error(
        `Failed to get query statistics: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get query statistics");
    }
  }

  /**
   * Analyze query performance patterns
   * Advanced analysis for optimization insights
   */
  async analyzeQueryPatterns(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    statistics: any;
    recommendations: string[];
    performanceInsights: Array<{
      category: string;
      finding: string;
      impact: "high" | "medium" | "low";
      recommendation: string;
    }>;
  }> {
    try {
      const stats = await this.getQueryStatistics(fromDate, toDate);

      // Analyze patterns and generate recommendations
      const recommendations: string[] = [];
      const performanceInsights: Array<{
        category: string;
        finding: string;
        impact: "low" | "medium" | "high";
        recommendation: string;
      }> = [];

      // Check for SELECT * queries
      const selectAllQueries = stats.topQueries.filter((q) =>
        q.query.toLowerCase().includes("select *"),
      );
      if (selectAllQueries.length > 0) {
        recommendations.push(
          "Avoid SELECT * queries - specify only needed columns",
        );
        performanceInsights.push({
          category: "Query Optimization",
          finding: `Found ${selectAllQueries.length} queries using SELECT *`,
          impact: "medium" as const,
          recommendation:
            "Replace SELECT * with specific column names to improve performance",
        });
      }

      // Check for missing indexes (heavy JOIN usage)
      const joinHeavyQueries = stats.topQueries.filter(
        (q) => (q.query.toLowerCase().match(/join/g) || []).length > 2,
      );
      if (joinHeavyQueries.length > 0) {
        recommendations.push(
          "Consider adding indexes for heavy JOIN operations",
        );
        performanceInsights.push({
          category: "Indexing",
          finding: `Found ${joinHeavyQueries.length} queries with multiple JOINs`,
          impact: "high" as const,
          recommendation:
            "Review and optimize indexes for frequently joined tables",
        });
      }

      // Check for high-volume pages
      const highVolumePages = stats.topPages.filter(
        (p) => p.count > stats.totalQueries * 0.1,
      );
      if (highVolumePages.length > 0) {
        recommendations.push("Consider caching for high-volume endpoints");
        performanceInsights.push({
          category: "Caching",
          finding: `Found ${highVolumePages.length} high-volume pages generating many queries`,
          impact: "high" as const,
          recommendation:
            "Implement query result caching for frequently accessed endpoints",
        });
      }

      return {
        statistics: stats,
        recommendations,
        performanceInsights,
      };
    } catch (error) {
      this.logger.error(
        `Failed to analyze query patterns: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to analyze query patterns");
    }
  }

  /**
   * Bulk create database query logs for migration
   * Optimized for importing 74K+ legacy records
   */
  async bulkCreate(
    createQueryLogDtos: CreateDatabaseQueryLogDto[],
  ): Promise<{ created: number; skipped: number }> {
    try {
      this.logger.log(
        `Starting bulk creation of ${createQueryLogDtos.length} database query log entries`,
      );

      const entities = createQueryLogDtos.map((dto) =>
        this.createEntityFromDto(dto),
      );
      await this.queryLogRepository.bulkInsert(entities);

      this.logger.log(
        `Successfully bulk created ${createQueryLogDtos.length} database query log entries`,
      );

      return {
        created: createQueryLogDtos.length,
        skipped: 0, // Repository handles deduplication
      };
    } catch (error) {
      this.logger.error(
        `Failed to bulk create database query logs: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        "Failed to bulk create database query logs",
      );
    }
  }

  /**
   * Log a new database query (convenience method for real-time logging)
   */
  async logQuery(
    query: string,
    userId: number,
    page: string,
    backtrace: string,
  ): Promise<DatabaseQueryLogDto> {
    const createDto: CreateDatabaseQueryLogDto = {
      query,
      userId,
      timestamp: new Date().toISOString(),
      page,
      backtrace,
    };

    return this.create(createDto);
  }

  /**
   * Convert DTO to entity
   */
  private createEntityFromDto(
    createDto: CreateDatabaseQueryLogDto,
  ): DatabaseQueryLogEntity {
    const entity = new DatabaseQueryLogEntity();
    entity.query = createDto.query;
    entity.userId = createDto.userId;
    entity.timestamp = new Date(createDto.timestamp);
    entity.page = createDto.page;
    entity.backtrace = createDto.backtrace;

    return entity;
  }

  /**
   * Convert entity to DTO
   */
  private toDto(entity: DatabaseQueryLogEntity): DatabaseQueryLogDto {
    return plainToInstance(DatabaseQueryLogDto, {
      id: entity.id,
      query: entity.query,
      userId: entity.userId,
      timestamp:
        entity.timestamp instanceof Date
          ? entity.timestamp.toISOString()
          : entity.timestamp,
      page: entity.page,
      backtrace: entity.backtrace,
      createdAt:
        entity.createdAt instanceof Date
          ? entity.createdAt.toISOString()
          : entity.createdAt,
    });
  }

  /**
   * Convert entity to enhanced DTO with additional analysis
   */
  private toEnhancedDto(entity: DatabaseQueryLogEntity): DatabaseQueryLogDto {
    const dto = this.toDto(entity);

    // Add query truncation for display
    if (entity.query.length > 200) {
      dto.queryTruncated = entity.query.substring(0, 200) + "...";
    }

    // Estimate execution time based on query complexity (placeholder logic)
    const queryComplexity = this.analyzeQueryComplexity(entity.query);
    if (queryComplexity > 0) {
      dto.executionTimeMs = queryComplexity * 10; // Rough estimate
    }

    return dto;
  }

  /**
   * Analyze query complexity for performance estimation
   */
  private analyzeQueryComplexity(query: string): number {
    const lowerQuery = query.toLowerCase();
    let complexity = 1;

    // Add complexity for JOINs
    const joinCount = (lowerQuery.match(/join/g) || []).length;
    complexity += joinCount * 2;

    // Add complexity for subqueries
    const subqueryCount = (lowerQuery.match(/\(/g) || []).length;
    complexity += subqueryCount;

    // Add complexity for ORDER BY
    if (lowerQuery.includes("order by")) {
      complexity += 1;
    }

    // Add complexity for GROUP BY
    if (lowerQuery.includes("group by")) {
      complexity += 2;
    }

    // Add complexity for SELECT *
    if (lowerQuery.includes("select *")) {
      complexity += 1;
    }

    return complexity;
  }
}

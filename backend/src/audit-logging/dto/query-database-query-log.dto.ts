import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  ValidateNested,
  Min,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

/**
 * Filter DTO for database query log searches
 * Optimized for debugging and performance analysis
 */
export class FilterDatabaseQueryLogDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by user ID who triggered queries",
    example: 54321,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: "Filter by query text (partial match, case-insensitive)",
    example: "SELECT * FROM orders",
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: "Filter by query containing specific SQL keywords",
    example: "JOIN",
  })
  @IsOptional()
  @IsString()
  queryContains?: string;

  @ApiPropertyOptional({
    description: "Filter by page/endpoint that triggered queries",
    example: "/api/orders",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: "Filter by page containing specific path",
    example: "orders",
  })
  @IsOptional()
  @IsString()
  pageContains?: string;

  @ApiPropertyOptional({
    description: "Filter by timestamp range start (ISO 8601)",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  timestampFrom?: string;

  @ApiPropertyOptional({
    description: "Filter by timestamp range end (ISO 8601)",
    example: "2024-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  timestampTo?: string;

  @ApiPropertyOptional({
    description: "Filter by date (YYYY-MM-DD) - searches entire day",
    example: "2024-01-15",
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: "Filter by backtrace containing specific text",
    example: "OrderService",
  })
  @IsOptional()
  @IsString()
  backtraceContains?: string;

  @ApiPropertyOptional({
    description: "Filter by SQL operation type",
    enum: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"],
    example: "SELECT",
  })
  @IsOptional()
  @IsString()
  sqlOperation?:
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE"
    | "CREATE"
    | "ALTER"
    | "DROP";

  @ApiPropertyOptional({
    description: "Filter queries that might be slow (contain certain patterns)",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  potentiallySlow?: boolean;
}

/**
 * Sort DTO for database query log searches
 */
export class SortDatabaseQueryLogDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["timestamp", "userId", "page", "query", "createdAt"],
    example: "timestamp",
  })
  field: "timestamp" | "userId" | "page" | "query" | "createdAt";
}

/**
 * Complete query DTO for database query log searches
 * Optimized for handling 74K+ database query records with high performance
 */
export class QueryDatabaseQueryLogDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Database query log specific filters",
    type: FilterDatabaseQueryLogDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterDatabaseQueryLogDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterDatabaseQueryLogDto)
  filters?: FilterDatabaseQueryLogDto;

  @ApiPropertyOptional({
    description: "Database query log specific sorting",
    type: [SortDatabaseQueryLogDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortDatabaseQueryLogDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortDatabaseQueryLogDto)
  sort?: SortDatabaseQueryLogDto[];

  /**
   * Get parsed database query log specific filters
   */
  getDatabaseQueryLogFilters(): FilterDatabaseQueryLogDto {
    return this.filters || new FilterDatabaseQueryLogDto();
  }

  /**
   * Get parsed database query log specific sorting (default: timestamp desc)
   */
  getDatabaseQueryLogSort(): SortDatabaseQueryLogDto[] {
    return this.sort || [{ field: "timestamp", direction: "desc" }];
  }

  /**
   * Generate cache key for database query log queries
   */
  getDatabaseQueryLogCacheKey(): string {
    return this.getCacheKey("db_query_log");
  }
}

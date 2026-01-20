import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

/**
 * Filter DTO for audit log queries with performance-optimized search
 * Supports common audit trail analysis patterns
 */
export class FilterAuditLogDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by user ID who performed actions",
    example: 54321,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: "Filter by user type (1=Admin, 2=Fitter, 3=Customer, etc.)",
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  userType?: number;

  @ApiPropertyOptional({
    description: "Filter by order ID",
    example: 67890,
  })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({
    description: "Filter by action text (partial match)",
    example: "Order status changed",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: "Filter by actions containing this text",
    example: "status changed",
  })
  @IsOptional()
  @IsString()
  actionContains?: string;

  @ApiPropertyOptional({
    description: "Filter by previous order status",
    example: 1,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  orderStatusFrom?: number;

  @ApiPropertyOptional({
    description: "Filter by new order status",
    example: 2,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  orderStatusTo?: number;

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
    description: "Filter logs only with order associations",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  hasOrder?: boolean;

  @ApiPropertyOptional({
    description: "Filter logs for status change actions only",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  isStatusChange?: boolean;
}

/**
 * Sort DTO for audit log queries optimized for large datasets
 */
export class SortAuditLogDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: [
      "timestamp",
      "action",
      "userId",
      "userType",
      "orderId",
      "orderStatusFrom",
      "orderStatusTo",
      "createdAt",
    ],
    example: "timestamp",
  })
  field:
    | "timestamp"
    | "action"
    | "userId"
    | "userType"
    | "orderId"
    | "orderStatusFrom"
    | "orderStatusTo"
    | "createdAt";
}

/**
 * Complete query DTO for audit log searches
 * Optimized for handling 764K+ audit records with high performance
 */
export class QueryAuditLogDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Audit log specific filters",
    type: FilterAuditLogDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterAuditLogDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAuditLogDto)
  filters?: FilterAuditLogDto;

  @ApiPropertyOptional({
    description: "Audit log specific sorting",
    type: [SortAuditLogDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortAuditLogDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortAuditLogDto)
  sort?: SortAuditLogDto[];

  /**
   * Get parsed audit log specific filters
   */
  getAuditLogFilters(): FilterAuditLogDto {
    return this.filters || new FilterAuditLogDto();
  }

  /**
   * Get parsed audit log specific sorting (default: timestamp desc)
   */
  getAuditLogSort(): SortAuditLogDto[] {
    return this.sort || [{ field: "timestamp", direction: "desc" }];
  }

  /**
   * Generate cache key for audit log queries
   */
  getAuditLogCacheKey(): string {
    return this.getCacheKey("audit_log");
  }
}

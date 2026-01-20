import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

/**
 * Standard sort directive for legacy compatibility
 */
export class SortDto {
  @ApiPropertyOptional({
    description: "Field name to sort by",
    example: "name",
  })
  @IsString()
  field: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    enum: ["asc", "desc"],
    example: "asc",
  })
  @IsString()
  direction: "asc" | "desc";
}

/**
 * Base DTO for all entity queries with standard REST query support
 */
export abstract class BaseQueryDto {
  /**
   * Legacy pagination - page number (1-based)
   */
  @ApiPropertyOptional({
    description: "Page number for pagination (1-based)",
    example: 1,
    minimum: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  /**
   * Legacy pagination - items per page
   */
  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 25,
    minimum: 1,
    maximum: 1000,
  })
  @Transform(({ value }) => (value ? Number(value) : 25))
  @IsNumber()
  @IsOptional()
  limit?: number = 25;

  /**
   * Legacy sort configuration
   */
  @ApiPropertyOptional({
    description: "Legacy sort configuration array",
    example: [{ field: "name", direction: "asc" }],
    type: [SortDto],
  })
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  @IsOptional()
  sort?: SortDto[];

  /**
   * Legacy filters object for backward compatibility
   */
  @ApiPropertyOptional({
    description: "Legacy filters object",
    example: { name: "John", active: true },
  })
  @IsOptional()
  filters?: Record<string, any>;

  /**
   * Filter expression (simplified query syntax)
   * Example: "name eq 'John' and age gt 25"
   */
  @ApiPropertyOptional({
    description: "Filter expression for querying",
    example: "name eq 'John Smith' and active eq true",
  })
  @IsOptional()
  @IsString()
  filter?: string;

  /**
   * Ordering expression
   * Example: "name asc, createdAt desc"
   */
  @ApiPropertyOptional({
    description: "Ordering expression",
    example: "name asc, createdAt desc",
  })
  @IsOptional()
  @IsString()
  orderby?: string;

  /**
   * Skip (number of items to skip)
   */
  @ApiPropertyOptional({
    description: "Number of items to skip for pagination",
    example: 0,
    minimum: 0,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  skip?: number;

  /**
   * Take (number of items to return)
   */
  @ApiPropertyOptional({
    description: "Number of items to return",
    example: 25,
    minimum: 1,
    maximum: 1000,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  take?: number;

  /**
   * Select fields
   * Example: "name,email,createdAt"
   */
  @ApiPropertyOptional({
    description: "Comma-separated list of fields to select",
    example: "id,name,email,createdAt",
  })
  @IsOptional()
  @IsString()
  select?: string;

  /**
   * Include related entities
   * Example: "orders,customer,fitter"
   */
  @ApiPropertyOptional({
    description: "Comma-separated list of relations to include",
    example: "orders,customer,fitter",
  })
  @IsOptional()
  @IsString()
  include?: string;

  /**
   * Search term for full-text search (custom extension)
   */
  @ApiPropertyOptional({
    description: "Search term for full-text search across searchable fields",
    example: "John Smith",
  })
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Row-level security context (populated by auth middleware)
   */
  rls?: {
    userId?: string;
    role?: string;
    scopeType?: "user" | "fitter" | "supplier" | "admin";
    scopeId?: string;
  };

  /**
   * Get effective pagination parameters
   */
  getEffectivePagination(): {
    skip: number;
    take: number;
    page: number;
    limit: number;
  } {
    const limit = this.take || this.limit || 25;
    const skip =
      this.skip !== undefined ? this.skip : ((this.page || 1) - 1) * limit;
    const page = this.page || Math.floor(skip / limit) + 1;

    return {
      skip,
      take: limit,
      page,
      limit,
    };
  }

  /**
   * Parse filters from either legacy filters object or filter string
   */
  getParsedFilters(): Record<string, any> {
    const parsedFilters: Record<string, any> = {};

    // Include legacy filters
    if (this.filters) {
      Object.assign(parsedFilters, this.filters);
    }

    // Parse filter string if present (simplified parsing for common cases)
    if (this.filter) {
      const filterPairs = this.filter.split(" and ");
      for (const pair of filterPairs) {
        const match = pair.trim().match(/(\w+)\s+eq\s+['"]?([^'"]+)['"]?/);
        if (match) {
          const [, field, value] = match;
          parsedFilters[field] = value;
        }
      }
    }

    return parsedFilters;
  }

  /**
   * Get select fields as array
   */
  getSelectFields(): string[] | undefined {
    if (!this.select) return undefined;
    return this.select.split(",").map((field) => field.trim());
  }

  /**
   * Generate cache key for this query
   */
  getCacheKey(prefix: string): string {
    const pagination = this.getEffectivePagination();
    const filters = this.getParsedFilters();
    const selectFields = this.getSelectFields();

    const keyParts = [
      prefix,
      `page:${pagination.page}`,
      `limit:${pagination.limit}`,
      this.orderby ? `order:${this.orderby}` : "",
      this.search ? `search:${this.search}` : "",
      Object.keys(filters).length ? `filters:${JSON.stringify(filters)}` : "",
      selectFields ? `select:${selectFields.join(",")}` : "",
    ].filter(Boolean);

    return keyParts.join(":");
  }
}

/**
 * Base filter DTO with common fields for all entities
 */
export abstract class BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by active/inactive status",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  active?: boolean;

  @ApiPropertyOptional({
    description: "Filter by creation date (ISO string)",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({
    description: "Filter by update date (ISO string)",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ApiPropertyOptional({
    description: "Filter by creator user ID",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({
    description: "Filter by updater user ID",
    example: "uuid-string",
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

/**
 * Query response metadata
 */
export class QueryMetadataDto {
  @ApiPropertyOptional({
    description: "Total number of items matching the query",
    example: 150,
  })
  total: number;

  @ApiPropertyOptional({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 25,
  })
  limit: number;

  @ApiPropertyOptional({
    description: "Whether there is a next page",
    example: true,
  })
  hasNextPage: boolean;

  @ApiPropertyOptional({
    description: "Total number of pages",
    example: 6,
  })
  totalPages: number;

  @ApiPropertyOptional({
    description: "Number of items in current response",
    example: 25,
  })
  count: number;
}

/**
 * Standard paginated response DTO
 */
export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({
    description: "Array of data items",
    isArray: true,
  })
  data: T[];

  @ApiPropertyOptional({
    description: "Pagination and query metadata",
    type: QueryMetadataDto,
  })
  meta: QueryMetadataDto;

  @ApiPropertyOptional({
    description: "Links for navigation (HATEOAS)",
    example: {
      self: "/api/users?page=2&limit=25",
      first: "/api/users?page=1&limit=25",
      prev: "/api/users?page=1&limit=25",
      next: "/api/users?page=3&limit=25",
      last: "/api/users?page=6&limit=25",
    },
  })
  links?: {
    self?: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

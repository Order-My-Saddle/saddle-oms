import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsPositive,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Query OrderProductSaddle Data Transfer Object
 *
 * Defines the query parameters for filtering and pagination of order-product-saddle relationships
 */
export class QueryOrderProductSaddleDto {
  @ApiPropertyOptional({
    description: "Filter by Order ID",
    example: 1001,
    type: "integer",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  orderId?: number;

  @ApiPropertyOptional({
    description: "Filter by Product ID",
    example: 500,
    type: "integer",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId?: number;

  @ApiPropertyOptional({
    description: "Filter by serial number",
    example: "SN-2024-001234",
  })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({
    description: "Page number for pagination (1-based)",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "sequence",
    enum: ["sequence", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    example: "ASC",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";

  /**
   * Get page number with default
   */
  getPage(): number {
    return this.page && this.page > 0 ? this.page : 1;
  }

  /**
   * Get limit with default
   */
  getLimit(): number {
    return this.limit && this.limit > 0 ? this.limit : 50;
  }

  /**
   * Get offset for database query
   */
  getOffset(): number {
    return (this.getPage() - 1) * this.getLimit();
  }

  /**
   * Get sort field with default
   */
  getSortBy(): string {
    return this.sortBy || "sequence";
  }

  /**
   * Get sort order with default
   */
  getSortOrder(): "ASC" | "DESC" {
    return this.sortOrder || "ASC";
  }
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Query Comment Data Transfer Object
 *
 * Defines filtering and pagination options for comment queries.
 * Uses INTEGER IDs to match current schema.
 */
export class QueryCommentDto {
  @ApiProperty({
    description: "Filter by order ID",
    example: 12345,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  orderId?: number;

  @ApiProperty({
    description: "Filter by user ID",
    example: 42,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: "Filter by comment type",
    example: "customer",
    enum: ["general", "production", "customer", "internal", "status_change"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["general", "production", "customer", "internal", "status_change"])
  type?: string;

  @ApiProperty({
    description: "Filter by internal visibility",
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  @IsBoolean()
  isInternal?: boolean;

  @ApiProperty({
    description: "Page number for pagination (1-based)",
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 20))
  limit?: number;

  @ApiProperty({
    description: "Sort by field (e.g., 'created_at', 'type')",
    example: "created_at",
    required: false,
    default: "created_at",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "Sort order",
    example: "DESC",
    enum: ["ASC", "DESC"],
    required: false,
    default: "DESC",
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";

  /**
   * Get repository-compatible filter object
   */
  getRepositoryFilters() {
    return {
      orderId: this.orderId,
      userId: this.userId,
      type: this.type,
      isInternal: this.isInternal,
      page: this.page || 1,
      limit: this.limit || 20,
      sortBy: this.sortBy || "created_at",
      sortOrder: this.sortOrder || "DESC",
    };
  }
}

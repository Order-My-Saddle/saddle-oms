import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
  Length,
} from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Advanced Order Search DTO
 *
 * Provides comprehensive search criteria for orders with performance optimizations
 * targeting <100ms response times for production scale (2.9M records)
 */
export class OrderSearchDto {
  @ApiPropertyOptional({
    description: "Customer name (partial match with full-text search)",
    example: "John Smith",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  customer?: string;

  @ApiPropertyOptional({
    description: "Order ID (exact match with legacy ID support)",
    example: 12345,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Order ID must be a number" })
  @IsInt({ message: "Order ID must be an integer" })
  @Min(1, { message: "Order ID must be positive" })
  orderId?: number;

  @ApiPropertyOptional({
    description: "Order number (exact match)",
    example: "ORD-2023-001234",
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  orderNumber?: string;

  @ApiPropertyOptional({
    description: "Seat size ID in JSON array",
    example: "size-17-5",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  seatSizeId?: string;

  @ApiPropertyOptional({
    description: "Filter by urgency flag",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "isUrgent must be a boolean" })
  isUrgent?: boolean;

  @ApiPropertyOptional({
    description: "Saddle type/model ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID("4", { message: "Saddle ID must be a valid UUID" })
  saddleId?: string;

  @ApiPropertyOptional({
    description: "Assigned fitter ID",
    example: "789e0123-e45b-67c8-d901-234567890abc",
  })
  @IsOptional()
  @IsUUID("4", { message: "Fitter ID must be a valid UUID" })
  fitterId?: string;

  @ApiPropertyOptional({
    description: "Assigned factory ID",
    example: "456e7890-b12c-34d5-e678-901234567def",
  })
  @IsOptional()
  @IsUUID("4", { message: "Factory ID must be a valid UUID" })
  factoryId?: string;

  @ApiPropertyOptional({
    description: "Customer ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID("4", { message: "Customer ID must be a valid UUID" })
  customerId?: string;

  @ApiPropertyOptional({
    description: "Order status",
    example: "in_production",
    enum: [
      "pending",
      "confirmed",
      "in_production",
      "completed",
      "cancelled",
      "on_hold",
    ],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Order priority",
    example: "high",
    enum: ["low", "normal", "high", "urgent"],
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: "Date range start (ISO 8601)",
    example: "2023-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "dateFrom must be a valid ISO 8601 date string" },
  )
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "Date range end (ISO 8601)",
    example: "2023-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString({}, { message: "dateTo must be a valid ISO 8601 date string" })
  dateTo?: string;

  @ApiPropertyOptional({
    description: "Page number for pagination (1-based)",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of results per page (max 100)",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit cannot exceed 100 for performance reasons" })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "createdAt",
    enum: [
      "createdAt",
      "updatedAt",
      "orderNumber",
      "totalAmount",
      "estimatedDeliveryDate",
      "customerName",
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Sort direction",
    example: "DESC",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";

  /**
   * Get offset for pagination
   */
  getOffset(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  /**
   * Get limit for pagination
   */
  getLimit(): number {
    return Math.min(this.limit || 20, 100);
  }

  /**
   * Check if any search criteria is provided
   */
  hasSearchCriteria(): boolean {
    return !!(
      this.customer ||
      this.orderId ||
      this.orderNumber ||
      this.seatSizeId ||
      this.isUrgent !== undefined ||
      this.saddleId ||
      this.fitterId ||
      this.factoryId ||
      this.customerId ||
      this.status ||
      this.priority ||
      this.dateFrom ||
      this.dateTo
    );
  }
}

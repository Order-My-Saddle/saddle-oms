import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Filter Order Data Transfer Object
 *
 * Defines filtering options for order queries
 */
export class FilterOrderDto {
  @ApiProperty({
    description: "Filter by customer ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({
    description: "Filter by fitter ID",
    example: "789e0123-e45b-67c8-d901-234567890abc",
    required: false,
  })
  @IsOptional()
  @IsString()
  fitterId?: string;

  @ApiProperty({
    description: "Filter by factory ID",
    example: "456e7890-b12c-34d5-e678-901234567def",
    required: false,
  })
  @IsOptional()
  @IsString()
  factoryId?: string;

  @ApiProperty({
    description: "Filter by order status",
    example: "pending",
    enum: [
      "pending",
      "confirmed",
      "in_production",
      "quality_control",
      "ready_for_shipping",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    "pending",
    "confirmed",
    "in_production",
    "quality_control",
    "ready_for_shipping",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ])
  status?: string;

  @ApiProperty({
    description: "Filter by multiple statuses",
    example: ["pending", "confirmed"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim());
    }
    return value;
  })
  statuses?: string[];

  @ApiProperty({
    description: "Filter by order priority",
    example: "urgent",
    enum: ["low", "normal", "high", "urgent", "critical"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["low", "normal", "high", "urgent", "critical"])
  priority?: string;

  @ApiProperty({
    description: "Filter by urgent status",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  isUrgent?: boolean;

  @ApiProperty({
    description: "Filter by overdue status",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  overdue?: boolean;

  @ApiProperty({
    description: "Filter orders created from this date",
    example: "2024-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateFrom?: Date;

  @ApiProperty({
    description: "Filter orders created to this date",
    example: "2024-12-31",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateTo?: Date;

  @ApiProperty({
    description: "Filter by order number (partial match)",
    example: "ORD-2024",
    required: false,
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({
    description: "Search term for general text search",
    example: "dressage saddle",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: "Filter by saddle brand",
    example: "Prestige",
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: "Filter by saddle model",
    example: "Dressage",
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    description: "Filter orders requiring deposit",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  requiresDeposit?: boolean;

  // Legacy boolean flag filters
  @ApiProperty({
    description: "Filter by rushed orders (legacy)",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  rushed?: boolean;

  @ApiProperty({
    description: "Filter by repair orders",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  repair?: boolean;

  @ApiProperty({
    description: "Filter by demo orders",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  demo?: boolean;

  @ApiProperty({
    description: "Filter by sponsored orders",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  sponsored?: boolean;

  @ApiProperty({
    description: "Filter by fitter stock orders",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  fitterStock?: boolean;

  @ApiProperty({
    description: "Filter by custom orders",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  customOrder?: boolean;
}

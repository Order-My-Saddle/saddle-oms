import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Create OrderProductSaddle Data Transfer Object
 *
 * Defines the required data for creating a new order-product-saddle relationship
 */
export class CreateOrderProductSaddleDto {
  @ApiProperty({
    description: "Order ID",
    example: 1001,
    type: "integer",
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  orderId: number;

  @ApiProperty({
    description: "Product (Saddle) ID",
    example: 500,
    type: "integer",
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiPropertyOptional({
    description: "Serial number for this product",
    example: "SN-2024-001234",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({
    description: "Product configuration options (JSON)",
    example: {
      seatSize: "17.5",
      leather: "Calfskin Brown",
      flap: "Long",
      panel: "Standard",
      extras: ["Extra padding", "Stirrup bars"],
    },
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Quantity of this product in the order",
    example: 1,
    minimum: 1,
    maximum: 999,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity?: number;

  @ApiPropertyOptional({
    description: "Additional notes for this product",
    example: "Customer requested extra stitching on the flap",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: "Sequence/order number for multiple products in an order",
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

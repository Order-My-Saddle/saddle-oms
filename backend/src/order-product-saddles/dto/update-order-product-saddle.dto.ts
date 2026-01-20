import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from "class-validator";

/**
 * Update OrderProductSaddle Data Transfer Object
 *
 * Defines the fields that can be updated for an order-product-saddle relationship
 * All fields are optional, orderId and productId cannot be changed
 */
export class UpdateOrderProductSaddleDto {
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
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  IsString,
} from "class-validator";

/**
 * Create OrderLine Data Transfer Object
 *
 * Defines the required data for creating a new order line item
 */
export class CreateOrderLineDto {
  @ApiProperty({
    description: "Order ID this line belongs to",
    example: 123,
  })
  @IsNotEmpty()
  @IsInt()
  orderId: number;

  @ApiProperty({
    description: "Product ID for this line item",
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({
    description: "Quantity of the product",
    example: 2,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: "Unit price for the product",
    example: 250.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: "Total price (quantity * unit price)",
    example: 500.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({
    description: "Additional notes for this line item",
    example: "Custom engraving requested",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Sequence order for display",
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;
}

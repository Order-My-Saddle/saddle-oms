import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, Min, IsInt, IsString } from "class-validator";

/**
 * Update OrderLine Data Transfer Object
 *
 * Defines the data that can be updated for an existing order line item
 */
export class UpdateOrderLineDto {
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
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: "Unit price for the product",
    example: 275.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({
    description: "Total price (quantity * unit price)",
    example: 825.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiProperty({
    description: "Additional notes for this line item",
    example: "Updated custom engraving text",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Sequence order for display",
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sequence?: number;
}

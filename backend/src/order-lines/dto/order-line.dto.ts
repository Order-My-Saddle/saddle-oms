import { ApiProperty } from "@nestjs/swagger";

/**
 * OrderLine Data Transfer Object
 *
 * Represents an order line item in API responses
 */
export class OrderLineDto {
  @ApiProperty({
    description: "Order line unique identifier",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Order ID this line belongs to",
    example: 123,
  })
  orderId: number;

  @ApiProperty({
    description: "Product ID for this line item",
    example: 456,
    nullable: true,
  })
  productId: number | null;

  @ApiProperty({
    description: "Quantity of the product",
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: "Unit price for the product",
    example: 250.0,
  })
  unitPrice: number;

  @ApiProperty({
    description: "Total price (quantity * unit price)",
    example: 500.0,
  })
  totalPrice: number;

  @ApiProperty({
    description: "Additional notes for this line item",
    example: "Custom engraving requested",
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: "Sequence order for display",
    example: 1,
  })
  sequence: number;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-15T14:20:00Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Soft deletion timestamp",
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}

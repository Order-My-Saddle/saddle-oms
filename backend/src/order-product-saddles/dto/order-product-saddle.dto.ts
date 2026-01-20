import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * OrderProductSaddle Data Transfer Object
 *
 * Response DTO for order-product-saddle relationships
 */
export class OrderProductSaddleDto {
  @ApiProperty({
    description: "Unique identifier",
    example: 12345,
    type: "integer",
  })
  id: number;

  @ApiProperty({
    description: "Order ID",
    example: 1001,
    type: "integer",
  })
  orderId: number;

  @ApiProperty({
    description: "Product (Saddle) ID",
    example: 500,
    type: "integer",
  })
  productId: number;

  @ApiPropertyOptional({
    description: "Serial number for this product",
    example: "SN-2024-001234",
  })
  serial?: string | null;

  @ApiPropertyOptional({
    description: "Product configuration options",
    example: {
      seatSize: "17.5",
      leather: "Calfskin Brown",
      flap: "Long",
    },
  })
  configuration?: Record<string, any> | null;

  @ApiProperty({
    description: "Quantity of this product in the order",
    example: 1,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: "Additional notes for this product",
    example: "Customer requested extra stitching on the flap",
  })
  notes?: string | null;

  @ApiProperty({
    description: "Sequence/order number for multiple products in an order",
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

  @ApiPropertyOptional({
    description: "Soft delete timestamp",
    example: null,
  })
  deletedAt?: Date | null;
}

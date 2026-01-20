import { ApiProperty } from "@nestjs/swagger";

/**
 * Order Data Transfer Object
 *
 * Represents an order entity in API responses
 */
export class OrderDto {
  @ApiProperty({
    description: "Unique identifier for the order",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Customer ID associated with the order",
    example: 67890,
  })
  customerId: number;

  @ApiProperty({
    description: "Unique order number",
    example: "ORD-2023-001234",
  })
  orderNumber: string;

  @ApiProperty({
    description: "Current order status",
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
  })
  status: string;

  @ApiProperty({
    description: "Order priority level",
    example: "normal",
    enum: ["low", "normal", "high", "urgent", "critical"],
  })
  priority: string;

  @ApiProperty({
    description: "Fitter ID assigned to the order",
    example: 123,
    nullable: true,
  })
  fitterId: number | null;

  @ApiProperty({
    description: "Factory ID assigned to the order",
    example: 456,
    nullable: true,
  })
  factoryId: number | null;

  @ApiProperty({
    description: "Saddle specifications and configuration",
    example: {
      brand: "Prestige",
      model: "Dressage",
      seatSize: "17.5",
      flap: "Long",
      leather: "Calfskin Brown",
    },
  })
  saddleSpecifications: Record<string, any>;

  @ApiProperty({
    description: "Special instructions for the order",
    example: "Extra padding required for sensitive horse",
    nullable: true,
  })
  specialInstructions: string | null;

  @ApiProperty({
    description: "Estimated delivery date",
    example: "2024-03-15T00:00:00Z",
    nullable: true,
  })
  estimatedDeliveryDate: Date | null;

  @ApiProperty({
    description: "Actual delivery date",
    example: "2024-03-12T14:30:00Z",
    nullable: true,
  })
  actualDeliveryDate: Date | null;

  @ApiProperty({
    description: "Total order amount in currency units",
    example: 2500.0,
  })
  totalAmount: number;

  @ApiProperty({
    description: "Deposit amount paid",
    example: 750.0,
  })
  depositPaid: number;

  @ApiProperty({
    description: "Remaining balance owing",
    example: 1750.0,
  })
  balanceOwing: number;

  @ApiProperty({
    description: "Horse and rider measurements",
    example: {
      horseWither: "32cm",
      horseBack: "45cm",
      riderLeg: "76cm",
      riderSeat: "Medium",
    },
    nullable: true,
  })
  measurements: Record<string, any> | null;

  @ApiProperty({
    description: "Whether the order is marked as urgent",
    example: false,
  })
  isUrgent: boolean;

  @ApiProperty({
    description: "Seat sizes associated with the order",
    example: ["size-17-5", "size-18"],
    nullable: true,
    isArray: true,
    type: String,
  })
  seatSizes: string[] | null;

  @ApiProperty({
    description: "Customer name for search optimization",
    example: "John Smith",
    nullable: true,
  })
  customerName: string | null;

  @ApiProperty({
    description: "Saddle type/model ID for filtering",
    example: 789,
    nullable: true,
  })
  saddleId: number | null;

  @ApiProperty({
    description: "Whether the order is overdue",
    example: false,
  })
  isOverdue: boolean;

  @ApiProperty({
    description: "Days until delivery (negative if overdue)",
    example: 15,
    nullable: true,
  })
  daysUntilDelivery: number | null;

  @ApiProperty({
    description: "Payment completion percentage",
    example: 30.0,
  })
  paymentPercentage: number;

  @ApiProperty({
    description: "Order creation timestamp",
    example: "2023-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2023-01-01T12:00:00Z",
  })
  updatedAt: Date;
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Update Order Data Transfer Object
 *
 * Defines the data that can be updated for an existing order
 */
export class UpdateOrderDto {
  @ApiProperty({
    description: "Order status",
    example: "confirmed",
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
    description: "Order priority level",
    example: "high",
    enum: ["low", "normal", "high", "urgent", "critical"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["low", "normal", "high", "urgent", "critical"])
  priority?: string;

  @ApiProperty({
    description: "Fitter ID to assign to the order",
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fitterId?: number;

  @ApiProperty({
    description: "Factory ID to assign to the order",
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  factoryId?: number;

  @ApiProperty({
    description: "Updated saddle specifications",
    example: {
      brand: "Prestige",
      model: "Dressage",
      seatSize: "18",
      flap: "Forward",
      leather: "Calfskin Black",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  saddleSpecifications?: Record<string, any>;

  @ApiProperty({
    description: "Special instructions for the order",
    example: "Customer requested color change to black",
    required: false,
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({
    description: "Estimated delivery date",
    example: "2024-04-15",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  estimatedDeliveryDate?: Date;

  @ApiProperty({
    description: "Updated total amount",
    example: 2750.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({
    description: "Additional deposit payment",
    example: 500.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalDeposit?: number;

  @ApiProperty({
    description: "Updated horse and rider measurements",
    example: {
      horseWither: "33cm",
      horseBack: "46cm",
      riderLeg: "78cm",
      riderSeat: "Large",
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  measurements?: Record<string, any>;

  @ApiProperty({
    description: "Status change reason",
    example: "Customer requested priority change due to show deadline",
    required: false,
  })
  @IsOptional()
  @IsString()
  statusChangeReason?: string;

  @ApiProperty({
    description: "Priority change reason",
    example: "Competition deadline moved up",
    required: false,
  })
  @IsOptional()
  @IsString()
  priorityChangeReason?: string;
}

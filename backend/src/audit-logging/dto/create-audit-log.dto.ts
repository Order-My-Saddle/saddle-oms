import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for creating audit log entries
 * Used for both migration from legacy system and new audit entries
 */
export class CreateAuditLogDto {
  @ApiProperty({
    description: "ID of the user who performed the action",
    example: 54321,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description:
      "Type of user from legacy system (1=Admin, 2=Fitter, 3=Customer, etc.)",
    example: 2,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  userType: number;

  @ApiPropertyOptional({
    description: "ID of the order affected by this action (if applicable)",
    example: 67890,
  })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty({
    description: "Description of the action performed",
    example: "Order status changed from pending to in_progress",
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({
    description: "Previous order status (for status change tracking)",
    example: 1,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  orderStatusFrom?: number;

  @ApiPropertyOptional({
    description: "New order status (for status change tracking)",
    example: 2,
    minimum: 0,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  orderStatusTo?: number;

  @ApiPropertyOptional({
    description:
      "Entity type for general-purpose logging (e.g. Order, Customer)",
    example: "Order",
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: "Entity ID for general-purpose logging",
    example: "12345",
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: "Timestamp when the action occurred (ISO 8601 format)",
    example: "2024-01-15T14:30:00.000Z",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  timestamp: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

/**
 * DTO for audit log response
 * Represents audit log data returned by API endpoints
 */
export class AuditLogDto {
  @ApiProperty({
    description: "Unique identifier for the audit log entry",
    example: 12345,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: "ID of the user who performed the action",
    example: 54321,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: "Type of user (1=Admin, 2=Fitter, 3=Customer, etc.)",
    example: 2,
  })
  @Expose()
  userType: number;

  @ApiPropertyOptional({
    description: "ID of the order affected by this action",
    example: 67890,
  })
  @Expose()
  orderId?: number;

  @ApiProperty({
    description: "Description of the action performed",
    example: "Order status changed from pending to in_progress",
  })
  @Expose()
  action: string;

  @ApiPropertyOptional({
    description: "Previous order status",
    example: 1,
  })
  @Expose()
  orderStatusFrom?: number;

  @ApiPropertyOptional({
    description: "New order status",
    example: 2,
  })
  @Expose()
  orderStatusTo?: number;

  @ApiProperty({
    description: "Timestamp when the action occurred",
    example: "2024-01-15T14:30:00.000Z",
  })
  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  timestamp: string;

  @ApiProperty({
    description: "When this audit log entry was created in the system",
    example: "2024-01-15T14:30:01.000Z",
  })
  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt: string;

  @ApiPropertyOptional({
    description: "User information (populated when requested)",
  })
  @Expose()
  user?: {
    id: number;
    username: string;
    name: string;
    email?: string;
  };

  @ApiPropertyOptional({
    description: "Order information (populated when requested)",
  })
  @Expose()
  order?: {
    id: number;
    orderNumber: string;
    status: string;
    customerId: number;
  };
}

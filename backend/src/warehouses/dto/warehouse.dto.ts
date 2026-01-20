import { ApiProperty } from "@nestjs/swagger";

/**
 * Warehouse Data Transfer Object
 *
 * Represents warehouse data sent to API clients
 */
export class WarehouseDto {
  @ApiProperty({
    description: "Warehouse UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "Warehouse name",
    example: "Main Distribution Center",
  })
  name: string;

  @ApiProperty({
    description: "Warehouse code",
    example: "MDC-001",
    nullable: true,
  })
  code: string | null;

  @ApiProperty({
    description: "Street address",
    example: "123 Warehouse Drive",
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    description: "City",
    example: "Manchester",
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    description: "Country",
    example: "United Kingdom",
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    description: "Whether the warehouse is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Full formatted address",
    example: "123 Warehouse Drive, Manchester, United Kingdom",
  })
  fullAddress: string;

  @ApiProperty({
    description: "Display name with code",
    example: "Main Distribution Center (MDC-001)",
  })
  displayName: string;

  @ApiProperty({
    description:
      "Whether warehouse is effectively active (active and not deleted)",
    example: true,
  })
  effectivelyActive: boolean;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Soft deletion timestamp",
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}

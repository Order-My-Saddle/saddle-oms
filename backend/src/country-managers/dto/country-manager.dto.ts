import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CountryManagerDto {
  @ApiProperty({
    description: "Country manager unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id: string;

  @ApiProperty({
    description: "User ID associated with this country manager",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  userId: string;

  @ApiProperty({
    description: "Country that the manager oversees",
    example: "United Kingdom",
  })
  country: string;

  @ApiPropertyOptional({
    description: "Region within the country",
    example: "Scotland",
  })
  region?: string;

  @ApiProperty({
    description: "Whether the country manager is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-11T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-11T10:30:00Z",
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Deletion timestamp (soft delete)",
    example: "2024-01-11T10:30:00Z",
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: "User who created this record",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  createdBy?: string;

  @ApiPropertyOptional({
    description: "User who last updated this record",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  updatedBy?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

/**
 * Filter Warehouse Data Transfer Object
 *
 * Defines filtering options for warehouse queries
 */
export class FilterWarehouseDto {
  @ApiProperty({
    description: "Filter by warehouse name (partial match)",
    example: "Distribution",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Filter by warehouse code",
    example: "MDC-001",
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: "Filter by city",
    example: "Manchester",
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: "Filter by country",
    example: "United Kingdom",
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: "Filter by active status",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

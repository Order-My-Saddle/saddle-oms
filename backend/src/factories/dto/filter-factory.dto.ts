import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsBoolean, IsNumber, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

/**
 * Filter Factory Data Transfer Object
 *
 * Defines filtering options for factory queries
 */
export class FilterFactoryDto {
  @ApiPropertyOptional({
    description: "Filter by factory ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by user ID",
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: "Filter by city",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "Filter by state",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: "Filter by country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Filter by currency",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  currency?: number;

  @ApiPropertyOptional({
    description: "Filter by email address",
    example: "factory@example.com",
  })
  @IsOptional()
  @IsString()
  emailaddress?: string;

  @ApiPropertyOptional({
    description: "Filter by active status (deleted = 0)",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by deleted flag",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  deleted?: number;

  @ApiPropertyOptional({
    description: "Search term for general text search",
    example: "new york factory",
  })
  @IsOptional()
  @IsString()
  search?: string;
}

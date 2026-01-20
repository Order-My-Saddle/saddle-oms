import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Query Factory Employee DTO
 * Data transfer object for filtering and pagination of factory employees
 */
export class QueryFactoryEmployeeDto {
  @ApiPropertyOptional({
    description: "Filter by factory ID",
    example: 123,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Factory ID must be an integer" })
  factoryId?: number;

  @ApiPropertyOptional({
    description: "Filter by employee name (partial match, case-insensitive)",
    example: "John",
  })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: "Number of records to return",
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Limit must be a number" })
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit cannot exceed 100" })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Number of records to skip",
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Offset must be a number" })
  @IsInt({ message: "Offset must be an integer" })
  @Min(0, { message: "Offset must be at least 0" })
  offset?: number = 0;

  @ApiPropertyOptional({
    description: "Page number (alternative to offset)",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Page must be a number" })
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number;
}

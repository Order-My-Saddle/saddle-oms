import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsBoolean, IsEnum } from "class-validator";
import { Transform } from "class-transformer";

export class QueryWarehouseDto {
  @ApiPropertyOptional({ description: "Search by name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "Filter by country" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: "Filter by active status" })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : 20))
  limit?: number;

  @ApiPropertyOptional({ description: "Sort by field" })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}

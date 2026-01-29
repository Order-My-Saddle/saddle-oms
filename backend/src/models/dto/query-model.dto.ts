import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

export class FilterModelDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by model ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by name (partial match)",
    example: "Dressage",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by brand ID",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  brandId?: number;

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
    description: "Search in name",
    example: "classic",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

export class SortModelDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["id", "name", "brandId", "sequence"],
    example: "name",
  })
  field: "id" | "name" | "brandId" | "sequence";
}

export class QueryModelDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Model-specific filters",
    type: FilterModelDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterModelDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterModelDto)
  filters?: FilterModelDto;

  @ApiPropertyOptional({
    description: "Model-specific sorting",
    type: [SortModelDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortModelDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortModelDto)
  sort?: SortModelDto[];

  /**
   * Get parsed model-specific filters
   */
  getModelFilters(): FilterModelDto {
    return this.filters || new FilterModelDto();
  }

  /**
   * Get parsed model-specific sorting
   */
  getModelSort(): SortModelDto[] {
    return this.sort || [];
  }
}

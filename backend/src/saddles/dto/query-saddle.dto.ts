import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import { BaseQueryDto, BaseFilterDto, SortDto } from "../../common/dto/base-query.dto";

export class FilterSaddleDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by saddle ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by brand",
    example: "Icon",
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: "Filter by model name",
    example: "Classic Dressage",
  })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiPropertyOptional({
    description: "Filter by type",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiPropertyOptional({
    description: "Filter by active status",
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
    description: "Search in brand or model name",
    example: "dressage",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

export class SortSaddleDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["id", "brand", "modelName", "type", "sequence"],
    example: "brand",
  })
  field: "id" | "brand" | "modelName" | "type" | "sequence";
}

export class QuerySaddleDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Saddle-specific filters",
    type: FilterSaddleDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterSaddleDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterSaddleDto)
  filters?: FilterSaddleDto;

  @ApiPropertyOptional({
    description: "Saddle-specific sorting",
    type: [SortSaddleDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortSaddleDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortSaddleDto)
  sort?: SortSaddleDto[];

  /**
   * Get parsed saddle-specific filters
   */
  getSaddleFilters(): FilterSaddleDto {
    return this.filters || new FilterSaddleDto();
  }

  /**
   * Get parsed saddle-specific sorting
   */
  getSaddleSort(): SortSaddleDto[] {
    return this.sort || [];
  }
}

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

export class FilterOptionDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by option ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by name (partial match)",
    example: "stirrup",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by group",
    example: "STIRRUP",
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({
    description: "Filter by type",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  type?: number;

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
    description: "Filter by extra allowed flag",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  extraAllowed?: number;

  @ApiPropertyOptional({
    description: "Search in name",
    example: "stirrup",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

export class SortOptionDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["id", "name", "group", "type", "sequence"],
    example: "sequence",
  })
  field: "id" | "name" | "group" | "type" | "sequence";
}

export class QueryOptionDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Option-specific filters",
    type: FilterOptionDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterOptionDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterOptionDto)
  filters?: FilterOptionDto;

  @ApiPropertyOptional({
    description: "Option-specific sorting",
    type: [SortOptionDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortOptionDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortOptionDto)
  sort?: SortOptionDto[];

  /**
   * Get parsed option-specific filters
   */
  getOptionFilters(): FilterOptionDto {
    return this.filters || new FilterOptionDto();
  }

  /**
   * Get parsed option-specific sorting
   */
  getOptionSort(): SortOptionDto[] {
    return this.sort || [];
  }
}

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

export class FilterOptionItemDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by option item ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by option ID",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  optionId?: number;

  @ApiPropertyOptional({
    description: "Filter by leather ID",
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  leatherId?: number;

  @ApiPropertyOptional({
    description: "Filter by name (partial match)",
    example: "Black",
  })
  @IsOptional()
  @IsString()
  name?: string;

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
    example: "calfskin",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

export class SortOptionItemDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["id", "name", "optionId", "leatherId", "sequence"],
    example: "sequence",
  })
  field: "id" | "name" | "optionId" | "leatherId" | "sequence";
}

export class QueryOptionItemDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Option item-specific filters",
    type: FilterOptionItemDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterOptionItemDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterOptionItemDto)
  filters?: FilterOptionItemDto;

  @ApiPropertyOptional({
    description: "Option item-specific sorting",
    type: [SortOptionItemDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortOptionItemDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortOptionItemDto)
  sort?: SortOptionItemDto[];

  /**
   * Get parsed option item-specific filters
   */
  getOptionItemFilters(): FilterOptionItemDto {
    return this.filters || new FilterOptionItemDto();
  }

  /**
   * Get parsed option item-specific sorting
   */
  getOptionItemSort(): SortOptionItemDto[] {
    return this.sort || [];
  }
}

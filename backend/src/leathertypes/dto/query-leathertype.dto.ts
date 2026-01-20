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

export class FilterLeathertypeDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by leather type ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by name (partial match)",
    example: "Vienna",
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
    description: "Filter by deleted flag",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  deleted?: number;

  @ApiPropertyOptional({
    description: "Search in name",
    example: "buffalo",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}

export class SortLeathertypeDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["id", "name", "sequence"],
    example: "sequence",
  })
  field: "id" | "name" | "sequence";
}

export class QueryLeathertypeDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Leathertype-specific filters",
    type: FilterLeathertypeDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterLeathertypeDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterLeathertypeDto)
  filters?: FilterLeathertypeDto;

  @ApiPropertyOptional({
    description: "Leathertype-specific sorting",
    type: [SortLeathertypeDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortLeathertypeDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortLeathertypeDto)
  sort?: SortLeathertypeDto[];

  /**
   * Get parsed leathertype-specific filters
   */
  getLeathertypeFilters(): FilterLeathertypeDto {
    return this.filters || new FilterLeathertypeDto();
  }

  /**
   * Get parsed leathertype-specific sorting
   */
  getLeathertypeSort(): SortLeathertypeDto[] {
    return this.sort || [];
  }
}

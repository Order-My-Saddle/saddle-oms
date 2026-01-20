import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

export class FilterCountryManagerDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by country",
    example: "United Kingdom",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Filter by region",
    example: "Scotland",
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean;
}

export class SortCountryManagerDto extends SortDto {
  @ApiPropertyOptional({
    description: "Field name to sort by",
    enum: [
      "country",
      "region",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    example: "country",
  })
  field:
    | "country"
    | "region"
    | "isActive"
    | "createdAt"
    | "updatedAt";
}

export class QueryCountryManagerDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Country manager specific filters",
    type: FilterCountryManagerDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterCountryManagerDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCountryManagerDto)
  filters?: FilterCountryManagerDto;

  @ApiPropertyOptional({
    description: "Country manager specific sorting",
    type: [SortCountryManagerDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortCountryManagerDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortCountryManagerDto)
  sort?: SortCountryManagerDto[];

  /**
   * Get parsed country manager specific filters
   */
  getCountryManagerFilters(): FilterCountryManagerDto {
    return this.filters || new FilterCountryManagerDto();
  }

  /**
   * Get parsed country manager specific sorting
   */
  getCountryManagerSort(): SortCountryManagerDto[] {
    return this.sort || [];
  }
}

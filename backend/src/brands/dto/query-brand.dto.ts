import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";
import { BrandStatus } from "../domain/value-objects/brand-status.value-object";

export class FilterBrandDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by brand name",
    example: "Tack & Style",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by brand status",
    enum: BrandStatus,
    example: BrandStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;
}

export class SortBrandDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["name", "status", "createdAt", "updatedAt"],
    example: "name",
  })
  field: "name" | "status" | "createdAt" | "updatedAt";
}

export class QueryBrandDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Brand-specific filters",
    type: FilterBrandDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterBrandDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterBrandDto)
  filters?: FilterBrandDto;

  @ApiPropertyOptional({
    description: "Brand-specific sorting",
    type: [SortBrandDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortBrandDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortBrandDto)
  sort?: SortBrandDto[];

  /**
   * Get parsed brand-specific filters
   */
  getBrandFilters(): FilterBrandDto {
    return this.filters || new FilterBrandDto();
  }

  /**
   * Get parsed brand-specific sorting
   */
  getBrandSort(): SortBrandDto[] {
    return this.sort || [];
  }
}

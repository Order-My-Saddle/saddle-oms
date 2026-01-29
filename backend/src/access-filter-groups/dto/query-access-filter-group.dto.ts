import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

export class FilterAccessFilterGroupDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by group name",
    example: "Regional Sales Team",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by active status",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}

export class SortAccessFilterGroupDto extends SortDto {
  @ApiPropertyOptional({
    description: "Field name to sort by",
    enum: ["name", "isActive", "createdAt", "updatedAt"],
    example: "name",
  })
  field: "name" | "isActive" | "createdAt" | "updatedAt";
}

export class QueryAccessFilterGroupDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Access filter group-specific filters",
    type: FilterAccessFilterGroupDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterAccessFilterGroupDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAccessFilterGroupDto)
  filters?: FilterAccessFilterGroupDto;

  @ApiPropertyOptional({
    description: "Access filter group-specific sorting",
    type: [SortAccessFilterGroupDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortAccessFilterGroupDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortAccessFilterGroupDto)
  sort?: SortAccessFilterGroupDto[];

  getAccessFilterGroupFilters(): FilterAccessFilterGroupDto {
    return this.filters || new FilterAccessFilterGroupDto();
  }

  getAccessFilterGroupSort(): SortAccessFilterGroupDto[] {
    return this.sort || [];
  }
}

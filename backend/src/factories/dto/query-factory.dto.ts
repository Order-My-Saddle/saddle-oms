import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { Type, Transform, plainToInstance } from "class-transformer";
import { BaseQueryDto, SortDto } from "../../common/dto/base-query.dto";
import { FilterFactoryDto } from "./filter-factory.dto";

export class SortFactoryDto extends SortDto {
  field:
    | "id"
    | "userId"
    | "city"
    | "state"
    | "country"
    | "currency"
    | "emailaddress"
    | "createdAt"
    | "updatedAt";
}

/**
 * Query Factory Data Transfer Object
 *
 * Extends BaseQueryDto with factory-specific filtering options.
 */
export class QueryFactoryDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Factory-specific filters",
    type: FilterFactoryDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterFactoryDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterFactoryDto)
  filters?: FilterFactoryDto;

  @ApiPropertyOptional({
    description: "Factory-specific sorting",
    type: [SortFactoryDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortFactoryDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortFactoryDto)
  sort?: SortFactoryDto[];

  /**
   * Get factory-specific filters
   */
  getFactoryFilters(): FilterFactoryDto {
    return this.filters || new FilterFactoryDto();
  }

  /**
   * Get factory-specific sorting
   */
  getFactorySort(): SortFactoryDto[] {
    return this.sort || [];
  }

  /**
   * Get repository-compatible filter object
   */
  getRepositoryFilters() {
    const filters = this.getFactoryFilters();

    return {
      id: filters.id,
      userId: filters.userId,
      city: filters.city,
      state: filters.state,
      country: filters.country,
      currency: filters.currency,
      emailaddress: filters.emailaddress,
      isActive: filters.isActive,
      deleted: filters.deleted,
    };
  }
}

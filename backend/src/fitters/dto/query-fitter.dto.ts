import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

export class FilterFitterDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by fitter ID",
    example: 12345,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "Filter by user ID",
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: "Filter by city",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "Filter by state",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: "Filter by country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Filter by currency",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  currency?: number;

  @ApiPropertyOptional({
    description: "Filter by email address",
    example: "fitter@example.com",
  })
  @IsOptional()
  @IsString()
  emailaddress?: string;

  @ApiPropertyOptional({
    description: "Filter by active status (deleted = 0)",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter by deleted flag",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  deleted?: number;
}

export class SortFitterDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: [
      "id",
      "userId",
      "city",
      "state",
      "country",
      "currency",
      "emailaddress",
      "createdAt",
      "updatedAt",
    ],
    example: "id",
  })
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

export class QueryFitterDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Fitter-specific filters",
    type: FilterFitterDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterFitterDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterFitterDto)
  filters?: FilterFitterDto;

  @ApiPropertyOptional({
    description: "Fitter-specific sorting",
    type: [SortFitterDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortFitterDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortFitterDto)
  sort?: SortFitterDto[];

  /**
   * Get parsed fitter-specific filters
   */
  getFitterFilters(): FilterFitterDto {
    return this.filters || new FilterFitterDto();
  }

  /**
   * Get parsed fitter-specific sorting
   */
  getFitterSort(): SortFitterDto[] {
    return this.sort || [];
  }
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
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
import { CustomerStatus } from "../domain/value-objects/customer-status.value-object";

export class FilterCustomerDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by customer email",
    example: "john.doe@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "Filter by customer name",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by horse name",
    example: "Thunder",
  })
  @IsOptional()
  @IsString()
  horseName?: string;

  @ApiPropertyOptional({
    description: "Filter by company name",
    example: "Equestrian Services Inc.",
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: "Filter by customer city",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "Filter by customer state",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: "Filter by customer zipcode",
    example: "10001",
  })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Filter by customer country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Filter by assigned fitter ID",
    example: 12345,
  })
  @IsOptional()
  fitterId?: number;

  @ApiPropertyOptional({
    description: "Filter by customer status",
    enum: CustomerStatus,
    example: CustomerStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({
    description: "Filter customers without assigned fitter",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  withoutFitter?: boolean;
}

export class SortCustomerDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: [
      "id",
      "name",
      "email",
      "horseName",
      "company",
      "city",
      "state",
      "zipcode",
      "country",
      "status",
      "createdAt",
      "updatedAt",
    ],
    example: "name",
  })
  field:
    | "id"
    | "name"
    | "email"
    | "horseName"
    | "company"
    | "city"
    | "state"
    | "zipcode"
    | "country"
    | "status"
    | "createdAt"
    | "updatedAt";
}

export class QueryCustomerDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Customer-specific filters",
    type: FilterCustomerDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterCustomerDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCustomerDto)
  filters?: FilterCustomerDto;

  @ApiPropertyOptional({
    description: "Customer-specific sorting",
    type: [SortCustomerDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortCustomerDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortCustomerDto)
  sort?: SortCustomerDto[];

  /**
   * Get parsed customer-specific filters
   */
  getCustomerFilters(): FilterCustomerDto {
    return this.filters || new FilterCustomerDto();
  }

  /**
   * Get parsed customer-specific sorting
   */
  getCustomerSort(): SortCustomerDto[] {
    return this.sort || [];
  }
}

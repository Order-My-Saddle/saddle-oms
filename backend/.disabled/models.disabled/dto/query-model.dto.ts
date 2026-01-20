import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  ValidateNested,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";
import { ModelStatus } from "../domain/value-objects/model-status.value-object";

export class FilterModelDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by model name",
    example: "Classic Dressage",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter by brand ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({
    description: "Filter by model status",
    enum: ModelStatus,
    example: ModelStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ModelStatus)
  status?: ModelStatus;

  @ApiPropertyOptional({
    description: "Filter by customizable flag",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isCustomizable?: boolean;
}

export class SortModelDto extends SortDto {
  @ApiProperty({
    description: "Field name to sort by",
    enum: ["name", "brandId", "status", "basePrice", "createdAt", "updatedAt"],
    example: "name",
  })
  field:
    | "name"
    | "brandId"
    | "status"
    | "basePrice"
    | "createdAt"
    | "updatedAt";
}

export class QueryModelDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: "Model-specific filters",
    type: FilterModelDto,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterModelDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterModelDto)
  filters?: FilterModelDto;

  @ApiPropertyOptional({
    description: "Model-specific sorting",
    type: [SortModelDto],
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortModelDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortModelDto)
  sort?: SortModelDto[];

  /**
   * Get parsed model-specific filters
   */
  getModelFilters(): FilterModelDto {
    return this.filters || new FilterModelDto();
  }

  /**
   * Get parsed model-specific sorting
   */
  getModelSort(): SortModelDto[] {
    return this.sort || [];
  }
}

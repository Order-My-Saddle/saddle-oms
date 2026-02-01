import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import { User } from "../domain/user";
import { RoleDto } from "../../roles/dto/role.dto";
import {
  BaseQueryDto,
  BaseFilterDto,
  SortDto,
} from "../../common/dto/base-query.dto";

export class FilterUserDto extends BaseFilterDto {
  @ApiPropertyOptional({
    description: "Filter by username",
    example: "adamwhitehouse",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: "Filter by user email",
    example: "john@example.com",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: "Filter by first name",
    example: "John",
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: "Filter by last name",
    example: "Smith",
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: "Filter by user role",
    example: "admin",
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: "Search across username, name, and email",
    example: "adam",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: RoleDto,
    description: "Legacy filter - array of roles",
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles?: RoleDto[] | null;
}

export class SortUserDto extends SortDto {
  @ApiProperty({
    description: "Field to sort by",
    enum: ["email", "firstName", "lastName", "createdAt", "updatedAt"],
    example: "email",
  })
  @Type(() => String)
  @IsString()
  field: keyof User;

  @ApiProperty({
    description: "Sort direction",
    enum: ["asc", "desc"],
    example: "asc",
  })
  @IsString()
  direction: "asc" | "desc";

  // Legacy compatibility
  @ApiPropertyOptional({
    description: "Legacy field name for sorting",
    deprecated: true,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  orderBy?: keyof User;

  @ApiPropertyOptional({
    description: "Legacy sort direction",
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  order?: string;
}

export class QueryUserDto extends BaseQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: "Legacy filters as JSON string",
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto;

  @ApiPropertyOptional({
    type: String,
    description: "Legacy sort as JSON array string",
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortUserDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  sort?: SortUserDto[];
}

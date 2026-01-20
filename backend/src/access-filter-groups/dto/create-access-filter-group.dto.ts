import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsObject,
  IsArray,
  IsInt,
  Length,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateAccessFilterGroupDto {
  @ApiProperty({
    description: "Filter group name",
    example: "Regional Sales Team",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({
    description: "Filter group description",
    example: "Access filter group for regional sales representatives",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: "Filter configuration as JSON object",
    example: { region: "north", department: "sales" },
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any> | null;

  @ApiPropertyOptional({
    description: "Array of user IDs associated with this filter group",
    example: [1, 2, 3],
    nullable: true,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true, message: "Each user ID must be an integer" })
  @Type(() => Number)
  userIds?: number[] | null;

  @ApiPropertyOptional({
    description: "Whether the filter group is active",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

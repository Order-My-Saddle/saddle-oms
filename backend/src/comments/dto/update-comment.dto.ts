import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Update Comment Data Transfer Object
 *
 * Defines the data that can be updated for an existing comment.
 * Uses INTEGER IDs to match current schema.
 */
export class UpdateCommentDto {
  @ApiProperty({
    description: "Updated comment content",
    example: "Customer confirmed color change - proceeding with black leather",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;

  @ApiProperty({
    description: "Updated comment type/category",
    example: "customer",
    enum: ["general", "production", "customer", "internal", "status_change"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["general", "production", "customer", "internal", "status_change"])
  type?: string;

  @ApiProperty({
    description: "Update internal visibility flag",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiProperty({
    description: "Updated user ID (usually should not change)",
    example: 42,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  userId?: number;
}

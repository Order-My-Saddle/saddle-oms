import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Create Comment Data Transfer Object
 *
 * Defines the required data for creating a new comment.
 * Uses INTEGER IDs to match current schema.
 */
export class CreateCommentDto {
  @ApiProperty({
    description: "Order ID for the comment",
    example: 12345,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  orderId: number;

  @ApiProperty({
    description:
      "User ID who created the comment (optional for system comments)",
    example: 42,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : null))
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: "Comment content",
    example: "Customer requested color change to black leather",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content: string;

  @ApiProperty({
    description: "Comment type/category",
    example: "general",
    enum: ["general", "production", "customer", "internal", "status_change"],
    required: false,
    default: "general",
  })
  @IsOptional()
  @IsEnum(["general", "production", "customer", "internal", "status_change"])
  type?: string;

  @ApiProperty({
    description:
      "Whether this is an internal comment (not visible to customers)",
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

}

import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * Query OrderLine Data Transfer Object
 *
 * Defines query parameters for filtering and pagination of order lines
 */
export class QueryOrderLineDto {
  @ApiProperty({
    description: "Filter by order ID",
    example: 123,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderId?: number;

  @ApiProperty({
    description: "Filter by product ID",
    example: 456,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiProperty({
    description: "Page number for pagination (1-based)",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: "Sort field",
    example: "sequence",
    default: "sequence",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "sequence";

  @ApiProperty({
    description: "Sort order (ASC or DESC)",
    example: "ASC",
    default: "ASC",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "ASC";
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator";

/**
 * Create Saddle Options Item DTO
 *
 * Based on the saddle_options_items table schema
 */
export class CreateSaddleOptionsItemDto {
  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  saddleId: number;

  @ApiProperty({
    description: "Option ID",
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  optionId: number;

  @ApiProperty({
    description: "Option item ID",
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  optionItemId: number;

  @ApiProperty({
    description: "Leather ID",
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  leatherId: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

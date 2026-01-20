import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

/**
 * Create Option Item DTO
 *
 * Based on the options_items table schema with 7-tier pricing
 */
export class CreateOptionItemDto {
  @ApiProperty({
    description: "Option ID this item belongs to",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  optionId: number;

  @ApiPropertyOptional({
    description: "Leather type ID",
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  leatherId?: number;

  @ApiProperty({
    description: "Item name",
    example: "Black Calfskin",
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: "User color selection flag (0 = no, 1 = yes)",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userColor?: number;

  @ApiPropertyOptional({
    description: "User leather selection flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  userLeather?: number;

  @ApiPropertyOptional({
    description: "Price tier 1 (in cents)",
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price1?: number;

  @ApiPropertyOptional({
    description: "Price tier 2 (in cents)",
    example: 4800,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price2?: number;

  @ApiPropertyOptional({
    description: "Price tier 3 (in cents)",
    example: 4600,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price3?: number;

  @ApiPropertyOptional({
    description: "Price tier 4 (in cents)",
    example: 4400,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price4?: number;

  @ApiPropertyOptional({
    description: "Price tier 5 (in cents)",
    example: 4200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price5?: number;

  @ApiPropertyOptional({
    description: "Price tier 6 (in cents)",
    example: 4000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price6?: number;

  @ApiPropertyOptional({
    description: "Price tier 7 (in cents)",
    example: 3800,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price7?: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;

  @ApiPropertyOptional({
    description: "Restriction rules (TEXT)",
    example: "Not available for custom orders",
  })
  @IsOptional()
  @IsString()
  restrict?: string;
}

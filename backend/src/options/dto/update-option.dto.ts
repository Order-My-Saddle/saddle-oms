import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  Max,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * Update Option DTO
 *
 * Used for partial updates to option records.
 * Matches PostgreSQL schema with 7-tier pricing structure.
 */
export class UpdateOptionDto {
  @ApiPropertyOptional({
    description: "Name of the option",
    example: "Standard Stirrup Leathers",
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: "Option group/category",
    example: "Stirrups",
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  group?: string;

  @ApiPropertyOptional({
    description: "Option type identifier",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  type?: number;

  // 7-tier pricing structure
  @ApiPropertyOptional({
    description: "Price tier 1 (in cents)",
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price1?: number;

  @ApiPropertyOptional({
    description: "Price tier 2 (in cents)",
    example: 5500,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price2?: number;

  @ApiPropertyOptional({
    description: "Price tier 3 (in cents)",
    example: 6000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price3?: number;

  @ApiPropertyOptional({
    description: "Price tier 4 (in cents)",
    example: 6500,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price4?: number;

  @ApiPropertyOptional({
    description: "Price tier 5 (in cents)",
    example: 7000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price5?: number;

  @ApiPropertyOptional({
    description: "Price tier 6 (in cents)",
    example: 7500,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price6?: number;

  @ApiPropertyOptional({
    description: "Price tier 7 (in cents)",
    example: 8000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  price7?: number;

  // 7-tier contrast pricing structure
  @ApiPropertyOptional({
    description: "Contrast price tier 1 (in cents)",
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast1?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 2 (in cents)",
    example: 1100,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast2?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 3 (in cents)",
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast3?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 4 (in cents)",
    example: 1300,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast4?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 5 (in cents)",
    example: 1400,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast5?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 6 (in cents)",
    example: 1500,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast6?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 7 (in cents)",
    example: 1600,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  priceContrast7?: number;

  @ApiPropertyOptional({
    description: "Display sequence/sort order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(32767)
  @Transform(({ value }) => parseInt(value))
  sequence?: number;

  @ApiPropertyOptional({
    description: "Whether extras are allowed (0=no, 1=yes)",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseInt(value))
  extraAllowed?: number;
}

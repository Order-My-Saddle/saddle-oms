import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateOptionDto {
  @ApiProperty({
    description: "Name of the option",
    example: "Standard Stirrup Leathers",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: "Option group/category",
    example: "STIRRUP",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  group?: string;

  @ApiPropertyOptional({
    description: "Option type",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiPropertyOptional({
    description: "Price tier 1 (in cents)",
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price1?: number;

  @ApiPropertyOptional({
    description: "Price tier 2 (in cents)",
    example: 9500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price2?: number;

  @ApiPropertyOptional({
    description: "Price tier 3 (in cents)",
    example: 9000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price3?: number;

  @ApiPropertyOptional({
    description: "Price tier 4 (in cents)",
    example: 8500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price4?: number;

  @ApiPropertyOptional({
    description: "Price tier 5 (in cents)",
    example: 8000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price5?: number;

  @ApiPropertyOptional({
    description: "Price tier 6 (in cents)",
    example: 7500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price6?: number;

  @ApiPropertyOptional({
    description: "Price tier 7 (in cents)",
    example: 7000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price7?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 1 (in cents)",
    example: 1500,
  })
  @IsOptional()
  @IsNumber()
  priceContrast1?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 2 (in cents)",
    example: 1400,
  })
  @IsOptional()
  @IsNumber()
  priceContrast2?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 3 (in cents)",
    example: 1300,
  })
  @IsOptional()
  @IsNumber()
  priceContrast3?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 4 (in cents)",
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  priceContrast4?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 5 (in cents)",
    example: 1100,
  })
  @IsOptional()
  @IsNumber()
  priceContrast5?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 6 (in cents)",
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  priceContrast6?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 7 (in cents)",
    example: 900,
  })
  @IsOptional()
  @IsNumber()
  priceContrast7?: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;

  @ApiPropertyOptional({
    description: "Whether extras are allowed for this option (0 = no, 1 = yes)",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  extraAllowed?: number;
}

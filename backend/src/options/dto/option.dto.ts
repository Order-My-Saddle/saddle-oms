import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OptionDto {
  @ApiProperty({
    description: "Unique identifier of the option",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Name of the option",
    example: "Standard Stirrup Leathers",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Option group/category",
    example: "STIRRUP",
  })
  group?: string;

  @ApiPropertyOptional({
    description: "Option type",
    example: 1,
  })
  type?: number;

  @ApiPropertyOptional({
    description: "Price tier 1 (in cents)",
    example: 10000,
  })
  price1?: number;

  @ApiPropertyOptional({
    description: "Price tier 2 (in cents)",
    example: 9500,
  })
  price2?: number;

  @ApiPropertyOptional({
    description: "Price tier 3 (in cents)",
    example: 9000,
  })
  price3?: number;

  @ApiPropertyOptional({
    description: "Price tier 4 (in cents)",
    example: 8500,
  })
  price4?: number;

  @ApiPropertyOptional({
    description: "Price tier 5 (in cents)",
    example: 8000,
  })
  price5?: number;

  @ApiPropertyOptional({
    description: "Price tier 6 (in cents)",
    example: 7500,
  })
  price6?: number;

  @ApiPropertyOptional({
    description: "Price tier 7 (in cents)",
    example: 7000,
  })
  price7?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 1 (in cents)",
    example: 1500,
  })
  priceContrast1?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 2 (in cents)",
    example: 1400,
  })
  priceContrast2?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 3 (in cents)",
    example: 1300,
  })
  priceContrast3?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 4 (in cents)",
    example: 1200,
  })
  priceContrast4?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 5 (in cents)",
    example: 1100,
  })
  priceContrast5?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 6 (in cents)",
    example: 1000,
  })
  priceContrast6?: number;

  @ApiPropertyOptional({
    description: "Contrast price tier 7 (in cents)",
    example: 900,
  })
  priceContrast7?: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  sequence?: number;

  @ApiPropertyOptional({
    description: "Whether extras are allowed for this option (0 = no, 1 = yes)",
    example: 1,
  })
  extraAllowed?: number;

  @ApiPropertyOptional({
    description: "Soft delete flag (0 = active, 1 = deleted)",
    example: 0,
  })
  deleted?: number;

  @ApiPropertyOptional({
    description: "Whether the option is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;
}

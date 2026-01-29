import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator";

/**
 * Create Saddle Leather DTO
 *
 * Based on the saddle_leathers table schema with 7-tier pricing
 */
export class CreateSaddleLeatherDto {
  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  saddleId: number;

  @ApiProperty({
    description: "Leather type ID",
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  leatherId: number;

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
}

import { IsString, IsOptional, IsNumber, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExtraDto {
  @ApiProperty({ description: "Extra name", example: "Complete Re-Flock" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Extra description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Price tier 1 - USD", example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price1?: number;

  @ApiPropertyOptional({ description: "Price tier 2 - EUR", example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price2?: number;

  @ApiPropertyOptional({ description: "Price tier 3 - GBP", example: 135 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price3?: number;

  @ApiPropertyOptional({ description: "Price tier 4 - CAD", example: 290 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price4?: number;

  @ApiPropertyOptional({ description: "Price tier 5 - AUD", example: 290 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price5?: number;

  @ApiPropertyOptional({ description: "Price tier 6 - NOK", example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price6?: number;

  @ApiPropertyOptional({ description: "Price tier 7 - DKK", example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price7?: number;

  @ApiPropertyOptional({ description: "Display sequence order", example: 0 })
  @IsOptional()
  @IsNumber()
  sequence?: number;
}

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
 * Create Saddle DTO
 *
 * Based on the saddles table schema with regional factory assignments
 */
export class CreateSaddleDto {
  @ApiPropertyOptional({
    description: "EU factory ID",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  factoryEu?: number;

  @ApiPropertyOptional({
    description: "GB factory ID",
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  factoryGb?: number;

  @ApiPropertyOptional({
    description: "US factory ID",
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  factoryUs?: number;

  @ApiPropertyOptional({
    description: "CA factory ID",
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  factoryCa?: number;

  @ApiPropertyOptional({
    description: "AUD factory ID",
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  factoryAud?: number;

  @ApiPropertyOptional({
    description: "DE factory ID",
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  factoryDe?: number;

  @ApiPropertyOptional({
    description: "NL factory ID",
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  factoryNl?: number;

  @ApiProperty({
    description: "Brand name",
    example: "Icon",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  modelName: string;

  @ApiPropertyOptional({
    description: "Presets configuration (JSON or comma-separated list)",
    example: "1,2,3",
  })
  @IsOptional()
  @IsString()
  presets?: string;

  @ApiPropertyOptional({
    description: "Active status (0 = inactive, 1 = active)",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  active?: number;

  @ApiPropertyOptional({
    description: "Saddle type",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  type?: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

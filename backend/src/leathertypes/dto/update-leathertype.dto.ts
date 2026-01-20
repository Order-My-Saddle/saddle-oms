import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from "class-validator";

/**
 * Update Leathertype DTO
 *
 * Used for updating leather type properties.
 * Matches simplified PostgreSQL schema.
 */
export class UpdateLeathertypeDto {
  @ApiPropertyOptional({
    description: "Name of the leather type",
    example: "Calfskin",
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
    minimum: 0,
    maximum: 32767,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(32767)
  sequence?: number;
}

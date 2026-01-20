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
 * Create Model DTO
 *
 * Based on the saddles table model_name field and brand relationship
 */
export class CreateModelDto {
  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: "Brand ID this model belongs to",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({
    description: "Model description",
    example: "A classic dressage saddle for competitive riders",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

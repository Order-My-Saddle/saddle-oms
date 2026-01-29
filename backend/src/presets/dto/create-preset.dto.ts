import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
  MaxLength,
} from "class-validator";

export class CreatePresetDto {
  @ApiProperty({
    description: "Name of the preset",
    example: "Classic Dressage",
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sequence?: number;
}

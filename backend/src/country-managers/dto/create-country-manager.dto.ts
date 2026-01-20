import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  IsPositive,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateCountryManagerDto {
  @ApiProperty({
    description: "User ID that this country manager is associated with",
    example: 1,
    type: "integer",
  })
  @Type(() => Number)
  @IsInt({ message: "User ID must be an integer" })
  @IsPositive({ message: "User ID must be a positive number" })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: "Country that the manager oversees",
    example: "United Kingdom",
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({
    description: "Region within the country (optional)",
    example: "Scotland",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({
    description: "Whether the country manager is active",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  MinLength,
  IsBoolean,
  IsString,
} from "class-validator";
import { lowerCaseTransformer } from "../../utils/transformers/lower-case.transformer";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "adamwhitehouse", type: String })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: "test1@example.com", type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: "Adam Whitehouse", type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: "123 Main St", type: String })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ example: "New York", type: String })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({ example: "10001", type: String })
  @IsOptional()
  @IsString()
  zipcode?: string | null;

  @ApiPropertyOptional({ example: "NY", type: String })
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional({ example: "+1-555-123-4567", type: String })
  @IsOptional()
  @IsString()
  cellNo?: string | null;

  @ApiPropertyOptional({ example: "+1-555-987-6543", type: String })
  @IsOptional()
  @IsString()
  phoneNo?: string | null;

  @ApiPropertyOptional({ example: "US", type: String })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ example: "USD", type: String })
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

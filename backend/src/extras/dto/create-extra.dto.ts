import { IsString, IsOptional, IsNumber } from "class-validator";

export class CreateExtraDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

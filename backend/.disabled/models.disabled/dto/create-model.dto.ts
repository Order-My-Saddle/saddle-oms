import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, Length } from "class-validator";
import { Transform } from "class-transformer";

export class CreateModelDto {
  @ApiProperty({
    description: "Brand ID that this model belongs to",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  brandId: number;

  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  @Transform(({ value }) => value?.trim())
  name: string;
}

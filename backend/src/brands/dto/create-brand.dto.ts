import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class CreateBrandDto {
  @ApiProperty({
    description: "Brand name",
    example: "Tack & Style",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @Transform(({ value }) => value?.trim())
  name: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateSaddleExtraDto {
  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  saddleId: number;

  @ApiProperty({
    description: "Extra ID",
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  extraId: number;
}

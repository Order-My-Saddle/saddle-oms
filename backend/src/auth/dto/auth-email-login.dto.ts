import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { lowerCaseTransformer } from "../../utils/transformers/lower-case.transformer";

export class AuthEmailLoginDto {
  @ApiProperty({ example: "adamwhitehouse or test1@example.com", type: String })
  @Transform(lowerCaseTransformer)
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

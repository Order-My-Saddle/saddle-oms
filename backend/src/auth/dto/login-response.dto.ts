import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/domain/user";

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ required: false, nullable: true })
  refreshToken: string | null;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => User,
  })
  user: User;
}

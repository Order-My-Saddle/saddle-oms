import { ApiProperty } from "@nestjs/swagger";

export class RefreshResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ required: false, nullable: true })
  refreshToken: string | null;

  @ApiProperty()
  tokenExpires: number;
}

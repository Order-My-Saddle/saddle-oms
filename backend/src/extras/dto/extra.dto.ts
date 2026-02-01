import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ExtraDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiProperty({ description: "Price tier 1 - USD" })
  price1: number;

  @Expose()
  @ApiProperty({ description: "Price tier 2 - EUR" })
  price2: number;

  @Expose()
  @ApiProperty({ description: "Price tier 3 - GBP" })
  price3: number;

  @Expose()
  @ApiProperty({ description: "Price tier 4 - CAD" })
  price4: number;

  @Expose()
  @ApiProperty({ description: "Price tier 5 - AUD" })
  price5: number;

  @Expose()
  @ApiProperty({ description: "Price tier 6 - NOK" })
  price6: number;

  @Expose()
  @ApiProperty({ description: "Price tier 7 - DKK" })
  price7: number;

  @Expose()
  @ApiProperty()
  sequence: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional()
  deletedAt: Date | null;

  isActive: boolean;
  displayName: string;
}

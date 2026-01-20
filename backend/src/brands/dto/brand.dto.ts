import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class BrandDto {
  @ApiProperty({
    description: "Brand unique identifier",
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: "Brand name",
    example: "Tack & Style",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: "Whether the brand is active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Brand display name",
    example: "Tack & Style",
  })
  @Expose()
  displayName: string;
}

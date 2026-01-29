import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaddleLeatherDto {
  @ApiProperty({
    description: "Saddle leather unique identifier",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  saddleId: number;

  @ApiProperty({
    description: "Leather type ID",
    example: 5,
  })
  leatherId: number;

  // 7-tier pricing structure
  @ApiPropertyOptional({
    description: "Price tier 1 (in cents)",
    example: 5000,
  })
  price1?: number;

  @ApiPropertyOptional({
    description: "Price tier 2 (in cents)",
    example: 4800,
  })
  price2?: number;

  @ApiPropertyOptional({
    description: "Price tier 3 (in cents)",
    example: 4600,
  })
  price3?: number;

  @ApiPropertyOptional({
    description: "Price tier 4 (in cents)",
    example: 4400,
  })
  price4?: number;

  @ApiPropertyOptional({
    description: "Price tier 5 (in cents)",
    example: 4200,
  })
  price5?: number;

  @ApiPropertyOptional({
    description: "Price tier 6 (in cents)",
    example: 4000,
  })
  price6?: number;

  @ApiPropertyOptional({
    description: "Price tier 7 (in cents)",
    example: 3800,
  })
  price7?: number;

  @ApiPropertyOptional({
    description: "Display sequence/order",
    example: 10,
  })
  sequence?: number;

  @ApiPropertyOptional({
    description: "Soft delete flag (0 = active, 1 = deleted)",
    example: 0,
  })
  deleted?: number;

  @ApiPropertyOptional({
    description: "Whether the item is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;
}

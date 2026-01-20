import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OptionItemDto {
  @ApiProperty({
    description: "Option item unique identifier",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Option ID this item belongs to",
    example: 1,
  })
  optionId: number;

  @ApiPropertyOptional({
    description: "Leather type ID",
    example: 5,
  })
  leatherId?: number;

  @ApiProperty({
    description: "Item name",
    example: "Black Calfskin",
  })
  name: string;

  @ApiPropertyOptional({
    description: "User color selection flag (0 = no, 1 = yes)",
    example: 1,
  })
  userColor?: number;

  @ApiPropertyOptional({
    description: "User leather selection flag (0 = no, 1 = yes)",
    example: 0,
  })
  userLeather?: number;

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
    description: "Restriction rules",
    example: "Not available for custom orders",
  })
  restrict?: string;

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

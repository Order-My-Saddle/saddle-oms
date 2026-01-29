import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaddleOptionsItemDto {
  @ApiProperty({
    description: "Saddle options item unique identifier",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  saddleId: number;

  @ApiProperty({
    description: "Option ID",
    example: 5,
  })
  optionId: number;

  @ApiProperty({
    description: "Option item ID",
    example: 10,
  })
  optionItemId: number;

  @ApiProperty({
    description: "Leather ID",
    example: 3,
  })
  leatherId: number;

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

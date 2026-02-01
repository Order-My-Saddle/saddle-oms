import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaddleExtraDto {
  @ApiProperty({
    description: "Saddle extra unique identifier",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Saddle ID",
    example: 1,
  })
  saddleId: number;

  @ApiProperty({
    description: "Extra ID",
    example: 5,
  })
  extraId: number;

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

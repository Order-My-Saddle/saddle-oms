import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PresetDto {
  @ApiProperty({
    description: "Unique identifier of the preset",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Name of the preset",
    example: "Classic Dressage",
  })
  name: string;

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
    description: "Whether the preset is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Display name for UI",
    example: "Classic Dressage",
  })
  displayName?: string;
}

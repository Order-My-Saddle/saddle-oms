import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LeathertypeDto {
  @ApiProperty({
    description: "Unique identifier of the leather type",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Name of the leather type",
    example: "Vienna Buffalo",
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
    description: "Whether the leather type is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Display name for UI",
    example: "Vienna Buffalo",
  })
  displayName?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ModelDto {
  @ApiProperty({
    description: "Model unique identifier",
    example: 12345,
  })
  id: number;

  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Brand ID this model belongs to",
    example: 1,
  })
  brandId?: number;

  @ApiPropertyOptional({
    description: "Brand name",
    example: "Icon",
  })
  brandName?: string;

  @ApiPropertyOptional({
    description: "Model description",
    example: "A classic dressage saddle for competitive riders",
  })
  description?: string;

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
    description: "Whether the model is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;
}

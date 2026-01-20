import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SaddleDto {
  @ApiProperty({
    description: "Saddle unique identifier",
    example: 12345,
  })
  id: number;

  @ApiPropertyOptional({
    description: "EU factory ID",
    example: 1,
  })
  factoryEu?: number;

  @ApiPropertyOptional({
    description: "GB factory ID",
    example: 2,
  })
  factoryGb?: number;

  @ApiPropertyOptional({
    description: "US factory ID",
    example: 3,
  })
  factoryUs?: number;

  @ApiPropertyOptional({
    description: "CA factory ID",
    example: 4,
  })
  factoryCa?: number;

  @ApiPropertyOptional({
    description: "AUD factory ID",
    example: 5,
  })
  factoryAud?: number;

  @ApiPropertyOptional({
    description: "DE factory ID",
    example: 6,
  })
  factoryDe?: number;

  @ApiPropertyOptional({
    description: "NL factory ID",
    example: 7,
  })
  factoryNl?: number;

  @ApiProperty({
    description: "Brand name",
    example: "Icon",
  })
  brand: string;

  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
  })
  modelName: string;

  @ApiPropertyOptional({
    description: "Presets configuration",
    example: "1,2,3",
  })
  presets?: string;

  @ApiPropertyOptional({
    description: "Active status (0 = inactive, 1 = active)",
    example: 1,
  })
  active?: number;

  @ApiPropertyOptional({
    description: "Saddle type",
    example: 1,
  })
  type?: number;

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
    description: "Whether the saddle is active (deleted = 0 and active = 1)",
    example: true,
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Display name (brand - model_name)",
    example: "Icon - Classic Dressage",
  })
  displayName?: string;
}

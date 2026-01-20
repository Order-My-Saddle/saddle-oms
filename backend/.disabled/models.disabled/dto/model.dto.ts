import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BrandDto } from "../../brands/dto/brand.dto";

export class ModelDto {
  @ApiProperty({
    description: "Model unique identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Brand ID that this model belongs to",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  @Expose()
  brandId: string;

  @ApiProperty({
    description: "Model name",
    example: "Classic Dressage",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Display sequence",
    example: 1,
  })
  @Expose()
  sequence: number;

  @ApiProperty({
    description: "Model description",
    example: "High-quality dressage saddle model",
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: "Model image URL",
    example: "https://example.com/images/classic-dressage.jpg",
    required: false,
  })
  @Expose()
  imageUrl?: string;

  @ApiProperty({
    description: "Base price of the model",
    example: 1999.99,
  })
  @Expose()
  basePrice: number;

  @ApiProperty({
    description: "Whether the model is customizable",
    example: true,
  })
  @Expose()
  isCustomizable: boolean;

  @ApiProperty({
    description: "Model status",
    example: "active",
  })
  @Expose()
  status: string;

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
    description: "Whether the model is active",
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: "Model display name",
    example: "Classic Dressage",
  })
  @Expose()
  displayName: string;

  @ApiProperty({
    description: "Associated brand information",
    type: () => BrandDto,
    required: false,
  })
  @Expose()
  brand?: BrandDto;
}

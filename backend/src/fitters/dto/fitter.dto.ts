import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FitterDto {
  @ApiProperty({
    description: "Fitter unique identifier",
    example: 12345,
  })
  id: number;

  @ApiPropertyOptional({
    description: "Associated user ID",
    example: 123,
  })
  userId?: number;

  @ApiPropertyOptional({
    description: "Soft delete flag (0 = active, 1 = deleted)",
    example: 0,
  })
  deleted?: number;

  @ApiPropertyOptional({
    description: "Fitter address",
    example: "123 Main Street",
  })
  address?: string;

  @ApiPropertyOptional({
    description: "Fitter postal/zip code",
    example: "10001",
  })
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Fitter state/province",
    example: "NY",
  })
  state?: string;

  @ApiPropertyOptional({
    description: "Fitter city",
    example: "New York",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "Fitter country",
    example: "United States",
  })
  country?: string;

  @ApiPropertyOptional({
    description: "Fitter phone number",
    example: "+1-555-123-4567",
  })
  phoneNo?: string;

  @ApiPropertyOptional({
    description: "Fitter cell/mobile number",
    example: "+1-555-987-6543",
  })
  cellNo?: string;

  @ApiPropertyOptional({
    description: "Currency code (integer identifier)",
    example: 1,
  })
  currency?: number;

  @ApiPropertyOptional({
    description: "Fitter email address",
    example: "fitter@example.com",
  })
  emailaddress?: string;

  @ApiPropertyOptional({
    description: "Fitter creation date",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: "Fitter last update date",
    example: "2024-01-15T10:30:00.000Z",
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: "ID of user who created this fitter",
  })
  createdBy?: number;

  @ApiPropertyOptional({
    description: "ID of user who last updated this fitter",
  })
  updatedBy?: number;

  @ApiPropertyOptional({
    description: "Soft delete timestamp",
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: "Full formatted address",
    example: "123 Main Street, New York, NY, 10001, United States",
  })
  fullAddress?: string;

  @ApiPropertyOptional({
    description: "Display name for the fitter",
    example: "Fitter in New York",
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: "Whether fitter is active (deleted = 0)",
    example: true,
  })
  isActive?: boolean;
}

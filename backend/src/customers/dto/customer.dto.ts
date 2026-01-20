import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CustomerStatus } from "../domain/value-objects/customer-status.value-object";

export class CustomerDto {
  @ApiProperty({
    description: "Customer unique identifier",
    example: 12345,
  })
  id: number;

  @ApiPropertyOptional({
    description: "Customer email address",
    example: "john.doe@example.com",
  })
  email?: string;

  @ApiProperty({
    description: "Customer full name",
    example: "John Doe",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Horse name",
    example: "Thunder",
  })
  horseName?: string;

  @ApiPropertyOptional({
    description: "Company name",
    example: "Equestrian Services Inc.",
  })
  company?: string;

  @ApiPropertyOptional({
    description: "Customer address",
    example: "123 Main Street",
  })
  address?: string;

  @ApiPropertyOptional({
    description: "Customer city",
    example: "New York",
  })
  city?: string;

  @ApiPropertyOptional({
    description: "Customer state/province",
    example: "NY",
  })
  state?: string;

  @ApiPropertyOptional({
    description: "Customer postal/zip code",
    example: "10001",
  })
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Customer country",
    example: "United States",
  })
  country?: string;

  @ApiPropertyOptional({
    description: "Customer phone number",
    example: "+1-555-123-4567",
  })
  phoneNo?: string;

  @ApiPropertyOptional({
    description: "Customer cell/mobile number",
    example: "+1-555-987-6543",
  })
  cellNo?: string;

  @ApiPropertyOptional({
    description: "Customer bank account number",
    example: "NL91ABNA0417164300",
  })
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: "Assigned fitter ID",
    example: 12345,
  })
  fitterId?: number;

  @ApiPropertyOptional({
    description: "Soft delete flag (0 = active, 1 = deleted)",
    example: 0,
  })
  deleted?: number;

  @ApiProperty({
    description: "Customer status",
    enum: CustomerStatus,
    example: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @ApiPropertyOptional({
    description: "Customer creation date",
    example: "2024-01-15T10:30:00.000Z",
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    description: "Customer last update date",
    example: "2024-01-15T10:30:00.000Z",
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: "Customer display name",
    example: "John Doe (john.doe@example.com)",
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: "Whether customer is active",
    example: true,
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Whether customer has a fitter assigned",
    example: true,
  })
  hasFitter?: boolean;
}

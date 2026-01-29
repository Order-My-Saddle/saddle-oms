import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateCustomerDto {
  @ApiPropertyOptional({
    description: "Customer email address",
    example: "john.doe@example.com",
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiProperty({
    description: "Customer full name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({
    description: "Horse name",
    example: "Thunder",
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  horseName?: string;

  @ApiPropertyOptional({
    description: "Company name",
    example: "Equestrian Services Inc.",
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  company?: string;

  @ApiPropertyOptional({
    description: "Customer address",
    example: "123 Main Street",
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @ApiPropertyOptional({
    description: "Customer city",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @ApiPropertyOptional({
    description: "Customer state/province",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @ApiPropertyOptional({
    description: "Customer postal/zip code",
    example: "10001",
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Customer country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  country?: string;

  @ApiPropertyOptional({
    description: "Customer phone number",
    example: "+1-555-123-4567",
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  phoneNo?: string;

  @ApiPropertyOptional({
    description: "Customer cell/mobile number",
    example: "+1-555-987-6543",
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  cellNo?: string;

  @ApiPropertyOptional({
    description: "Customer bank account number",
    example: "NL91ABNA0417164300",
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: "Fitter ID to assign to this customer",
    example: 12345,
  })
  @IsOptional()
  fitterId?: number;
}

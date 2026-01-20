import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator";

/**
 * Create Order Data Transfer Object
 *
 * Defines the required data for creating a new order
 * Based on database schema: orders table
 */
export class CreateOrderDto {
  // Core relationships
  @ApiPropertyOptional({
    description: "Fitter ID",
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  fitterId?: number;

  @ApiPropertyOptional({
    description: "Saddle/Product ID",
    example: 456,
  })
  @IsOptional()
  @IsNumber()
  saddleId?: number;

  @ApiPropertyOptional({
    description: "Leather type ID",
    example: 789,
  })
  @IsOptional()
  @IsNumber()
  leatherId?: number;

  @ApiPropertyOptional({
    description: "Factory ID",
    example: 101,
  })
  @IsOptional()
  @IsNumber()
  factoryId?: number;

  @ApiPropertyOptional({
    description: "Customer ID",
    example: 202,
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  // Order flags
  @ApiPropertyOptional({
    description: "Fitter stock flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  fitterStock?: number;

  @ApiPropertyOptional({
    description: "Custom order flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  customOrder?: number;

  @ApiPropertyOptional({
    description: "Repair order flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  repair?: number;

  @ApiPropertyOptional({
    description: "Demo order flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  demo?: number;

  @ApiPropertyOptional({
    description: "Sponsored order flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  sponsored?: number;

  @ApiPropertyOptional({
    description: "Rushed order flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  rushed?: number;

  @ApiPropertyOptional({
    description: "Changed flag (0 = no, 1 = yes)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  changed?: number;

  // Contact information
  @ApiPropertyOptional({
    description: "Fitter reference number",
    example: "FIT-001",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fitterReference?: string;

  @ApiPropertyOptional({
    description: "Horse name",
    example: "Thunder",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  horseName?: string;

  @ApiPropertyOptional({
    description: "Recipient name",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: "Address",
    example: "123 Main Street",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    description: "Zipcode",
    example: "10001",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipcode?: string;

  @ApiPropertyOptional({
    description: "City",
    example: "New York",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: "State",
    example: "NY",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({
    description: "Country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: "Phone number",
    example: "+1-555-123-4567",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phoneNo?: string;

  @ApiPropertyOptional({
    description: "Cell number",
    example: "+1-555-987-6543",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cellNo?: string;

  @ApiPropertyOptional({
    description: "Email",
    example: "customer@example.com",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  // Shipping address
  @ApiPropertyOptional({
    description: "Shipping recipient name",
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  shipName?: string;

  @ApiPropertyOptional({
    description: "Shipping address",
    example: "456 Oak Avenue",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shipAddress?: string;

  @ApiPropertyOptional({
    description: "Shipping zipcode",
    example: "90210",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shipZipcode?: string;

  @ApiPropertyOptional({
    description: "Shipping city",
    example: "Los Angeles",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipCity?: string;

  @ApiPropertyOptional({
    description: "Shipping state",
    example: "CA",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipState?: string;

  @ApiPropertyOptional({
    description: "Shipping country",
    example: "United States",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shipCountry?: string;

  // Pricing fields
  @ApiPropertyOptional({
    description: "Saddle price (in cents)",
    example: 250000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceSaddle?: number;

  @ApiPropertyOptional({
    description: "Trade-in value (in cents)",
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  priceTradein?: number;

  @ApiPropertyOptional({
    description: "Deposit amount (in cents)",
    example: 75000,
  })
  @IsOptional()
  @IsNumber()
  priceDeposit?: number;

  @ApiPropertyOptional({
    description: "Discount amount (in cents)",
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  priceDiscount?: number;

  @ApiPropertyOptional({
    description: "Fitting evaluation fee (in cents)",
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  priceFittingeval?: number;

  @ApiPropertyOptional({
    description: "Call fee (in cents)",
    example: 2500,
  })
  @IsOptional()
  @IsNumber()
  priceCallfee?: number;

  @ApiPropertyOptional({
    description: "Girth price (in cents)",
    example: 15000,
  })
  @IsOptional()
  @IsNumber()
  priceGirth?: number;

  @ApiPropertyOptional({
    description: "Shipping cost (in cents)",
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  priceShipping?: number;

  @ApiPropertyOptional({
    description: "Tax amount (in cents)",
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  priceTax?: number;

  @ApiPropertyOptional({
    description: "Additional costs (in cents)",
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  priceAdditional?: number;

  // Order status and tracking
  @ApiPropertyOptional({
    description: "Order status ID",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  orderStatus?: number;

  @ApiPropertyOptional({
    description: "Order step",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  orderStep?: number;

  @ApiPropertyOptional({
    description: "Order time (Unix timestamp)",
    example: 1704067200,
  })
  @IsOptional()
  @IsNumber()
  orderTime?: number;

  @ApiPropertyOptional({
    description: "Payment time (Unix timestamp)",
    example: 1704153600,
  })
  @IsOptional()
  @IsNumber()
  paymentTime?: number;

  @ApiPropertyOptional({
    description: "Serial number",
    example: "SN-2024-001234",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiPropertyOptional({
    description: "OMS version",
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  omsVersion?: number;

  @ApiPropertyOptional({
    description: "Currency code",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  currency?: number;

  @ApiPropertyOptional({
    description: "Special notes",
    example: "Handle with care - sensitive horse",
  })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiPropertyOptional({
    description: "Payment details (text/JSON)",
    example: "Credit Card - Visa ending 4242",
  })
  @IsOptional()
  @IsString()
  payment?: string;

  @ApiPropertyOptional({
    description: "Order data (JSON)",
    example: '{"seatSize":"17.5","flap":"long"}',
  })
  @IsOptional()
  @IsString()
  orderData?: string;
}

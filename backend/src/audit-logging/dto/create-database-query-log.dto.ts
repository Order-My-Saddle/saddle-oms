import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO for creating database query log entries
 * Used for migration from legacy system and new query logging
 */
export class CreateDatabaseQueryLogDto {
  @ApiProperty({
    description: "SQL query that was executed",
    example: "SELECT * FROM orders WHERE customer_id = ? AND status = ?",
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: "ID of the user who triggered the query",
    example: 54321,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: "Timestamp when the query was executed (ISO 8601 format)",
    example: "2024-01-15T14:30:00.000Z",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value).toISOString())
  timestamp: string;

  @ApiProperty({
    description: "Page/endpoint that triggered the query",
    example: "/api/orders/search",
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiProperty({
    description: "Stack trace/backtrace information",
    example: "at OrderService.findAll (/app/src/orders/order.service.ts:45:12)",
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  backtrace: string;
}

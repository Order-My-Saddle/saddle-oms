import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

/**
 * DTO for database query log response
 * Represents query log data returned by API endpoints
 */
export class DatabaseQueryLogDto {
  @ApiProperty({
    description: "Unique identifier for the query log entry",
    example: 12345,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: "SQL query that was executed",
    example: "SELECT * FROM orders WHERE customer_id = ? AND status = ?",
  })
  @Expose()
  query: string;

  @ApiProperty({
    description: "ID of the user who triggered the query",
    example: 54321,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: "Timestamp when the query was executed",
    example: "2024-01-15T14:30:00.000Z",
  })
  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  timestamp: string;

  @ApiProperty({
    description: "Page/endpoint that triggered the query",
    example: "/api/orders/search",
  })
  @Expose()
  page: string;

  @ApiProperty({
    description: "Stack trace/backtrace information",
    example: "at OrderService.findAll (/app/src/orders/order.service.ts:45:12)",
  })
  @Expose()
  backtrace: string;

  @ApiProperty({
    description: "When this query log entry was created in the system",
    example: "2024-01-15T14:30:01.000Z",
  })
  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value,
  )
  createdAt: string;

  @ApiPropertyOptional({
    description: "User information (populated when requested)",
  })
  @Expose()
  user?: {
    id: number;
    username: string;
    name: string;
    email?: string;
  };

  @ApiPropertyOptional({
    description: "Truncated query for display purposes",
    example: "SELECT * FROM orders WHERE...",
  })
  @Expose()
  queryTruncated?: string;

  @ApiPropertyOptional({
    description: "Estimated query execution time (if available)",
    example: 125.5,
  })
  @Expose()
  executionTimeMs?: number;
}

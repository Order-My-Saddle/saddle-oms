import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

/**
 * Factory Employee DTO
 * Data transfer object for returning factory employee data
 */
export class FactoryEmployeeDto {
  @ApiProperty({
    description: "Factory employee ID",
    example: 1,
    type: "integer",
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: "Factory ID that the employee belongs to",
    example: 123,
    type: "integer",
  })
  @Expose()
  factoryId: number;

  @ApiProperty({
    description: "Employee full name",
    example: "John Smith",
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: "Employee creation date",
    example: "2024-01-15T10:30:00.000Z",
    type: "string",
    format: "date-time",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Employee last update date",
    example: "2024-01-15T10:30:00.000Z",
    type: "string",
    format: "date-time",
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: "Employee display information",
    example: "John Smith (Factory: 1)",
  })
  @Expose()
  displayInfo: string;
}

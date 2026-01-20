import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, IsInt, IsPositive } from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Create Factory Employee DTO
 * Data transfer object for creating a new factory employee
 */
export class CreateFactoryEmployeeDto {
  @ApiProperty({
    description: "Factory ID that the employee belongs to",
    example: 1,
    type: "integer",
  })
  @Type(() => Number)
  @IsInt({ message: "Factory ID must be an integer" })
  @IsPositive({ message: "Factory ID must be a positive number" })
  @IsNotEmpty({ message: "Factory ID cannot be empty" })
  factoryId: number;

  @ApiProperty({
    description: "Employee full name",
    example: "John Smith",
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name cannot be empty" })
  @Length(1, 255, { message: "Name must be between 1 and 255 characters" })
  @Transform(({ value }) => value?.trim())
  name: string;
}

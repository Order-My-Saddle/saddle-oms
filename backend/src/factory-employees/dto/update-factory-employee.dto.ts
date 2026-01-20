import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length, IsInt, IsPositive } from "class-validator";
import { Transform, Type } from "class-transformer";

/**
 * Update Factory Employee DTO
 * Data transfer object for updating an existing factory employee
 */
export class UpdateFactoryEmployeeDto {
  @ApiPropertyOptional({
    description: "Factory ID that the employee belongs to",
    example: 1,
    type: "integer",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Factory ID must be an integer" })
  @IsPositive({ message: "Factory ID must be a positive number" })
  factoryId?: number;

  @ApiPropertyOptional({
    description: "Employee full name",
    example: "John Smith",
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @Length(1, 255, { message: "Name must be between 1 and 255 characters" })
  @Transform(({ value }) => value?.trim())
  name?: string;
}

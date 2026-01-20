import { Injectable } from "@nestjs/common";
import { Brand } from "../domain/brand";
import { BrandDto } from "../dto/brand.dto";

/**
 * Brand DTO Mapper
 *
 * Converts between domain entities and DTOs for API responses
 */
@Injectable()
export class BrandMapper {
  /**
   * Convert domain entity to DTO
   */
  public toDto(brand: Brand): BrandDto {
    const dto = new BrandDto();

    dto.id = brand.id;
    dto.name = brand.name;
    dto.createdAt = brand.createdAt;
    dto.updatedAt = brand.updatedAt;
    dto.isActive = brand.isActive(); // Use domain method
    dto.displayName = brand.name;

    return dto;
  }

  /**
   * Convert array of domain entities to array of DTOs
   */
  public toDtoArray(brands: Brand[]): BrandDto[] {
    return brands.map((brand) => this.toDto(brand));
  }
}

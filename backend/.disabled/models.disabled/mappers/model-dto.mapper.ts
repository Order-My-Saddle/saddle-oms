import { Injectable } from "@nestjs/common";
import { Model } from "../domain/model";
import { ModelDto } from "../dto/model.dto";

/**
 * Model DTO Mapper
 *
 * Converts between domain entities and DTOs for API responses
 */
@Injectable()
export class ModelMapper {
  /**
   * Convert domain entity to DTO
   */
  public toDto(model: Model): ModelDto {
    const dto = new ModelDto();

    dto.id = model.id.toString(); // Convert number to string
    dto.brandId = model.brandId.toString(); // Convert number to string
    dto.name = model.name;
    // Simplified model doesn't have these properties
    dto.description = ""; // Default since not in domain
    dto.imageUrl = ""; // Default since not in domain
    dto.basePrice = 0; // Default since not in domain
    dto.isCustomizable = false; // Default since not in domain
    dto.status = "ACTIVE"; // Default since not in domain
    dto.createdAt = model.createdAt;
    dto.updatedAt = model.updatedAt;

    return dto;
  }

  /**
   * Convert array of domain entities to array of DTOs
   */
  public toDtoArray(models: Model[]): ModelDto[] {
    return models.map((model) => this.toDto(model));
  }
}

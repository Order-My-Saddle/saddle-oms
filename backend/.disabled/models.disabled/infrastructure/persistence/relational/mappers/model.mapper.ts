import { Injectable } from "@nestjs/common";
import { Model } from "../../../../domain/model";
import { ModelEntity } from "../entities/model.entity";

/**
 * Model Mapper
 *
 * Converts between domain entities and persistence entities
 * Ensures proper separation between domain and infrastructure layers
 */
@Injectable()
export class ModelMapper {
  /**
   * Convert domain entity to persistence entity
   */
  public toEntity(model: Model): ModelEntity {
    const entity = new ModelEntity();

    // For new models (id = 0), don't set UUID, let TypeORM generate
    if (model.id !== 0) {
      entity.legacyId = model.id; // Store domain id as legacyId
    }
    entity.brandLegacyId = model.brandId; // Use brandLegacyId field
    entity.name = model.name;
    entity.createdAt = model.createdAt;
    entity.updatedAt = model.updatedAt;
    entity.deletedAt = model.deletedAt;

    return entity;
  }

  /**
   * Convert persistence entity to domain entity
   */
  public toDomain(entity: ModelEntity): Model {
    return new Model(
      entity.legacyId || 0, // Use legacyId for domain ID
      entity.brandLegacyId, // Use brandLegacyId field
      entity.name,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }

  /**
   * Convert array of entities to array of domain objects
   */
  public toDomainArray(entities: ModelEntity[]): Model[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domain objects to array of entities
   */
  public toEntityArray(models: Model[]): ModelEntity[] {
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Update existing entity with domain data (for updates)
   */
  public updateEntity(entity: ModelEntity, model: Model): ModelEntity {
    entity.brandLegacyId = model.brandId; // Use brandLegacyId field
    entity.name = model.name;
    entity.updatedAt = model.updatedAt;
    entity.deletedAt = model.deletedAt;

    return entity;
  }
}

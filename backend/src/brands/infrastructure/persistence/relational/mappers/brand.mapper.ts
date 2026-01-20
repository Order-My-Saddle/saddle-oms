import { Injectable } from "@nestjs/common";
import { Brand } from "../../../../domain/brand";
import { BrandEntity } from "../entities/brand.entity";

/**
 * Brand Mapper
 *
 * Converts between domain entities and persistence entities
 * Ensures proper separation between domain and infrastructure layers
 */
@Injectable()
export class BrandMapper {
  /**
   * Convert domain entity to persistence entity
   */
  public toEntity(brand: Brand): BrandEntity {
    const entity = new BrandEntity();

    // For new brands, let TypeORM generate the ID
    if (brand.id !== 0) {
      entity.id = brand.id;
    }
    entity.name = brand.name;
    entity.createdAt = brand.createdAt || new Date();
    entity.updatedAt = brand.updatedAt || new Date();

    return entity;
  }

  /**
   * Convert persistence entity to domain entity
   */
  public toDomain(entity: BrandEntity): Brand {
    return new Brand(
      entity.id,
      entity.name,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    );
  }

  /**
   * Convert array of entities to array of domain objects
   */
  public toDomainArray(entities: BrandEntity[]): Brand[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domain objects to array of entities
   */
  public toEntityArray(brands: Brand[]): BrandEntity[] {
    return brands.map((brand) => this.toEntity(brand));
  }

  /**
   * Update existing entity with domain data (for updates)
   */
  public updateEntity(entity: BrandEntity, brand: Brand): BrandEntity {
    entity.name = brand.name;
    entity.updatedAt = brand.updatedAt || new Date();

    return entity;
  }
}

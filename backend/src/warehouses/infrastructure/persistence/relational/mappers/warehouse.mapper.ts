import { Injectable } from "@nestjs/common";
import { Warehouse } from "../../../../domain/warehouse";
import { WarehouseId } from "../../../../domain/value-objects/warehouse-id.value-object";
import { WarehouseEntity } from "../entities/warehouse.entity";

/**
 * Warehouse Infrastructure Mapper
 *
 * Maps between domain entities and TypeORM entities.
 * Handles the conversion of domain value objects to database primitives.
 */
@Injectable()
export class WarehouseMapper {
  /**
   * Convert domain entity to TypeORM entity
   */
  toPersistence(domain: Warehouse): WarehouseEntity {
    const entity = new WarehouseEntity();

    entity.id = domain.id.toString();
    entity.name = domain.name;
    entity.code = domain.code;
    entity.address = domain.address;
    entity.city = domain.city;
    entity.country = domain.country;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Convert TypeORM entity to domain entity
   */
  toDomain(entity: WarehouseEntity): Warehouse {
    const warehouseId = WarehouseId.fromString(entity.id);

    // Use private constructor through Object.create and Object.defineProperty
    const warehouse = Object.create(Warehouse.prototype);

    // Set private properties using Object.defineProperty
    Object.defineProperty(warehouse, "_id", {
      value: warehouseId,
      writable: false,
    });
    Object.defineProperty(warehouse, "_name", {
      value: entity.name,
      writable: true,
    });
    Object.defineProperty(warehouse, "_code", {
      value: entity.code,
      writable: true,
    });
    Object.defineProperty(warehouse, "_address", {
      value: entity.address,
      writable: true,
    });
    Object.defineProperty(warehouse, "_city", {
      value: entity.city,
      writable: true,
    });
    Object.defineProperty(warehouse, "_country", {
      value: entity.country,
      writable: true,
    });
    Object.defineProperty(warehouse, "_isActive", {
      value: entity.isActive,
      writable: true,
    });
    Object.defineProperty(warehouse, "_createdAt", {
      value: entity.createdAt,
      writable: false,
    });
    Object.defineProperty(warehouse, "_updatedAt", {
      value: entity.updatedAt,
      writable: true,
    });
    Object.defineProperty(warehouse, "_domainEvents", {
      value: [],
      writable: true,
    });

    return warehouse;
  }

  /**
   * Convert multiple TypeORM entities to domain entities
   */
  toDomainMany(entities: WarehouseEntity[]): Warehouse[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert multiple domain entities to TypeORM entities
   */
  toPersistenceMany(domains: Warehouse[]): WarehouseEntity[] {
    return domains.map((domain) => this.toPersistence(domain));
  }
}

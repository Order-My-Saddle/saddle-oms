import { FactoryEmployee } from "../../../../domain/factory-employee";
import { FactoryEmployeeId } from "../../../../domain/value-objects/factory-employee-id.value-object";
import { FactoryEmployeeEntity } from "../entities/factory-employee.entity";

/**
 * Factory Employee Mapper
 * Handles mapping between domain entity and persistence entity
 */
export class FactoryEmployeeMapper {
  /**
   * Map from persistence entity to domain entity
   */
  static toDomain(entity: FactoryEmployeeEntity): FactoryEmployee | null {
    if (!entity) {
      return null;
    }

    const id = FactoryEmployeeId.fromNumber(entity.id);

    return new FactoryEmployee(
      id,
      entity.factoryId,
      entity.name,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  /**
   * Map from domain entity to persistence entity
   */
  static toPersistence(domain: FactoryEmployee): FactoryEmployeeEntity | null {
    if (!domain) {
      return null;
    }

    const entity = new FactoryEmployeeEntity();
    entity.id = domain.id.value;
    entity.factoryId = domain.factoryId;
    entity.name = domain.name;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Map array of persistence entities to domain entities
   */
  static toDomainArray(entities: FactoryEmployeeEntity[]): FactoryEmployee[] {
    if (!entities || entities.length === 0) {
      return [];
    }

    return entities
      .map((entity) => this.toDomain(entity))
      .filter((domain) => domain !== null) as FactoryEmployee[];
  }

  /**
   * Map array of domain entities to persistence entities
   */
  static toPersistenceArray(
    domains: FactoryEmployee[],
  ): FactoryEmployeeEntity[] {
    if (!domains || domains.length === 0) {
      return [];
    }

    return domains
      .map((domain) => this.toPersistence(domain))
      .filter((entity) => entity !== null) as FactoryEmployeeEntity[];
  }
}

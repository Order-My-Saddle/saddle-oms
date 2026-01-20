import { Extra } from "../../../../domain/extra";
import { ExtraEntity } from "../entities/extra.entity";
import { ExtraId } from "../../../../domain/value-objects/extra-id.value-object";
import { ExtraStatus } from "../../../../domain/value-objects/extra-status.value-object";

export class ExtraMapper {
  static toDomain(entity: ExtraEntity): Extra {
    return new Extra(
      new ExtraId(entity.id),
      entity.name,
      entity.description || "",
      entity.price || 0,
      true, // Default isOptional since entity doesn't have this field
      ExtraStatus.ACTIVE, // Default status since entity doesn't have this field
      entity.createdAt || new Date(),
      entity.updatedAt || new Date(),
    );
  }

  static toPersistence(domain: Extra): ExtraEntity {
    const entity = new ExtraEntity();
    entity.id = domain.id.value;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price;
    // isOptional and status don't exist in entity, skip them
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

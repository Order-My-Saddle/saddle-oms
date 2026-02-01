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
      entity.price1 || 0,
      true,
      ExtraStatus.ACTIVE,
      entity.createdAt || new Date(),
      entity.updatedAt || new Date(),
    );
  }

  static toPersistence(domain: Extra): ExtraEntity {
    const entity = new ExtraEntity();
    entity.id = domain.id.value;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price1 = domain.price;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

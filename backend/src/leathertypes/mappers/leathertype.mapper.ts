import { LeathertypeEntity } from "../infrastructure/persistence/relational/entities/leathertype.entity";
import { LeathertypeDto } from "../dto/leathertype.dto";

/**
 * Leathertype Mapper
 *
 * Maps between Leathertype entity and DTO.
 * Simplified schema with name, sequence, and deleted flag.
 */
export class LeathertypeMapper {
  public static toDto(entity: LeathertypeEntity): LeathertypeDto {
    const dto = new LeathertypeDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.sequence = entity.sequence;
    dto.deleted = entity.deleted;
    dto.isActive = entity.deleted === 0;
    dto.displayName = entity.name;
    return dto;
  }

  public static toDtos(entities: LeathertypeEntity[]): LeathertypeDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}

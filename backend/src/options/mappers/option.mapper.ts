import { OptionEntity } from "../infrastructure/persistence/relational/entities/option.entity";
import { OptionDto } from "../dto/option.dto";

/**
 * Option Mapper
 *
 * Maps between Option entity and DTO.
 * Uses 7-tier pricing structure.
 */
export class OptionMapper {
  public static toDto(entity: OptionEntity): OptionDto {
    const dto = new OptionDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.group = entity.group;
    dto.type = entity.type;
    dto.price1 = entity.price1;
    dto.price2 = entity.price2;
    dto.price3 = entity.price3;
    dto.price4 = entity.price4;
    dto.price5 = entity.price5;
    dto.price6 = entity.price6;
    dto.price7 = entity.price7;
    dto.priceContrast1 = entity.priceContrast1;
    dto.priceContrast2 = entity.priceContrast2;
    dto.priceContrast3 = entity.priceContrast3;
    dto.priceContrast4 = entity.priceContrast4;
    dto.priceContrast5 = entity.priceContrast5;
    dto.priceContrast6 = entity.priceContrast6;
    dto.priceContrast7 = entity.priceContrast7;
    dto.sequence = entity.sequence;
    dto.extraAllowed = entity.extraAllowed;
    dto.deleted = entity.deleted;
    dto.isActive = entity.deleted === 0;
    return dto;
  }

  public static toDtos(entities: OptionEntity[]): OptionDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}

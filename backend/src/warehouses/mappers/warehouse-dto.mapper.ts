import { Injectable } from "@nestjs/common";
import { Warehouse } from "../domain/warehouse";
import { WarehouseDto } from "../dto/warehouse.dto";

/**
 * Warehouse DTO Mapper
 *
 * Maps between domain entities and DTOs for API responses
 */
@Injectable()
export class WarehouseMapper {
  /**
   * Convert domain entity to DTO
   */
  toDto(warehouse: Warehouse): WarehouseDto {
    const dto = new WarehouseDto();

    dto.id = warehouse.id.toString();
    dto.name = warehouse.name;
    dto.code = warehouse.code;
    dto.address = warehouse.address;
    dto.city = warehouse.city;
    dto.country = warehouse.country;
    dto.isActive = warehouse.isActive;
    dto.fullAddress = warehouse.getFullAddress();
    dto.displayName = warehouse.code
      ? `${warehouse.name} (${warehouse.code})`
      : warehouse.name;
    dto.effectivelyActive = warehouse.isActive;
    dto.createdAt = warehouse.createdAt;
    dto.updatedAt = warehouse.updatedAt;
    dto.deletedAt = null;

    return dto;
  }

  /**
   * Convert multiple domain entities to DTOs
   */
  toDtoMany(warehouses: Warehouse[]): WarehouseDto[] {
    return warehouses.map((warehouse) => this.toDto(warehouse));
  }
}

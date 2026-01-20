import { Injectable } from "@nestjs/common";
import { FactoryEmployee } from "../domain/factory-employee";
import { FactoryEmployeeDto } from "../dto/factory-employee.dto";
import { CreateFactoryEmployeeDto } from "../dto/create-factory-employee.dto";
import { UpdateFactoryEmployeeDto } from "../dto/update-factory-employee.dto";
import { FactoryEmployeeId } from "../domain/value-objects/factory-employee-id.value-object";

/**
 * Factory Employee DTO Mapper
 * Handles mapping between domain entities and DTOs
 */
@Injectable()
export class FactoryEmployeeDtoMapper {
  /**
   * Map from domain entity to response DTO
   */
  static toDto(domain: FactoryEmployee): FactoryEmployeeDto | null {
    if (!domain) {
      return null;
    }

    const dto = new FactoryEmployeeDto();
    dto.id = domain.id.value;
    dto.factoryId = domain.factoryId;
    dto.name = domain.name;
    dto.createdAt = domain.createdAt;
    dto.updatedAt = domain.updatedAt;
    dto.displayInfo = domain.getDisplayInfo();

    return dto;
  }

  /**
   * Map from create DTO to domain entity
   */
  static fromCreateDto(dto: CreateFactoryEmployeeDto): {
    factoryId: number;
    name: string;
  } {
    return {
      factoryId: dto.factoryId,
      name: dto.name,
    };
  }

  /**
   * Map from update DTO to domain entity updates
   */
  static fromUpdateDto(dto: UpdateFactoryEmployeeDto): {
    factoryId?: number;
    name?: string;
  } {
    const updates: { factoryId?: number; name?: string } = {};

    if (dto.factoryId !== undefined) {
      updates.factoryId = dto.factoryId;
    }

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    return updates;
  }

  /**
   * Map array of domain entities to DTOs
   */
  static toDtoArray(domains: FactoryEmployee[]): FactoryEmployeeDto[] {
    if (!domains || domains.length === 0) {
      return [];
    }

    return domains
      .map((domain) => this.toDto(domain))
      .filter((dto) => dto !== null) as FactoryEmployeeDto[];
  }

  /**
   * Create domain entity from DTO data
   */
  static createDomainEntity(
    id: number,
    factoryId: number,
    name: string,
  ): FactoryEmployee {
    const employeeId = FactoryEmployeeId.fromNumber(id);
    return FactoryEmployee.create(employeeId, factoryId, name);
  }

  /**
   * Map pagination parameters
   */
  static mapPaginationParams(query: {
    limit?: number;
    offset?: number;
    page?: number;
  }): { limit: number; offset: number } {
    const limit = query.limit || 20;
    let offset = query.offset || 0;

    // If page is provided, calculate offset
    if (query.page && query.page > 1) {
      offset = (query.page - 1) * limit;
    }

    return { limit, offset };
  }
}

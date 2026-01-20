import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { FactoryEmployee } from "../../../../domain/factory-employee";
import { FactoryEmployeeId } from "../../../../domain/value-objects/factory-employee-id.value-object";
import { FactoryEmployeeRepository as FactoryEmployeeRepositoryInterface } from "../../../../domain/factory-employee.repository";
import { FactoryEmployeeEntity } from "../entities/factory-employee.entity";
import { FactoryEmployeeMapper } from "../mappers/factory-employee.mapper";

/**
 * Factory Employee Repository Implementation
 * Handles data access for factory employees using TypeORM
 */
@Injectable()
export class FactoryEmployeeRepository
  implements FactoryEmployeeRepositoryInterface
{
  constructor(
    @InjectRepository(FactoryEmployeeEntity)
    private readonly factoryEmployeeRepository: Repository<FactoryEmployeeEntity>,
  ) {}

  /**
   * Find factory employee by ID
   */
  async findById(id: FactoryEmployeeId): Promise<FactoryEmployee | null> {
    const entity = await this.factoryEmployeeRepository.findOne({
      where: { id: id.value },
    });

    return entity ? FactoryEmployeeMapper.toDomain(entity) : null;
  }

  /**
   * Find factory employees by factory ID
   */
  async findByFactoryId(factoryId: number): Promise<FactoryEmployee[]> {
    const entities = await this.factoryEmployeeRepository.find({
      where: { factoryId },
      order: { name: "ASC" },
    });

    return FactoryEmployeeMapper.toDomainArray(entities);
  }

  /**
   * Find all factory employees with optional filters
   */
  async findAll(filters?: {
    factoryId?: number;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<FactoryEmployee[]> {
    const queryBuilder =
      this.factoryEmployeeRepository.createQueryBuilder("factoryEmployee");

    if (filters?.factoryId) {
      queryBuilder.andWhere("factoryEmployee.factoryId = :factoryId", {
        factoryId: filters.factoryId,
      });
    }

    if (filters?.name) {
      queryBuilder.andWhere("factoryEmployee.name ILIKE :name", {
        name: `%${filters.name}%`,
      });
    }

    queryBuilder.orderBy("factoryEmployee.name", "ASC");

    if (filters?.limit) {
      queryBuilder.take(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.skip(filters.offset);
    }

    const entities = await queryBuilder.getMany();
    return FactoryEmployeeMapper.toDomainArray(entities);
  }

  /**
   * Count factory employees
   */
  async count(filters?: {
    factoryId?: number;
    name?: string;
  }): Promise<number> {
    const where: FindOptionsWhere<FactoryEmployeeEntity> = {};

    if (filters?.factoryId) {
      where.factoryId = filters.factoryId;
    }

    if (filters?.name) {
      // Note: TypeORM doesn't support ILIKE directly in FindOptionsWhere
      // For complex queries, we'll use query builder
      const queryBuilder =
        this.factoryEmployeeRepository.createQueryBuilder("factoryEmployee");

      if (filters.factoryId) {
        queryBuilder.andWhere("factoryEmployee.factoryId = :factoryId", {
          factoryId: filters.factoryId,
        });
      }

      queryBuilder.andWhere("factoryEmployee.name ILIKE :name", {
        name: `%${filters.name}%`,
      });

      return queryBuilder.getCount();
    }

    return this.factoryEmployeeRepository.count({ where });
  }

  /**
   * Save factory employee
   */
  async save(factoryEmployee: FactoryEmployee): Promise<FactoryEmployee> {
    const entity = FactoryEmployeeMapper.toPersistence(factoryEmployee);
    if (!entity) {
      throw new Error("Failed to map factory employee to persistence entity");
    }
    const savedEntity = await this.factoryEmployeeRepository.save(entity);
    const domainEntity = FactoryEmployeeMapper.toDomain(savedEntity);
    if (!domainEntity) {
      throw new Error("Failed to map saved entity back to domain");
    }
    return domainEntity;
  }

  /**
   * Update factory employee
   */
  async update(
    id: FactoryEmployeeId,
    updates: Partial<FactoryEmployee>,
  ): Promise<FactoryEmployee> {
    await this.factoryEmployeeRepository.update(id.value, {
      factoryId: updates.factoryId,
      name: updates.name,
      updatedAt: new Date(),
    });

    const updatedEntity = await this.factoryEmployeeRepository.findOne({
      where: { id: id.value },
    });

    if (!updatedEntity) {
      throw new Error(`Factory Employee with ID ${id.value} not found`);
    }

    const domainEntity = FactoryEmployeeMapper.toDomain(updatedEntity);
    if (!domainEntity) {
      throw new Error(
        `Failed to map updated entity to domain for ID ${id.value}`,
      );
    }

    return domainEntity;
  }

  /**
   * Delete factory employee
   */
  async delete(id: FactoryEmployeeId): Promise<void> {
    const result = await this.factoryEmployeeRepository.delete(id.value);

    if (result.affected === 0) {
      throw new Error(`Factory Employee with ID ${id.value} not found`);
    }
  }

  /**
   * Check if factory employee exists
   */
  async exists(id: FactoryEmployeeId): Promise<boolean> {
    const count = await this.factoryEmployeeRepository.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  /**
   * Check if factory employee exists by name within a factory
   */
  async existsByNameAndFactory(
    name: string,
    factoryId: number,
  ): Promise<boolean> {
    const count = await this.factoryEmployeeRepository.count({
      where: { name, factoryId },
    });
    return count > 0;
  }
}

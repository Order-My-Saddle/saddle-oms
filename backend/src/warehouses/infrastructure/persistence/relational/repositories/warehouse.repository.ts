import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindManyOptions, FindOneOptions, Like } from "typeorm";
import { IWarehouseRepository } from "../../../../domain/warehouse.repository";
import { Warehouse } from "../../../../domain/warehouse";
import { WarehouseId } from "../../../../domain/value-objects/warehouse-id.value-object";
import { WarehouseEntity } from "../entities/warehouse.entity";
import { WarehouseMapper } from "../mappers/warehouse.mapper";

/**
 * Warehouse TypeORM Repository Implementation
 *
 * Implements the domain repository interface using TypeORM.
 * Handles data persistence and retrieval operations.
 */
@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  private readonly logger = new Logger(WarehouseRepository.name);

  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly warehouseEntityRepository: Repository<WarehouseEntity>,
    private readonly warehouseMapper: WarehouseMapper,
  ) {}

  /**
   * Save a warehouse entity
   */
  async save(warehouse: Warehouse): Promise<void> {
    try {
      const entity = this.warehouseMapper.toPersistence(warehouse);
      await this.warehouseEntityRepository.save(entity);

      this.logger.debug(`Saved warehouse: ${warehouse.id.toString()}`);
    } catch (error) {
      this.logger.error(
        `Failed to save warehouse: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to save warehouse: ${error.message}`);
    }
  }

  /**
   * Find warehouse by ID
   */
  async findById(id: WarehouseId): Promise<Warehouse | null> {
    try {
      const options: FindOneOptions<WarehouseEntity> = {
        where: { id: id.toString() },
      };

      const entity = await this.warehouseEntityRepository.findOne(options);

      if (!entity) {
        return null;
      }

      return this.warehouseMapper.toDomain(entity);
    } catch (error) {
      this.logger.error(
        `Failed to find warehouse by ID: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find warehouse: ${error.message}`);
    }
  }

  /**
   * Find warehouse by code
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    try {
      const options: FindOneOptions<WarehouseEntity> = {
        where: { code },
      };

      const entity = await this.warehouseEntityRepository.findOne(options);

      if (!entity) {
        return null;
      }

      return this.warehouseMapper.toDomain(entity);
    } catch (error) {
      this.logger.error(
        `Failed to find warehouse by code: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find warehouse: ${error.message}`);
    }
  }

  /**
   * Find all warehouses with optional filters
   */
  async findAll(filters?: {
    name?: string;
    code?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<Warehouse[]> {
    try {
      const options: FindManyOptions<WarehouseEntity> = {
        order: { createdAt: "DESC" },
      };

      if (filters) {
        const where: any = {};

        if (filters.name) {
          where.name = Like(`%${filters.name}%`);
        }

        if (filters.code) {
          where.code = filters.code;
        }

        if (filters.city) {
          where.city = Like(`%${filters.city}%`);
        }

        if (filters.country) {
          where.country = Like(`%${filters.country}%`);
        }

        if (filters.isActive !== undefined) {
          where.isActive = filters.isActive;
        }

        options.where = where;
      }

      const entities = await this.warehouseEntityRepository.find(options);
      return this.warehouseMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(
        `Failed to find warehouses: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find warehouses: ${error.message}`);
    }
  }

  /**
   * Find active warehouses
   */
  async findActive(): Promise<Warehouse[]> {
    return this.findAll({ isActive: true });
  }

  /**
   * Find warehouses by country
   */
  async findByCountry(country: string): Promise<Warehouse[]> {
    return this.findAll({ country });
  }

  /**
   * Find warehouses by city
   */
  async findByCity(city: string): Promise<Warehouse[]> {
    return this.findAll({ city });
  }

  /**
   * Count warehouses by country
   */
  async countByCountry(country: string): Promise<number> {
    try {
      return await this.warehouseEntityRepository.count({
        where: { country: Like(`%${country}%`) },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count warehouses by country: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count warehouses: ${error.message}`);
    }
  }

  /**
   * Count active warehouses
   */
  async countActive(): Promise<number> {
    try {
      return await this.warehouseEntityRepository.count({
        where: { isActive: true },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count active warehouses: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count warehouses: ${error.message}`);
    }
  }

  /**
   * Delete warehouse (soft delete)
   */
  async delete(id: WarehouseId): Promise<void> {
    try {
      await this.warehouseEntityRepository.softDelete({ id: id.toString() });
      this.logger.debug(`Soft deleted warehouse: ${id.toString()}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete warehouse: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete warehouse: ${error.message}`);
    }
  }

  /**
   * Check if warehouse exists by code
   */
  async existsByCode(code: string): Promise<boolean> {
    try {
      const count = await this.warehouseEntityRepository.count({
        where: { code },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check warehouse existence by code: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Check if warehouse exists by name
   */
  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await this.warehouseEntityRepository.count({
        where: { name },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check warehouse existence by name: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}

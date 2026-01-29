import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BrandEntity } from "../entities/brand.entity";
import { IBrandRepository } from "../../../../domain/brand.repository";
import { Brand } from "../../../../domain/brand";
import { BrandMapper } from "../mappers/brand.mapper";

/**
 * Brand Repository Implementation
 *
 * Implements the domain repository interface using TypeORM
 * Note: The production brands table has no soft-delete column,
 * so all methods operate on all records.
 */
@Injectable()
export class BrandRepository implements IBrandRepository {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly repository: Repository<BrandEntity>,
    private readonly mapper: BrandMapper,
  ) {}

  async findById(id: number): Promise<Brand | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Brand | null> {
    const entity = await this.repository.findOne({
      where: { name },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStatus(): Promise<Brand[]> {
    const entities = await this.repository.find({
      order: { name: "ASC" },
    });

    return this.mapper.toDomainArray(entities);
  }

  async save(brand: Brand): Promise<void> {
    const existingEntity =
      brand.id !== 0
        ? await this.repository.findOne({ where: { id: brand.id } })
        : null;

    if (existingEntity) {
      // Update existing entity
      const updatedEntity = this.mapper.updateEntity(existingEntity, brand);
      await this.repository.save(updatedEntity);
    } else {
      // Create new entity
      const newEntity = this.mapper.toEntity(brand);
      await this.repository.save(newEntity);
    }
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ id });
  }

  async findAll(filters?: { name?: string }): Promise<Brand[]> {
    const queryBuilder = this.repository.createQueryBuilder("brand");

    if (filters?.name) {
      queryBuilder.where("brand.name ILIKE :name", {
        name: `%${filters.name}%`,
      });
    }

    queryBuilder.orderBy("brand.name", "ASC");

    const entities = await queryBuilder.getMany();
    return this.mapper.toDomainArray(entities);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { name },
    });
    return count > 0;
  }

  async findActiveBrands(): Promise<Brand[]> {
    const entities = await this.repository.find({
      order: { name: "ASC" },
    });

    return this.mapper.toDomainArray(entities);
  }

  async countByStatus(): Promise<number> {
    return this.repository.count();
  }
}

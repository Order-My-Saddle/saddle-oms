import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ModelEntity } from "../entities/model.entity";
import { IModelRepository } from "../../../../domain/model.repository";
import { Model } from "../../../../domain/model";
import { ModelId } from "../../../../domain/value-objects/model-id.value-object";
import { ModelStatus } from "../../../../domain/value-objects/model-status.value-object";
import { BrandId } from "../../../../../brands/domain/value-objects/brand-id.value-object";
import { ModelMapper } from "../mappers/model.mapper";

/**
 * Model Repository Implementation
 *
 * Implements the domain repository interface using TypeORM
 */
@Injectable()
export class ModelRepository implements IModelRepository {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly repository: Repository<ModelEntity>,
    private readonly mapper: ModelMapper,
  ) {}

  async findById(id: ModelId): Promise<Model | null> {
    const entity = await this.repository.findOne({
      where: {
        id: id.value,
        deletedAt: IsNull(),
      },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByName(name: string, brandId?: BrandId): Promise<Model | null> {
    const where: any = {
      name,
      deletedAt: IsNull(),
    };

    if (brandId) {
      // TODO: Implement proper UUID to legacy ID mapping
      // Skipping brand filter for now
    }

    const entity = await this.repository.findOne({ where });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByBrandId(brandId: BrandId): Promise<Model[]> {
    // TODO: Implement proper UUID to legacy ID mapping
    // For now, return all models since we can't map UUID to legacy ID
    const entities = await this.repository.find({
      where: {
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async findByStatus(status: ModelStatus): Promise<Model[]> {
    const entities = await this.repository.find({
      where: {
        // status, // Entity doesn't have status field
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async save(model: Model): Promise<void> {
    const existingEntity = await this.repository.findOne({
      where: { legacyId: model.id },
    });

    if (existingEntity) {
      // Update existing entity
      const updatedEntity = this.mapper.updateEntity(existingEntity, model);
      await this.repository.save(updatedEntity);
    } else {
      // Create new entity
      const newEntity = this.mapper.toEntity(model);
      await this.repository.save(newEntity);
    }
  }

  async delete(id: ModelId): Promise<void> {
    await this.repository.softDelete({ id: id.value });
  }

  async findAll(filters?: {
    status?: ModelStatus;
    brandId?: BrandId;
    name?: string;
    isCustomizable?: boolean;
  }): Promise<Model[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("model")
      .where("model.deletedAt IS NULL");

    if (filters?.status) {
      queryBuilder.andWhere("model.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.brandId) {
      queryBuilder.andWhere("model.brandId = :brandId", {
        brandId: filters.brandId.value,
      });
    }

    if (filters?.name) {
      queryBuilder.andWhere("model.name ILIKE :name", {
        name: `%${filters.name}%`,
      });
    }

    if (filters?.isCustomizable !== undefined) {
      queryBuilder.andWhere("model.isCustomizable = :isCustomizable", {
        isCustomizable: filters.isCustomizable,
      });
    }

    queryBuilder.orderBy("model.name", "ASC");

    const entities = await queryBuilder.getMany();
    return this.mapper.toDomainArray(entities);
  }

  async existsByName(name: string, brandId?: BrandId): Promise<boolean> {
    const where: any = {
      name,
      deletedAt: IsNull(),
    };

    if (brandId) {
      // TODO: Implement proper UUID to legacy ID mapping
      // Skipping brand filter for now
    }

    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findActiveModels(): Promise<Model[]> {
    const entities = await this.repository.find({
      where: {
        // status: ModelStatus.ACTIVE, // Entity doesn't have status field
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async findActiveModelsByBrand(brandId: BrandId): Promise<Model[]> {
    const entities = await this.repository.find({
      where: {
        // TODO: Implement proper UUID to legacy ID mapping
        // Skipping brand filter for now
        // status: ModelStatus.ACTIVE, // Entity doesn't have status field
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async countByStatus(status: ModelStatus): Promise<number> {
    return this.repository.count({
      where: {
        // status, // Entity doesn't have status field
        deletedAt: IsNull(),
      },
    });
  }

  async countByBrandId(brandId: BrandId): Promise<number> {
    return this.repository.count({
      where: {
        // TODO: Implement proper UUID to legacy ID mapping
        // Skipping brand filter for now
        deletedAt: IsNull(),
      },
    });
  }
}

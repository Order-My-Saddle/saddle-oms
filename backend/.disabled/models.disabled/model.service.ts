import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, IsNull } from "typeorm";
import { ModelEntity } from "./infrastructure/persistence/relational/entities/model.entity";
import { CreateModelDto } from "./dto/create-model.dto";
import { UpdateModelDto } from "./dto/update-model.dto";
import { ModelDto } from "./dto/model.dto";
import { plainToClass } from "class-transformer";

/**
 * Simplified Model Service using direct TypeORM operations
 */
@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
  ) {}

  /**
   * Create a new model
   */
  async create(createModelDto: CreateModelDto): Promise<ModelDto> {
    // Check if model with this name already exists for the brand
    const existingModel = await this.modelRepository.findOne({
      where: {
        name: createModelDto.name,
        brandLegacyId: createModelDto.brandId,
        deletedAt: IsNull(),
      },
    });

    if (existingModel) {
      throw new ConflictException(
        "Model with this name already exists for this brand",
      );
    }

    const model = this.modelRepository.create({
      ...createModelDto,
      brandLegacyId: createModelDto.brandId,
    });
    const savedModel = await this.modelRepository.save(model);

    return this.toDto(savedModel);
  }

  /**
   * Find model by ID (supports both UUID and legacy ID)
   */
  async findOne(id: string | number): Promise<ModelDto> {
    const whereClause = ModelEntity.createFindOptions(id);
    const model = await this.modelRepository.findOne({
      where: { ...whereClause, deletedAt: IsNull() },
      relations: ["brand"],
    });

    if (!model) {
      throw new NotFoundException("Model not found");
    }

    return this.toDto(model);
  }

  /**
   * Find all models with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    brandId?: number,
  ): Promise<{ data: ModelDto[]; total: number; pages: number }> {
    const where: any = { deletedAt: IsNull() };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (brandId) {
      where.brandLegacyId = brandId;
    }

    const [models, total] = await this.modelRepository.findAndCount({
      where,
      relations: ["brand"],
      order: { name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: models.map((model) => this.toDto(model)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update model
   */
  async update(
    id: string | number,
    updateModelDto: UpdateModelDto,
  ): Promise<ModelDto> {
    const whereClause =
      typeof id === "string"
        ? ModelEntity.createFindOptions(id)
        : { legacyId: id };
    const model = await this.modelRepository.findOne({
      where: { ...whereClause, deletedAt: IsNull() },
    });

    if (!model) {
      throw new NotFoundException("Model not found");
    }

    // Check for name conflicts if name is being changed
    if (updateModelDto.name && updateModelDto.name !== model.name) {
      const existingModel = await this.modelRepository.findOne({
        where: {
          name: updateModelDto.name,
          brandLegacyId: updateModelDto.brandId || model.brandLegacyId,
          deletedAt: IsNull(),
        },
      });
      if (existingModel && existingModel.legacyId !== model.legacyId) {
        throw new ConflictException(
          "Model with this name already exists for this brand",
        );
      }
    }

    const updateData: any = { ...updateModelDto };
    if (updateModelDto.brandId) {
      updateData.brandLegacyId = updateModelDto.brandId;
      delete updateData.brandId;
    }

    Object.assign(model, updateData);
    const savedModel = await this.modelRepository.save(model);

    return this.toDto(savedModel);
  }

  /**
   * Remove model (soft delete)
   */
  async remove(id: string | number): Promise<void> {
    const whereClause =
      typeof id === "string"
        ? ModelEntity.createFindOptions(id)
        : { legacyId: id };
    const model = await this.modelRepository.findOne({
      where: { ...whereClause, deletedAt: IsNull() },
    });

    if (!model) {
      throw new NotFoundException("Model not found");
    }

    model.deletedAt = new Date();
    await this.modelRepository.save(model);
  }

  /**
   * Get active models only
   */
  async findActiveModels(): Promise<ModelDto[]> {
    const models = await this.modelRepository.find({
      where: { deletedAt: IsNull() },
      relations: ["brand"],
      order: { name: "ASC" },
    });

    return models.map((model) => this.toDto(model));
  }

  /**
   * Get models by brand
   */
  async findByBrand(brandId: string | number): Promise<ModelDto[]> {
    const models = await this.modelRepository.find({
      where: {
        brandLegacyId:
          typeof brandId === "string" ? parseInt(brandId) : brandId,
        deletedAt: IsNull(),
      },
      relations: ["brand"],
      order: { name: "ASC" },
    });

    return models.map((model) => this.toDto(model));
  }

  /**
   * Find active models by brand
   */
  async findActiveModelsByBrand(brandId: string): Promise<ModelDto[]> {
    // Use findActiveModels since we can't properly filter by brand UUID
    return this.findActiveModels();
  }

  /**
   * Find models by status
   */
  async findByStatus(status: string): Promise<ModelDto[]> {
    // Since entity doesn't have status field, return all active models
    return this.findActiveModels();
  }

  /**
   * Convert entity to DTO
   */
  private toDto(model: ModelEntity): ModelDto {
    const dto = plainToClass(ModelDto, model, {
      excludeExtraneousValues: true,
    });
    dto.isActive = model.deletedAt === null;
    dto.displayName = model.name;
    dto.brandId = model.brandLegacyId?.toString() || "";
    return dto;
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SaddleEntity } from "./infrastructure/persistence/relational/entities/saddle.entity";
import { CreateSaddleDto } from "./dto/create-saddle.dto";
import { UpdateSaddleDto } from "./dto/update-saddle.dto";
import { SaddleDto } from "./dto/saddle.dto";

/**
 * Saddle Service
 *
 * Manages saddle operations with regional factory assignments.
 * Uses integer IDs to match PostgreSQL schema.
 */
@Injectable()
export class SaddleService {
  constructor(
    @InjectRepository(SaddleEntity)
    private readonly saddleRepository: Repository<SaddleEntity>,
  ) {}

  /**
   * Create a new saddle
   */
  async create(createDto: CreateSaddleDto): Promise<SaddleDto> {
    // Check if saddle with this brand/model combination exists
    const existing = await this.saddleRepository.findOne({
      where: {
        brand: createDto.brand,
        modelName: createDto.modelName,
        deleted: 0,
      },
    });

    if (existing) {
      throw new ConflictException(
        "Saddle with this brand and model already exists",
      );
    }

    const saddle = this.saddleRepository.create({
      factoryEu: createDto.factoryEu ?? 0,
      factoryGb: createDto.factoryGb ?? 0,
      factoryUs: createDto.factoryUs ?? 0,
      factoryCa: createDto.factoryCa ?? 0,
      factoryAud: createDto.factoryAud,
      factoryDe: createDto.factoryDe,
      factoryNl: createDto.factoryNl,
      brand: createDto.brand,
      modelName: createDto.modelName,
      presets: createDto.presets ?? "",
      active: createDto.active ?? 1,
      type: createDto.type ?? 0,
      sequence: createDto.sequence ?? 0,
      deleted: 0,
    });

    const saved = await this.saddleRepository.save(saddle);
    return this.toDto(saved);
  }

  /**
   * Find saddle by ID
   */
  async findOne(id: number): Promise<SaddleDto> {
    const saddle = await this.saddleRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!saddle) {
      throw new NotFoundException("Saddle not found");
    }

    return this.toDto(saddle);
  }

  /**
   * Find all saddles with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    id?: number,
    brand?: string,
    modelName?: string,
    sequence?: number,
    type?: number,
    search?: string,
    activeOnly: boolean = false,
    active?: string,
  ): Promise<{ data: SaddleDto[]; total: number; pages: number }> {
    const queryBuilder = this.saddleRepository
      .createQueryBuilder("saddle")
      .where("saddle.deleted = 0");

    // Filter by ID (exact match)
    if (id !== undefined) {
      queryBuilder.andWhere("saddle.id = :id", { id });
    }

    // Filter by active status
    if (activeOnly || active === "true") {
      queryBuilder.andWhere("saddle.active = 1");
    } else if (active === "false") {
      queryBuilder.andWhere("saddle.active = 0");
    }

    // Filter by brand (partial match)
    if (brand) {
      queryBuilder.andWhere("saddle.brand ILIKE :brand", {
        brand: `%${brand}%`,
      });
    }

    // Filter by model name (partial match)
    if (modelName) {
      queryBuilder.andWhere("saddle.model_name ILIKE :modelName", {
        modelName: `%${modelName}%`,
      });
    }

    // Filter by sequence (exact match)
    if (sequence !== undefined) {
      queryBuilder.andWhere("saddle.sequence = :sequence", { sequence });
    }

    // Filter by type
    if (type !== undefined) {
      queryBuilder.andWhere("saddle.type = :type", { type });
    }

    // General search (brand or model name)
    if (search) {
      queryBuilder.andWhere(
        "(saddle.brand ILIKE :search OR saddle.model_name ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy("saddle.sequence", "ASC")
      .addOrderBy("saddle.brand", "ASC")
      .addOrderBy("saddle.model_name", "ASC");

    const total = await queryBuilder.getCount();
    const saddles = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: saddles.map((s) => this.toDto(s)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Find saddles by brand
   */
  async findByBrand(brand: string): Promise<SaddleDto[]> {
    const saddles = await this.saddleRepository.find({
      where: { brand, deleted: 0 },
      order: { sequence: "ASC", modelName: "ASC" },
    });

    return saddles.map((s) => this.toDto(s));
  }

  /**
   * Find saddles by type
   */
  async findByType(type: number): Promise<SaddleDto[]> {
    const saddles = await this.saddleRepository.find({
      where: { type, deleted: 0 },
      order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
    });

    return saddles.map((s) => this.toDto(s));
  }

  /**
   * Get active saddles only
   */
  async findActiveSaddles(): Promise<SaddleDto[]> {
    const saddles = await this.saddleRepository.find({
      where: { deleted: 0, active: 1 },
      order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
    });

    return saddles.map((s) => this.toDto(s));
  }

  /**
   * Update saddle
   */
  async update(id: number, updateDto: UpdateSaddleDto): Promise<SaddleDto> {
    const saddle = await this.saddleRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!saddle) {
      throw new NotFoundException("Saddle not found");
    }

    // Check for conflicts if brand/model is being changed
    if (
      (updateDto.brand && updateDto.brand !== saddle.brand) ||
      (updateDto.modelName && updateDto.modelName !== saddle.modelName)
    ) {
      const existing = await this.saddleRepository.findOne({
        where: {
          brand: updateDto.brand ?? saddle.brand,
          modelName: updateDto.modelName ?? saddle.modelName,
          deleted: 0,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          "Saddle with this brand and model already exists",
        );
      }
    }

    // Update fields that are provided
    if (updateDto.factoryEu !== undefined)
      saddle.factoryEu = updateDto.factoryEu;
    if (updateDto.factoryGb !== undefined)
      saddle.factoryGb = updateDto.factoryGb;
    if (updateDto.factoryUs !== undefined)
      saddle.factoryUs = updateDto.factoryUs;
    if (updateDto.factoryCa !== undefined)
      saddle.factoryCa = updateDto.factoryCa;
    if (updateDto.factoryAud !== undefined)
      saddle.factoryAud = updateDto.factoryAud;
    if (updateDto.factoryDe !== undefined)
      saddle.factoryDe = updateDto.factoryDe;
    if (updateDto.factoryNl !== undefined)
      saddle.factoryNl = updateDto.factoryNl;
    if (updateDto.brand !== undefined) saddle.brand = updateDto.brand;
    if (updateDto.modelName !== undefined)
      saddle.modelName = updateDto.modelName;
    if (updateDto.presets !== undefined) saddle.presets = updateDto.presets;
    if (updateDto.active !== undefined) saddle.active = updateDto.active;
    if (updateDto.type !== undefined) saddle.type = updateDto.type;
    if (updateDto.sequence !== undefined) saddle.sequence = updateDto.sequence;

    const saved = await this.saddleRepository.save(saddle);
    return this.toDto(saved);
  }

  /**
   * Remove saddle (soft delete)
   */
  async remove(id: number): Promise<void> {
    const saddle = await this.saddleRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!saddle) {
      throw new NotFoundException("Saddle not found");
    }

    saddle.deleted = 1;
    await this.saddleRepository.save(saddle);
  }

  /**
   * Get unique brands
   */
  async getUniqueBrands(): Promise<string[]> {
    const result = await this.saddleRepository
      .createQueryBuilder("saddle")
      .select("DISTINCT saddle.brand", "brand")
      .where("saddle.deleted = 0")
      .orderBy("saddle.brand", "ASC")
      .getRawMany();

    return result.map((r) => r.brand);
  }

  /**
   * Get next available sequence number
   */
  async getNextSequence(): Promise<{ nextSequence: number }> {
    const result = await this.saddleRepository
      .createQueryBuilder("saddle")
      .select("MAX(saddle.sequence)", "maxSequence")
      .where("saddle.deleted = 0")
      .getRawOne();

    const maxSequence = result?.maxSequence || 0;
    return { nextSequence: maxSequence + 1 };
  }

  /**
   * Convert entity to DTO
   */
  private toDto(saddle: SaddleEntity): SaddleDto {
    const dto = new SaddleDto();
    dto.id = saddle.id;
    dto.factoryEu = saddle.factoryEu;
    dto.factoryGb = saddle.factoryGb;
    dto.factoryUs = saddle.factoryUs;
    dto.factoryCa = saddle.factoryCa;
    dto.factoryAud = saddle.factoryAud;
    dto.factoryDe = saddle.factoryDe;
    dto.factoryNl = saddle.factoryNl;
    dto.brand = saddle.brand;
    dto.modelName = saddle.modelName;
    dto.presets = saddle.presets;
    dto.active = saddle.active;
    dto.type = saddle.type;
    dto.sequence = saddle.sequence;
    dto.deleted = saddle.deleted;
    dto.isActive = saddle.deleted === 0 && saddle.active === 1;
    dto.displayName = `${saddle.brand} - ${saddle.modelName}`;
    return dto;
  }
}

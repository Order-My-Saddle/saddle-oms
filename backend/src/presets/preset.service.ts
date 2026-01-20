import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { PresetEntity } from "./infrastructure/persistence/relational/entities/preset.entity";
import { CreatePresetDto } from "./dto/create-preset.dto";
import { UpdatePresetDto } from "./dto/update-preset.dto";
import { PresetDto } from "./dto/preset.dto";
import { plainToClass } from "class-transformer";

/**
 * Simplified Preset Service using direct TypeORM operations
 */
@Injectable()
export class PresetService {
  constructor(
    @InjectRepository(PresetEntity)
    private readonly presetRepository: Repository<PresetEntity>,
  ) {}

  /**
   * Create a new preset
   */
  async create(createPresetDto: CreatePresetDto): Promise<PresetDto> {
    // Check if preset with this name already exists
    const existingPreset = await this.presetRepository.findOne({
      where: { name: createPresetDto.name, deleted: false },
    });

    if (existingPreset) {
      throw new ConflictException("Preset with this name already exists");
    }

    const preset = this.presetRepository.create(createPresetDto);
    const savedPreset = await this.presetRepository.save(preset);

    return this.toDto(savedPreset);
  }

  /**
   * Find preset by ID (integer ID)
   */
  async findOne(id: number): Promise<PresetDto> {
    const preset = await this.presetRepository.findOne({
      where: { id, deleted: false },
    });

    if (!preset) {
      throw new NotFoundException("Preset not found");
    }

    return this.toDto(preset);
  }

  /**
   * Find all presets with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: PresetDto[]; total: number; pages: number }> {
    const where: any = { deleted: false };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [presets, total] = await this.presetRepository.findAndCount({
      where,
      order: { sequence: "ASC", name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: presets.map((preset) => this.toDto(preset)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update preset
   */
  async update(
    id: number,
    updatePresetDto: UpdatePresetDto,
  ): Promise<PresetDto> {
    const preset = await this.presetRepository.findOne({
      where: { id, deleted: false },
    });

    if (!preset) {
      throw new NotFoundException("Preset not found");
    }

    // Check for name conflicts if name is being changed
    if (updatePresetDto.name && updatePresetDto.name !== preset.name) {
      const existingPreset = await this.presetRepository.findOne({
        where: { name: updatePresetDto.name, deleted: false },
      });
      if (existingPreset && existingPreset.id !== preset.id) {
        throw new ConflictException("Preset with this name already exists");
      }
    }

    Object.assign(preset, updatePresetDto);
    const savedPreset = await this.presetRepository.save(preset);

    return this.toDto(savedPreset);
  }

  /**
   * Remove preset (soft delete)
   */
  async remove(id: number): Promise<void> {
    const preset = await this.presetRepository.findOne({
      where: { id, deleted: false },
    });

    if (!preset) {
      throw new NotFoundException("Preset not found");
    }

    preset.deleted = true;
    preset.deletedAt = new Date();
    await this.presetRepository.save(preset);
  }

  /**
   * Get active presets only
   */
  async findActivePresets(): Promise<PresetDto[]> {
    const presets = await this.presetRepository.find({
      where: { deleted: false },
      order: { sequence: "ASC", name: "ASC" },
    });

    return presets.map((preset) => this.toDto(preset));
  }

  /**
   * Convert entity to DTO
   */
  private toDto(preset: PresetEntity): PresetDto {
    const dto = plainToClass(PresetDto, preset, {
      excludeExtraneousValues: true,
    });
    dto.isActive = !preset.deleted;
    dto.displayName = preset.name;
    return dto;
  }
}

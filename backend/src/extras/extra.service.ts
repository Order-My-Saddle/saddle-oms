import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, IsNull } from "typeorm";
import { ExtraEntity } from "./infrastructure/persistence/relational/entities/extra.entity";
import { CreateExtraDto } from "./dto/create-extra.dto";
import { UpdateExtraDto } from "./dto/update-extra.dto";
import { ExtraDto } from "./dto/extra.dto";
import { plainToClass } from "class-transformer";

/**
 * Simplified Extra Service using direct TypeORM operations
 */
@Injectable()
export class ExtraService {
  constructor(
    @InjectRepository(ExtraEntity)
    private readonly extraRepository: Repository<ExtraEntity>,
  ) {}

  /**
   * Create a new extra
   */
  async create(createExtraDto: CreateExtraDto): Promise<ExtraDto> {
    // Check if extra with this name already exists
    const existingExtra = await this.extraRepository.findOne({
      where: { name: createExtraDto.name, deletedAt: IsNull() },
    });

    if (existingExtra) {
      throw new ConflictException("Extra with this name already exists");
    }

    const extra = this.extraRepository.create(createExtraDto);
    const savedExtra = await this.extraRepository.save(extra);

    return this.toDto(savedExtra);
  }

  /**
   * Find extra by ID (UUID only)
   */
  async findOne(id: string): Promise<ExtraDto> {
    const extra = await this.extraRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!extra) {
      throw new NotFoundException("Extra not found");
    }

    return this.toDto(extra);
  }

  /**
   * Find all extras with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: ExtraDto[]; total: number; pages: number }> {
    const where: any = { deletedAt: IsNull() };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [extras, total] = await this.extraRepository.findAndCount({
      where,
      order: { sequence: "ASC", name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: extras.map((extra) => this.toDto(extra)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update extra
   */
  async update(id: string, updateExtraDto: UpdateExtraDto): Promise<ExtraDto> {
    const extra = await this.extraRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!extra) {
      throw new NotFoundException("Extra not found");
    }

    // Check for name conflicts if name is being changed
    if (updateExtraDto.name && updateExtraDto.name !== extra.name) {
      const existingExtra = await this.extraRepository.findOne({
        where: { name: updateExtraDto.name, deletedAt: IsNull() },
      });
      if (existingExtra && existingExtra.id !== extra.id) {
        throw new ConflictException("Extra with this name already exists");
      }
    }

    Object.assign(extra, updateExtraDto);
    const savedExtra = await this.extraRepository.save(extra);

    return this.toDto(savedExtra);
  }

  /**
   * Remove extra (soft delete)
   */
  async remove(id: string): Promise<void> {
    const extra = await this.extraRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!extra) {
      throw new NotFoundException("Extra not found");
    }

    extra.deletedAt = new Date();
    await this.extraRepository.save(extra);
  }

  /**
   * Get active extras only
   */
  async findActiveExtras(): Promise<ExtraDto[]> {
    const extras = await this.extraRepository.find({
      where: { deletedAt: IsNull() },
      order: { sequence: "ASC", name: "ASC" },
    });

    return extras.map((extra) => this.toDto(extra));
  }

  /**
   * Convert entity to DTO
   */
  private toDto(extra: ExtraEntity): ExtraDto {
    const dto = plainToClass(ExtraDto, extra, {
      excludeExtraneousValues: true,
    });
    dto.isActive = extra.deletedAt === null;
    dto.displayName = extra.name;
    return dto;
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OptionItemEntity } from "./infrastructure/persistence/relational/entities/option-item.entity";
import { CreateOptionItemDto } from "./dto/create-option-item.dto";
import { UpdateOptionItemDto } from "./dto/update-option-item.dto";
import { OptionItemDto } from "./dto/option-item.dto";

/**
 * OptionItem Service
 *
 * Manages option item operations with 7-tier pricing structure.
 * Uses integer IDs to match PostgreSQL schema.
 */
@Injectable()
export class OptionItemService {
  constructor(
    @InjectRepository(OptionItemEntity)
    private readonly optionItemRepository: Repository<OptionItemEntity>,
  ) {}

  /**
   * Create a new option item
   */
  async create(createDto: CreateOptionItemDto): Promise<OptionItemDto> {
    const optionItem = this.optionItemRepository.create({
      optionId: createDto.optionId,
      leatherId: createDto.leatherId ?? 0,
      name: createDto.name,
      userColor: createDto.userColor ?? 0,
      userLeather: createDto.userLeather ?? 0,
      price1: createDto.price1 ?? 0,
      price2: createDto.price2 ?? 0,
      price3: createDto.price3 ?? 0,
      price4: createDto.price4 ?? 0,
      price5: createDto.price5 ?? 0,
      price6: createDto.price6 ?? 0,
      price7: createDto.price7 ?? 0,
      sequence: createDto.sequence ?? 0,
      restrict: createDto.restrict,
      deleted: 0,
    });

    const saved = await this.optionItemRepository.save(optionItem);
    return this.toDto(saved);
  }

  /**
   * Find option item by ID
   */
  async findOne(id: number): Promise<OptionItemDto> {
    const item = await this.optionItemRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!item) {
      throw new NotFoundException("Option item not found");
    }

    return this.toDto(item);
  }

  /**
   * Find all option items with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    optionId?: number,
    leatherId?: number,
    search?: string,
  ): Promise<{ data: OptionItemDto[]; total: number; pages: number }> {
    const queryBuilder = this.optionItemRepository
      .createQueryBuilder("item")
      .where("item.deleted = 0");

    if (optionId !== undefined) {
      queryBuilder.andWhere("item.option_id = :optionId", { optionId });
    }

    if (leatherId !== undefined) {
      queryBuilder.andWhere("item.leather_id = :leatherId", { leatherId });
    }

    if (search) {
      queryBuilder.andWhere("item.name ILIKE :search", {
        search: `%${search}%`,
      });
    }

    queryBuilder.orderBy("item.sequence", "ASC").addOrderBy("item.name", "ASC");

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: items.map((item) => this.toDto(item)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Find all items for a specific option
   */
  async findByOptionId(optionId: number): Promise<OptionItemDto[]> {
    const items = await this.optionItemRepository.find({
      where: { optionId, deleted: 0 },
      order: { sequence: "ASC", name: "ASC" },
    });

    return items.map((item) => this.toDto(item));
  }

  /**
   * Update option item
   */
  async update(
    id: number,
    updateDto: UpdateOptionItemDto,
  ): Promise<OptionItemDto> {
    const item = await this.optionItemRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!item) {
      throw new NotFoundException("Option item not found");
    }

    // Update fields that are provided
    if (updateDto.optionId !== undefined) item.optionId = updateDto.optionId;
    if (updateDto.leatherId !== undefined) item.leatherId = updateDto.leatherId;
    if (updateDto.name !== undefined) item.name = updateDto.name;
    if (updateDto.userColor !== undefined) item.userColor = updateDto.userColor;
    if (updateDto.userLeather !== undefined)
      item.userLeather = updateDto.userLeather;
    if (updateDto.price1 !== undefined) item.price1 = updateDto.price1;
    if (updateDto.price2 !== undefined) item.price2 = updateDto.price2;
    if (updateDto.price3 !== undefined) item.price3 = updateDto.price3;
    if (updateDto.price4 !== undefined) item.price4 = updateDto.price4;
    if (updateDto.price5 !== undefined) item.price5 = updateDto.price5;
    if (updateDto.price6 !== undefined) item.price6 = updateDto.price6;
    if (updateDto.price7 !== undefined) item.price7 = updateDto.price7;
    if (updateDto.sequence !== undefined) item.sequence = updateDto.sequence;
    if (updateDto.restrict !== undefined) item.restrict = updateDto.restrict;

    const saved = await this.optionItemRepository.save(item);
    return this.toDto(saved);
  }

  /**
   * Remove option item (soft delete)
   */
  async remove(id: number): Promise<void> {
    const item = await this.optionItemRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!item) {
      throw new NotFoundException("Option item not found");
    }

    item.deleted = 1;
    await this.optionItemRepository.save(item);
  }

  /**
   * Get active option items only
   */
  async findActiveItems(): Promise<OptionItemDto[]> {
    const items = await this.optionItemRepository.find({
      where: { deleted: 0 },
      order: { sequence: "ASC", name: "ASC" },
    });

    return items.map((item) => this.toDto(item));
  }

  /**
   * Convert entity to DTO
   */
  private toDto(item: OptionItemEntity): OptionItemDto {
    const dto = new OptionItemDto();
    dto.id = item.id;
    dto.optionId = item.optionId;
    dto.leatherId = item.leatherId;
    dto.name = item.name;
    dto.userColor = item.userColor;
    dto.userLeather = item.userLeather;
    dto.price1 = item.price1;
    dto.price2 = item.price2;
    dto.price3 = item.price3;
    dto.price4 = item.price4;
    dto.price5 = item.price5;
    dto.price6 = item.price6;
    dto.price7 = item.price7;
    dto.sequence = item.sequence;
    dto.restrict = item.restrict;
    dto.deleted = item.deleted;
    dto.isActive = item.deleted === 0;
    return dto;
  }
}

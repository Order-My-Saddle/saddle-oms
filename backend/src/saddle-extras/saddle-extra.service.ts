import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SaddleExtraEntity } from "./infrastructure/persistence/relational/entities/saddle-extra.entity";
import { CreateSaddleExtraDto } from "./dto/create-saddle-extra.dto";
import { UpdateSaddleExtraDto } from "./dto/update-saddle-extra.dto";
import { SaddleExtraDto } from "./dto/saddle-extra.dto";

@Injectable()
export class SaddleExtraService {
  constructor(
    @InjectRepository(SaddleExtraEntity)
    private readonly repository: Repository<SaddleExtraEntity>,
  ) {}

  async create(createDto: CreateSaddleExtraDto): Promise<SaddleExtraDto> {
    const existing = await this.repository.findOne({
      where: {
        saddleId: createDto.saddleId,
        extraId: createDto.extraId,
        deleted: 0,
      },
    });

    if (existing) {
      throw new ConflictException("Saddle-extra association already exists");
    }

    const entity = this.repository.create({
      saddleId: createDto.saddleId,
      extraId: createDto.extraId,
      deleted: 0,
    });

    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async findOne(id: number): Promise<SaddleExtraDto> {
    const entity = await this.repository.findOne({
      where: { id, deleted: 0 },
    });

    if (!entity) {
      throw new NotFoundException("Saddle-extra association not found");
    }

    return this.toDto(entity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    saddleId?: number,
    extraId?: number,
  ): Promise<{ data: SaddleExtraDto[]; total: number; pages: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("se")
      .where("se.deleted = 0");

    if (saddleId !== undefined) {
      queryBuilder.andWhere("se.saddle_id = :saddleId", { saddleId });
    }

    if (extraId !== undefined) {
      queryBuilder.andWhere("se.extra_id = :extraId", { extraId });
    }

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

  async findBySaddleId(saddleId: number): Promise<SaddleExtraDto[]> {
    const items = await this.repository.find({
      where: { saddleId, deleted: 0 },
    });

    return items.map((item) => this.toDto(item));
  }

  async update(
    id: number,
    updateDto: UpdateSaddleExtraDto,
  ): Promise<SaddleExtraDto> {
    const entity = await this.repository.findOne({
      where: { id, deleted: 0 },
    });

    if (!entity) {
      throw new NotFoundException("Saddle-extra association not found");
    }

    if (updateDto.saddleId !== undefined) entity.saddleId = updateDto.saddleId;
    if (updateDto.extraId !== undefined) entity.extraId = updateDto.extraId;

    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id, deleted: 0 },
    });

    if (!entity) {
      throw new NotFoundException("Saddle-extra association not found");
    }

    entity.deleted = 1;
    await this.repository.save(entity);
  }

  private toDto(entity: SaddleExtraEntity): SaddleExtraDto {
    const dto = new SaddleExtraDto();
    dto.id = entity.id;
    dto.saddleId = entity.saddleId;
    dto.extraId = entity.extraId;
    dto.deleted = entity.deleted;
    dto.isActive = entity.deleted === 0;
    return dto;
  }
}

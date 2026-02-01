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

@Injectable()
export class ExtraService {
  constructor(
    @InjectRepository(ExtraEntity)
    private readonly extraRepository: Repository<ExtraEntity>,
  ) {}

  async create(createExtraDto: CreateExtraDto): Promise<ExtraDto> {
    const existingExtra = await this.extraRepository.findOne({
      where: { name: createExtraDto.name, deletedAt: IsNull() },
    });

    if (existingExtra) {
      throw new ConflictException("Extra with this name already exists");
    }

    const extra = this.extraRepository.create({
      name: createExtraDto.name,
      description: createExtraDto.description,
      price1: createExtraDto.price1 ?? 0,
      price2: createExtraDto.price2 ?? 0,
      price3: createExtraDto.price3 ?? 0,
      price4: createExtraDto.price4 ?? 0,
      price5: createExtraDto.price5 ?? 0,
      price6: createExtraDto.price6 ?? 0,
      price7: createExtraDto.price7 ?? 0,
      sequence: createExtraDto.sequence ?? 0,
    });
    const savedExtra = await this.extraRepository.save(extra);

    return this.toDto(savedExtra);
  }

  async findOne(id: string): Promise<ExtraDto> {
    const extra = await this.extraRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!extra) {
      throw new NotFoundException("Extra not found");
    }

    return this.toDto(extra);
  }

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

  async update(id: string, updateExtraDto: UpdateExtraDto): Promise<ExtraDto> {
    const extra = await this.extraRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!extra) {
      throw new NotFoundException("Extra not found");
    }

    if (updateExtraDto.name && updateExtraDto.name !== extra.name) {
      const existingExtra = await this.extraRepository.findOne({
        where: { name: updateExtraDto.name, deletedAt: IsNull() },
      });
      if (existingExtra && existingExtra.id !== extra.id) {
        throw new ConflictException("Extra with this name already exists");
      }
    }

    if (updateExtraDto.name !== undefined) extra.name = updateExtraDto.name;
    if (updateExtraDto.description !== undefined)
      extra.description = updateExtraDto.description;
    if (updateExtraDto.price1 !== undefined)
      extra.price1 = updateExtraDto.price1;
    if (updateExtraDto.price2 !== undefined)
      extra.price2 = updateExtraDto.price2;
    if (updateExtraDto.price3 !== undefined)
      extra.price3 = updateExtraDto.price3;
    if (updateExtraDto.price4 !== undefined)
      extra.price4 = updateExtraDto.price4;
    if (updateExtraDto.price5 !== undefined)
      extra.price5 = updateExtraDto.price5;
    if (updateExtraDto.price6 !== undefined)
      extra.price6 = updateExtraDto.price6;
    if (updateExtraDto.price7 !== undefined)
      extra.price7 = updateExtraDto.price7;
    if (updateExtraDto.sequence !== undefined)
      extra.sequence = updateExtraDto.sequence;

    const savedExtra = await this.extraRepository.save(extra);

    return this.toDto(savedExtra);
  }

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

  async findActiveExtras(): Promise<ExtraDto[]> {
    const extras = await this.extraRepository.find({
      where: { deletedAt: IsNull() },
      order: { sequence: "ASC", name: "ASC" },
    });

    return extras.map((extra) => this.toDto(extra));
  }

  private toDto(extra: ExtraEntity): ExtraDto {
    const dto = plainToClass(ExtraDto, extra, {
      excludeExtraneousValues: true,
    });
    dto.isActive = extra.deletedAt === null;
    dto.displayName = extra.name;
    return dto;
  }
}

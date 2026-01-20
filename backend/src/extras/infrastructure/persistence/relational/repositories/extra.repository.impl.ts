import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { ExtraRepository } from "../../../../domain/extra.repository";
import { Extra } from "../../../../domain/extra";
import { ExtraEntity } from "../entities/extra.entity";
import { ExtraId } from "../../../../domain/value-objects/extra-id.value-object";
import { ExtraStatus } from "../../../../domain/value-objects/extra-status.value-object";
import { ExtraMapper } from "../mappers/extra.mapper";

@Injectable()
export class ExtraRepositoryImpl implements ExtraRepository {
  constructor(
    @InjectRepository(ExtraEntity)
    private readonly repository: Repository<ExtraEntity>,
  ) {}

  async save(extra: Extra): Promise<Extra> {
    const entity = ExtraMapper.toPersistence(extra);
    const savedEntity = await this.repository.save(entity);
    return ExtraMapper.toDomain(savedEntity);
  }

  async findById(id: ExtraId): Promise<Extra | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? ExtraMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Extra | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? ExtraMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Extra[]> {
    const entities = await this.repository.find();
    return entities.map(ExtraMapper.toDomain);
  }

  async findByStatus(_status: ExtraStatus): Promise<Extra[]> {
    void _status;
    // Entity doesn't have status field, return all non-deleted entities
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
      order: { name: "ASC" },
    });
    return entities.map(ExtraMapper.toDomain);
  }

  async findActiveExtras(): Promise<Extra[]> {
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
      order: { name: "ASC" },
    });
    return entities.map(ExtraMapper.toDomain);
  }

  async delete(id: ExtraId): Promise<void> {
    await this.repository.delete(id.value);
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { AccessFilterGroupEntity } from "../entities/access-filter-group.entity";

@Injectable()
export class AccessFilterGroupRepository {
  constructor(
    @InjectRepository(AccessFilterGroupEntity)
    private readonly repository: Repository<AccessFilterGroupEntity>,
  ) {}

  async create(
    data: Partial<AccessFilterGroupEntity>,
  ): Promise<AccessFilterGroupEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(
    filters?: Partial<AccessFilterGroupEntity>,
  ): Promise<AccessFilterGroupEntity[]> {
    const where: FindOptionsWhere<AccessFilterGroupEntity> = {};

    if (filters?.name) {
      where.name = filters.name;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.repository.find({
      where,
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: number): Promise<AccessFilterGroupEntity | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    data: Partial<AccessFilterGroupEntity>,
  ): Promise<AccessFilterGroupEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.repository.restore(id);
  }

  async hardDelete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async count(filters?: Partial<AccessFilterGroupEntity>): Promise<number> {
    const where: FindOptionsWhere<AccessFilterGroupEntity> = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.repository.count({ where });
  }
}

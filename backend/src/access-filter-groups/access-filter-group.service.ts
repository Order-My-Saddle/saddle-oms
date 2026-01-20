import { Injectable, NotFoundException } from "@nestjs/common";
import { AccessFilterGroupRepository } from "./infrastructure/persistence/relational/repositories/access-filter-group.repository";
import { CreateAccessFilterGroupDto } from "./dto/create-access-filter-group.dto";
import { UpdateAccessFilterGroupDto } from "./dto/update-access-filter-group.dto";
import { QueryAccessFilterGroupDto } from "./dto/query-access-filter-group.dto";
import { AccessFilterGroupEntity } from "./infrastructure/persistence/relational/entities/access-filter-group.entity";

@Injectable()
export class AccessFilterGroupService {
  constructor(private readonly repository: AccessFilterGroupRepository) {}

  async create(
    createDto: CreateAccessFilterGroupDto,
  ): Promise<AccessFilterGroupEntity> {
    const data: Partial<AccessFilterGroupEntity> = {
      name: createDto.name,
      description: createDto.description || null,
      filters: createDto.filters || null,
      userIds: createDto.userIds || null,
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
    };

    return this.repository.create(data);
  }

  async findAll(
    queryDto: QueryAccessFilterGroupDto,
  ): Promise<AccessFilterGroupEntity[]> {
    const filters = queryDto.getAccessFilterGroupFilters();

    return this.repository.findAll({
      name: filters.name,
      isActive: filters.isActive,
    });
  }

  async findOne(id: number): Promise<AccessFilterGroupEntity> {
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException(
        `Access filter group with ID "${id}" not found`,
      );
    }

    return entity;
  }

  async update(
    id: number,
    updateDto: UpdateAccessFilterGroupDto,
  ): Promise<AccessFilterGroupEntity> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Access filter group with ID "${id}" not found`,
      );
    }

    const data: Partial<AccessFilterGroupEntity> = {};

    if (updateDto.name !== undefined) {
      data.name = updateDto.name;
    }

    if (updateDto.description !== undefined) {
      data.description = updateDto.description;
    }

    if (updateDto.filters !== undefined) {
      data.filters = updateDto.filters;
    }

    if (updateDto.userIds !== undefined) {
      data.userIds = updateDto.userIds;
    }

    if (updateDto.isActive !== undefined) {
      data.isActive = updateDto.isActive;
    }

    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException(
        `Failed to update access filter group with ID "${id}"`,
      );
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Access filter group with ID "${id}" not found`,
      );
    }

    await this.repository.softDelete(id);
  }

  async countActive(): Promise<number> {
    return this.repository.count({ isActive: true });
  }

  async restore(id: number): Promise<AccessFilterGroupEntity> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Access filter group with ID "${id}" not found`,
      );
    }

    await this.repository.restore(id);

    const restored = await this.repository.findById(id);

    if (!restored) {
      throw new NotFoundException(
        `Failed to restore access filter group with ID "${id}"`,
      );
    }

    return restored;
  }
}

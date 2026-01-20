import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { ICustomerRepository } from "../../../../domain/customer.repository";
import { Customer } from "../../../../domain/customer";
import { CustomerId } from "../../../../domain/value-objects/customer-id.value-object";
import { Email } from "../../../../domain/value-objects/email.value-object";
import { CustomerStatus } from "../../../../domain/value-objects/customer-status.value-object";
import { CustomerMapper } from "../mappers/customer.mapper";

/**
 * Customer Repository Implementation
 *
 * Implements the domain repository interface using TypeORM
 * Uses integer IDs to match PostgreSQL schema
 */
@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
    private readonly mapper: CustomerMapper,
  ) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const numericId = id.numericValue;
    if (numericId === null) {
      return null;
    }

    const entity = await this.repository.findOne({
      where: {
        id: numericId,
        deletedAt: IsNull(),
      },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email, fitterId?: number): Promise<Customer | null> {
    const where: any = {
      email: email.value,
      deletedAt: IsNull(),
    };

    if (fitterId !== undefined) {
      where.fitterId = fitterId;
    }

    const entity = await this.repository.findOne({ where });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByFitterId(fitterId: number): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: {
        fitterId,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: {
        status,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async findByCountry(country: string): Promise<Customer[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("customer")
      .where("customer.deletedAt IS NULL")
      .andWhere("customer.country ILIKE :country", {
        country: `%${country}%`,
      })
      .orderBy("customer.name", "ASC");

    const entities = await queryBuilder.getMany();
    return this.mapper.toDomainArray(entities);
  }

  async findByCity(city: string): Promise<Customer[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("customer")
      .where("customer.deletedAt IS NULL")
      .andWhere("customer.city ILIKE :city", {
        city: `%${city}%`,
      })
      .orderBy("customer.name", "ASC");

    const entities = await queryBuilder.getMany();
    return this.mapper.toDomainArray(entities);
  }

  async findActive(): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: {
        status: CustomerStatus.ACTIVE,
        deleted: 0,
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async save(customer: Customer): Promise<void> {
    const numericId = customer.id.numericValue;

    if (numericId !== null) {
      const existingEntity = await this.repository.findOne({
        where: { id: numericId },
      });

      if (existingEntity) {
        // Update existing entity
        const updatedEntity = this.mapper.updateEntity(existingEntity, customer);
        await this.repository.save(updatedEntity);
        return;
      }
    }

    // Create new entity (let database auto-generate ID)
    const newEntity = this.mapper.toEntity(customer);
    await this.repository.save(newEntity);
  }

  async delete(id: CustomerId): Promise<void> {
    const numericId = id.numericValue;
    if (numericId !== null) {
      await this.repository.softDelete({ id: numericId });
    }
  }

  async findAll(filters?: {
    status?: CustomerStatus;
    fitterId?: number;
    country?: string;
    city?: string;
    isActive?: boolean;
  }): Promise<Customer[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("customer")
      .where("customer.deletedAt IS NULL");

    if (filters?.status) {
      queryBuilder.andWhere("customer.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.fitterId !== undefined) {
      queryBuilder.andWhere("customer.fitterId = :fitterId", {
        fitterId: filters.fitterId,
      });
    }

    if (filters?.country) {
      queryBuilder.andWhere("customer.country ILIKE :country", {
        country: `%${filters.country}%`,
      });
    }

    if (filters?.city) {
      queryBuilder.andWhere("customer.city ILIKE :city", {
        city: `%${filters.city}%`,
      });
    }

    if (filters?.isActive === true) {
      queryBuilder.andWhere("customer.deleted = 0");
      queryBuilder.andWhere("customer.status = :activeStatus", {
        activeStatus: CustomerStatus.ACTIVE,
      });
    } else if (filters?.isActive === false) {
      queryBuilder.andWhere(
        "(customer.deleted != 0 OR customer.status != :activeStatus)",
        { activeStatus: CustomerStatus.ACTIVE },
      );
    }

    queryBuilder.orderBy("customer.name", "ASC");

    const entities = await queryBuilder.getMany();
    return this.mapper.toDomainArray(entities);
  }

  async countByFitterId(fitterId: number): Promise<number> {
    return this.repository.count({
      where: {
        fitterId,
        deletedAt: IsNull(),
      },
    });
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: {
        status: CustomerStatus.ACTIVE,
        deleted: 0,
        deletedAt: IsNull(),
      },
    });
  }

  async findActiveCustomersWithoutFitter(): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: {
        status: CustomerStatus.ACTIVE,
        fitterId: IsNull(),
        deletedAt: IsNull(),
      },
      order: {
        name: "ASC",
      },
    });

    return this.mapper.toDomainArray(entities);
  }

  async existsByEmail(email: Email, fitterId?: number): Promise<boolean> {
    const where: any = {
      email: email.value,
      deletedAt: IsNull(),
    };

    if (fitterId !== undefined) {
      where.fitterId = fitterId;
    }

    const count = await this.repository.count({ where });
    return count > 0;
  }

  async bulkCreate(customers: Customer[]): Promise<Customer[]> {
    const entities = customers.map((customer) =>
      this.mapper.toEntity(customer),
    );
    const savedEntities = await this.repository.save(entities);
    return this.mapper.toDomainArray(savedEntities);
  }
}

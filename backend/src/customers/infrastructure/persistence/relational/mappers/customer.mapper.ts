import { Injectable } from "@nestjs/common";
import { Customer } from "../../../../domain/customer";
import { CustomerEntity } from "../entities/customer.entity";
import { CustomerId } from "../../../../domain/value-objects/customer-id.value-object";

/**
 * Customer Mapper
 *
 * Converts between domain entities and persistence entities.
 * Based on PostgreSQL schema with address and contact information.
 */
@Injectable()
export class CustomerMapper {
  /**
   * Convert domain entity to persistence entity
   */
  public toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();

    // Handle ID - could be number or string
    const idValue = customer.id.value;
    if (typeof idValue === "number") {
      entity.id = idValue;
    }

    entity.email = customer.email?.value ?? undefined;
    entity.name = customer.name;
    entity.horseName = customer.horseName ?? undefined;
    entity.company = customer.company ?? undefined;
    entity.address = customer.address ?? undefined;
    entity.city = customer.city ?? undefined;
    entity.state = customer.state ?? undefined;
    entity.zipcode = customer.zipcode ?? undefined;
    entity.country = customer.country ?? undefined;
    entity.phoneNo = customer.phoneNo ?? undefined;
    entity.cellNo = customer.cellNo ?? undefined;
    entity.bankAccountNumber = customer.bankAccountNumber ?? undefined;
    entity.fitterId = customer.fitterId ?? undefined;
    entity.deleted = customer.deleted;
    entity.status = customer.status;
    entity.createdAt = customer.createdAt;
    entity.updatedAt = customer.updatedAt;

    return entity;
  }

  /**
   * Convert persistence entity to domain entity
   */
  public toDomain(entity: CustomerEntity): Customer {
    return Customer.create(
      CustomerId.fromNumber(entity.id),
      entity.name,
      entity.email,
      entity.horseName,
      entity.company,
      entity.address,
      entity.city,
      entity.state,
      entity.zipcode,
      entity.country,
      entity.phoneNo,
      entity.cellNo,
      entity.bankAccountNumber,
      entity.fitterId,
    );
  }

  /**
   * Convert array of entities to array of domain objects
   */
  public toDomainArray(entities: CustomerEntity[]): Customer[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domain objects to array of entities
   */
  public toEntityArray(customers: Customer[]): CustomerEntity[] {
    return customers.map((customer) => this.toEntity(customer));
  }

  /**
   * Update existing entity with domain data (for updates)
   */
  public updateEntity(
    entity: CustomerEntity,
    customer: Customer,
  ): CustomerEntity {
    entity.email = customer.email?.value ?? undefined;
    entity.name = customer.name;
    entity.horseName = customer.horseName ?? undefined;
    entity.company = customer.company ?? undefined;
    entity.address = customer.address ?? undefined;
    entity.city = customer.city ?? undefined;
    entity.state = customer.state ?? undefined;
    entity.zipcode = customer.zipcode ?? undefined;
    entity.country = customer.country ?? undefined;
    entity.phoneNo = customer.phoneNo ?? undefined;
    entity.cellNo = customer.cellNo ?? undefined;
    entity.bankAccountNumber = customer.bankAccountNumber ?? undefined;
    entity.fitterId = customer.fitterId ?? undefined;
    entity.deleted = customer.deleted;
    entity.status = customer.status;
    entity.updatedAt = customer.updatedAt;

    return entity;
  }
}

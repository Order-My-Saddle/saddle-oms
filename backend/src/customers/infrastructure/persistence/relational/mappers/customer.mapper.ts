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

    entity.email = customer.email?.value ?? "";
    entity.name = customer.name;
    entity.horseName = customer.horseName ?? "";
    entity.company = customer.company ?? "";
    entity.address = customer.address ?? "";
    entity.city = customer.city ?? "";
    entity.state = customer.state ?? "";
    entity.zipcode = customer.zipcode ?? "";
    entity.country = customer.country ?? "";
    entity.phoneNo = customer.phoneNo ?? "";
    entity.cellNo = customer.cellNo ?? "";
    entity.bankAccountNumber = customer.bankAccountNumber ?? "";
    entity.fitterId = customer.fitterId ?? 0;
    entity.deleted = customer.deleted;

    return entity;
  }

  /**
   * Convert persistence entity to domain entity
   */
  public toDomain(entity: CustomerEntity): Customer {
    return Customer.create(
      CustomerId.fromNumber(entity.id),
      entity.name,
      entity.email || undefined,
      entity.horseName || undefined,
      entity.company || undefined,
      entity.address || undefined,
      entity.city || undefined,
      entity.state || undefined,
      entity.zipcode || undefined,
      entity.country || undefined,
      entity.phoneNo || undefined,
      entity.cellNo || undefined,
      entity.bankAccountNumber || undefined,
      entity.fitterId || undefined,
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
    entity.email = customer.email?.value ?? "";
    entity.name = customer.name;
    entity.horseName = customer.horseName ?? "";
    entity.company = customer.company ?? "";
    entity.address = customer.address ?? "";
    entity.city = customer.city ?? "";
    entity.state = customer.state ?? "";
    entity.zipcode = customer.zipcode ?? "";
    entity.country = customer.country ?? "";
    entity.phoneNo = customer.phoneNo ?? "";
    entity.cellNo = customer.cellNo ?? "";
    entity.bankAccountNumber = customer.bankAccountNumber ?? "";
    entity.fitterId = customer.fitterId ?? 0;
    entity.deleted = customer.deleted;

    return entity;
  }
}

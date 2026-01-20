import { Injectable } from "@nestjs/common";
import { Customer } from "../domain/customer";
import { CustomerDto } from "../dto/customer.dto";

/**
 * Customer DTO Mapper
 *
 * Converts between domain entities and DTOs for API responses.
 * Based on PostgreSQL schema with address and contact information.
 */
@Injectable()
export class CustomerMapper {
  /**
   * Convert domain entity to DTO
   */
  public toDto(customer: Customer): CustomerDto {
    const dto = new CustomerDto();

    // Handle ID - could be number or string depending on source
    const idValue = customer.id.value;
    dto.id = typeof idValue === "number" ? idValue : parseInt(idValue, 10);

    dto.email = customer.email?.value ?? undefined;
    dto.name = customer.name;
    dto.horseName = customer.horseName ?? undefined;
    dto.company = customer.company ?? undefined;
    dto.address = customer.address ?? undefined;
    dto.city = customer.city ?? undefined;
    dto.state = customer.state ?? undefined;
    dto.zipcode = customer.zipcode ?? undefined;
    dto.country = customer.country ?? undefined;
    dto.phoneNo = customer.phoneNo ?? undefined;
    dto.cellNo = customer.cellNo ?? undefined;
    dto.bankAccountNumber = customer.bankAccountNumber ?? undefined;
    dto.fitterId = customer.fitterId ?? undefined;
    dto.deleted = customer.deleted;
    dto.status = customer.status;
    dto.createdAt = customer.createdAt;
    dto.updatedAt = customer.updatedAt;
    dto.displayName = customer.getDisplayName();
    dto.isActive = customer.isActive();
    dto.hasFitter = customer.hasFitter();

    return dto;
  }

  /**
   * Convert array of domain entities to array of DTOs
   */
  public toDtoArray(customers: Customer[]): CustomerDto[] {
    return customers.map((customer) => this.toDto(customer));
  }
}

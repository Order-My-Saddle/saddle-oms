/**
 * Customer Status Value Object
 * Defines valid customer statuses and their business rules
 */
export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

export class CustomerStatusVO {
  constructor(private readonly _status: CustomerStatus) {}

  public static fromString(value: string): CustomerStatusVO {
    const status = Object.values(CustomerStatus).find((s) => s === value);
    if (!status) {
      throw new Error(`Invalid customer status: ${value}`);
    }
    return new CustomerStatusVO(status);
  }

  public static active(): CustomerStatusVO {
    return new CustomerStatusVO(CustomerStatus.ACTIVE);
  }

  public static inactive(): CustomerStatusVO {
    return new CustomerStatusVO(CustomerStatus.INACTIVE);
  }

  public get value(): CustomerStatus {
    return this._status;
  }

  public isActive(): boolean {
    return this._status === CustomerStatus.ACTIVE;
  }

  public canCreateOrders(): boolean {
    return this._status === CustomerStatus.ACTIVE;
  }

  public equals(other: CustomerStatusVO): boolean {
    return this._status === other._status;
  }

  public toString(): string {
    return this._status;
  }
}

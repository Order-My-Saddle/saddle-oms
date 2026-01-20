/**
 * Brand Status Value Object
 * Defines valid brand statuses and their business rules
 */
export enum BrandStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
  PENDING = "pending",
}

export class BrandStatusVO {
  constructor(private readonly _status: BrandStatus) {}

  public static fromString(value: string): BrandStatusVO {
    const status = Object.values(BrandStatus).find((s) => s === value);
    if (!status) {
      throw new Error(`Invalid brand status: ${value}`);
    }
    return new BrandStatusVO(status);
  }

  public static active(): BrandStatusVO {
    return new BrandStatusVO(BrandStatus.ACTIVE);
  }

  public static inactive(): BrandStatusVO {
    return new BrandStatusVO(BrandStatus.INACTIVE);
  }

  public get value(): BrandStatus {
    return this._status;
  }

  public isActive(): boolean {
    return this._status === BrandStatus.ACTIVE;
  }

  public canHaveModels(): boolean {
    return this._status === BrandStatus.ACTIVE;
  }

  public equals(other: BrandStatusVO): boolean {
    return this._status === other._status;
  }

  public toString(): string {
    return this._status;
  }
}

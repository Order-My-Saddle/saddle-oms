/**
 * Model Status Value Object
 * Defines valid model statuses and their business rules
 */
export enum ModelStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
  PENDING = "pending",
}

export class ModelStatusVO {
  constructor(private readonly _status: ModelStatus) {}

  public static fromString(value: string): ModelStatusVO {
    const status = Object.values(ModelStatus).find((s) => s === value);
    if (!status) {
      throw new Error(`Invalid model status: ${value}`);
    }
    return new ModelStatusVO(status);
  }

  public static active(): ModelStatusVO {
    return new ModelStatusVO(ModelStatus.ACTIVE);
  }

  public static inactive(): ModelStatusVO {
    return new ModelStatusVO(ModelStatus.INACTIVE);
  }

  public get value(): ModelStatus {
    return this._status;
  }

  public isActive(): boolean {
    return this._status === ModelStatus.ACTIVE;
  }

  public canBeOrdered(): boolean {
    return this._status === ModelStatus.ACTIVE;
  }

  public equals(other: ModelStatusVO): boolean {
    return this._status === other._status;
  }

  public toString(): string {
    return this._status;
  }
}

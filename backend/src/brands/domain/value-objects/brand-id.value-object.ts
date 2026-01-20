import { v4 as uuidv4, validate as uuidValidate } from "uuid";

/**
 * Brand ID Value Object
 * Ensures brand IDs are valid UUIDs
 */
export class BrandId {
  constructor(private readonly _value: string) {
    if (!_value) {
      throw new Error("Brand ID cannot be empty");
    }

    if (!uuidValidate(_value)) {
      throw new Error("Brand ID must be a valid UUID");
    }
  }

  /**
   * Generate a new brand ID
   */
  public static generate(): BrandId {
    return new BrandId(uuidv4());
  }

  /**
   * Create from existing string
   */
  public static fromString(value: string): BrandId {
    return new BrandId(value);
  }

  /**
   * Create from number (legacy database ID)
   */
  public static fromNumber(): BrandId {
    // For now, convert number to string.
    // TODO: Consider proper UUID migration strategy
    return new BrandId(uuidv4()); // Generate new UUID for now
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: BrandId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

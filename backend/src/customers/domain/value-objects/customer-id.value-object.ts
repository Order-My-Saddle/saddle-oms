/**
 * Customer ID Value Object
 * Supports both integer IDs (from database) and string representations
 */
export class CustomerId {
  constructor(private readonly _value: number | string) {
    if (_value === undefined || _value === null) {
      throw new Error("Customer ID cannot be empty");
    }

    // If string, must be a valid number string or 'new' for generation
    if (typeof _value === "string" && _value !== "new") {
      const parsed = parseInt(_value, 10);
      if (isNaN(parsed)) {
        throw new Error("Customer ID must be a valid number");
      }
    }
  }

  /**
   * Generate a new customer ID (placeholder until database assigns)
   */
  public static generate(): CustomerId {
    return new CustomerId("new");
  }

  /**
   * Create from existing string
   */
  public static fromString(value: string): CustomerId {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error("Customer ID must be a valid number");
    }
    return new CustomerId(parsed);
  }

  /**
   * Create from existing number
   */
  public static fromNumber(value: number): CustomerId {
    return new CustomerId(value);
  }

  public get value(): number | string {
    return this._value;
  }

  /**
   * Get numeric value (for database operations)
   */
  public get numericValue(): number | null {
    if (typeof this._value === "number") {
      return this._value;
    }
    if (this._value === "new") {
      return null;
    }
    const parsed = parseInt(this._value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Check if this is a new (unsaved) customer
   */
  public get isNew(): boolean {
    return this._value === "new";
  }

  public equals(other: CustomerId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return String(this._value);
  }
}

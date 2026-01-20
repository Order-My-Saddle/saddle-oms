/**
 * Factory Employee ID Value Object
 * Ensures factory employee IDs are valid positive integers
 * Aligned with production schema requirements
 */
export class FactoryEmployeeId {
  constructor(private readonly _value: number) {
    if (!_value && _value !== 0) {
      throw new Error("Factory Employee ID cannot be empty");
    }

    if (!Number.isInteger(_value) || _value < 0) {
      throw new Error("Factory Employee ID must be a positive integer");
    }
  }

  /**
   * Create from existing number
   */
  public static fromNumber(value: number): FactoryEmployeeId {
    return new FactoryEmployeeId(value);
  }

  /**
   * Create from string (for API input)
   */
  public static fromString(value: string): FactoryEmployeeId {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      throw new Error("Factory Employee ID must be a valid integer");
    }
    return new FactoryEmployeeId(numValue);
  }

  public get value(): number {
    return this._value;
  }

  public equals(other: FactoryEmployeeId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value.toString();
  }
}

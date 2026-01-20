/**
 * Order ID Value Object
 *
 * Represents a unique identifier for an order entity.
 * Ensures type safety and provides validation for order identifiers.
 * Uses integer IDs to match production database schema (SERIAL PRIMARY KEY).
 */
export class OrderId {
  private readonly value: number;

  private constructor(value: number) {
    this.validate(value);
    this.value = value;
  }

  /**
   * Create order ID from number
   */
  public static fromNumber(value: number): OrderId {
    return new OrderId(value);
  }

  /**
   * Create order ID from string (parses to integer)
   */
  public static fromString(value: string): OrderId {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error("Order ID must be a valid integer");
    }
    return new OrderId(parsed);
  }

  /**
   * Get the numeric value of the ID
   */
  public toNumber(): number {
    return this.value;
  }

  /**
   * Get the string representation of the ID
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * Get the raw value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Check equality with another OrderId
   */
  public equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  /**
   * Validate the order ID format
   */
  private validate(value: number): void {
    if (value === null || value === undefined) {
      throw new Error("Order ID cannot be empty");
    }

    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new Error("Order ID must be an integer");
    }

    if (value <= 0) {
      throw new Error("Order ID must be a positive integer");
    }
  }
}

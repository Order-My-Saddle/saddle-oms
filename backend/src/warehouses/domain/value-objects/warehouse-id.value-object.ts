import { v4 as uuidv4 } from "uuid";

/**
 * Warehouse ID Value Object
 *
 * Represents a unique identifier for a warehouse entity.
 * Ensures type safety and provides validation for warehouse identifiers.
 */
export class WarehouseId {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  /**
   * Generate a new unique warehouse ID
   */
  public static generate(): WarehouseId {
    return new WarehouseId(uuidv4());
  }

  /**
   * Create warehouse ID from string
   */
  public static fromString(value: string): WarehouseId {
    return new WarehouseId(value);
  }

  /**
   * Get the string representation of the ID
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Get the raw value
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Check equality with another WarehouseId
   */
  public equals(other: WarehouseId): boolean {
    return this.value === other.value;
  }

  /**
   * Validate the warehouse ID format
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error("Warehouse ID cannot be empty");
    }

    if (typeof value !== "string") {
      throw new Error("Warehouse ID must be a string");
    }

    // Check if it's a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("Warehouse ID must be a valid UUID");
    }
  }
}

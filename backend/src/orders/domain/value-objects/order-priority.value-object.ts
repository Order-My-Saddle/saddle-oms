/**
 * Order Priority Value Object
 *
 * Represents the priority level of an order for production scheduling.
 * Higher priority orders are processed first in the manufacturing queue.
 */
export class OrderPriority {
  private static readonly VALID_PRIORITIES = [
    "low",
    "normal",
    "high",
    "urgent",
    "critical",
  ];

  public static readonly LOW = new OrderPriority("low", 1);
  public static readonly NORMAL = new OrderPriority("normal", 2);
  public static readonly HIGH = new OrderPriority("high", 3);
  public static readonly URGENT = new OrderPriority("urgent", 4);
  public static readonly CRITICAL = new OrderPriority("critical", 5);

  private constructor(
    private readonly value: string,
    private readonly weight: number,
  ) {
    this.validate(value);
  }

  /**
   * Create priority from string
   */
  public static fromString(value: string): OrderPriority {
    const normalizedValue = value.toLowerCase();

    switch (normalizedValue) {
      case "low":
        return OrderPriority.LOW;
      case "normal":
        return OrderPriority.NORMAL;
      case "high":
        return OrderPriority.HIGH;
      case "urgent":
        return OrderPriority.URGENT;
      case "critical":
        return OrderPriority.CRITICAL;
      default:
        throw new Error(`Invalid priority: ${value}`);
    }
  }

  /**
   * Get the string representation of the priority
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
   * Get the numeric weight for sorting
   */
  public getWeight(): number {
    return this.weight;
  }

  /**
   * Check if this priority is higher than another
   */
  public isHigherThan(other: OrderPriority): boolean {
    return this.weight > other.weight;
  }

  /**
   * Check if this priority is lower than another
   */
  public isLowerThan(other: OrderPriority): boolean {
    return this.weight < other.weight;
  }

  /**
   * Check equality with another OrderPriority
   */
  public equals(other: OrderPriority): boolean {
    return this.value === other.value;
  }

  /**
   * Get display name for UI
   */
  public getDisplayName(): string {
    return this.value.charAt(0).toUpperCase() + this.value.slice(1);
  }

  /**
   * Get color code for UI display
   */
  public getColorCode(): string {
    switch (this.value) {
      case "low":
        return "#28a745"; // Green
      case "normal":
        return "#007bff"; // Blue
      case "high":
        return "#ffc107"; // Yellow
      case "urgent":
        return "#fd7e14"; // Orange
      case "critical":
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Gray
    }
  }

  /**
   * Check if priority requires immediate attention
   */
  public isUrgent(): boolean {
    return ["urgent", "critical"].includes(this.value);
  }

  /**
   * Validate the priority value
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error("Order priority cannot be empty");
    }

    if (typeof value !== "string") {
      throw new Error("Order priority must be a string");
    }

    if (!OrderPriority.VALID_PRIORITIES.includes(value.toLowerCase())) {
      throw new Error(
        `Invalid order priority: ${value}. Valid priorities: ${OrderPriority.VALID_PRIORITIES.join(", ")}`,
      );
    }
  }
}

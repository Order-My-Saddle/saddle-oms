/**
 * Order Status Value Object
 *
 * Represents the current status of an order in the saddle manufacturing workflow.
 * Enforces valid status transitions and business rules.
 */
export class OrderStatus {
  private static readonly VALID_STATUSES = [
    "pending",
    "confirmed",
    "in_production",
    "quality_control",
    "ready_for_shipping",
    "shipped",
    "shipped_to_customer",
    "delivered",
    "cancelled",
    "returned",
  ];

  public static readonly PENDING = new OrderStatus("pending");
  public static readonly CONFIRMED = new OrderStatus("confirmed");
  public static readonly IN_PRODUCTION = new OrderStatus("in_production");
  public static readonly QUALITY_CONTROL = new OrderStatus("quality_control");
  public static readonly READY_FOR_SHIPPING = new OrderStatus(
    "ready_for_shipping",
  );
  public static readonly SHIPPED = new OrderStatus("shipped");
  public static readonly SHIPPED_TO_CUSTOMER = new OrderStatus(
    "shipped_to_customer",
  );
  public static readonly DELIVERED = new OrderStatus("delivered");
  public static readonly CANCELLED = new OrderStatus("cancelled");
  public static readonly RETURNED = new OrderStatus("returned");

  private static readonly STATUS_TRANSITIONS: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["in_production", "cancelled"],
    in_production: ["quality_control", "cancelled"],
    quality_control: ["ready_for_shipping", "in_production", "cancelled"],
    ready_for_shipping: ["shipped", "cancelled"],
    shipped: ["shipped_to_customer", "delivered", "returned"],
    shipped_to_customer: ["delivered", "returned"],
    delivered: ["returned"],
    cancelled: [],
    returned: [],
  };

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * Create status from string
   */
  public static fromString(value: string): OrderStatus {
    return new OrderStatus(value.toLowerCase());
  }

  /**
   * Get the string representation of the status
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
   * Check if status transition is valid
   */
  public canTransitionTo(newStatus: OrderStatus): boolean {
    const allowedTransitions = OrderStatus.STATUS_TRANSITIONS[this.value] || [];
    return allowedTransitions.includes(newStatus.value);
  }

  /**
   * Get all possible next statuses
   */
  public getPossibleTransitions(): OrderStatus[] {
    const allowedTransitions = OrderStatus.STATUS_TRANSITIONS[this.value] || [];
    return allowedTransitions.map((status) => OrderStatus.fromString(status));
  }

  /**
   * Check if order is in a final state
   */
  public isFinal(): boolean {
    return ["delivered", "cancelled", "returned"].includes(this.value);
  }

  /**
   * Check if order is in production phase
   */
  public isInProduction(): boolean {
    return ["in_production", "quality_control"].includes(this.value);
  }

  /**
   * Check if order can be cancelled
   */
  public canBeCancelled(): boolean {
    return !this.isFinal() && this.value !== "shipped";
  }

  /**
   * Check equality with another OrderStatus
   */
  public equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  /**
   * Get display name for UI
   */
  public getDisplayName(): string {
    return this.value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Validate the status value
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error("Order status cannot be empty");
    }

    if (typeof value !== "string") {
      throw new Error("Order status must be a string");
    }

    if (!OrderStatus.VALID_STATUSES.includes(value.toLowerCase())) {
      throw new Error(
        `Invalid order status: ${value}. Valid statuses: ${OrderStatus.VALID_STATUSES.join(", ")}`,
      );
    }
  }
}

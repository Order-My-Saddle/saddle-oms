import { Order } from "./order";
import { OrderId } from "./value-objects/order-id.value-object";
import { OrderStatus } from "./value-objects/order-status.value-object";
import { OrderPriority } from "./value-objects/order-priority.value-object";

/**
 * Order Repository Interface
 *
 * Defines the contract for order data access operations.
 * This interface abstracts the persistence layer following hexagonal architecture.
 */
export interface IOrderRepository {
  /**
   * Save an order entity
   */
  save(order: Order): Promise<void>;

  /**
   * Find order by ID
   */
  findById(id: OrderId): Promise<Order | null>;

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string): Promise<Order | null>;

  /**
   * Find all orders with optional filters
   */
  findAll(filters?: {
    customerId?: number;
    fitterId?: number;
    factoryId?: number;
    status?: OrderStatus;
    priority?: OrderPriority;
    isUrgent?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    overdue?: boolean;
  }): Promise<Order[]>;

  /**
   * Find orders by customer ID
   */
  findByCustomerId(customerId: number): Promise<Order[]>;

  /**
   * Find orders by fitter ID
   */
  findByFitterId(fitterId: number): Promise<Order[]>;

  /**
   * Find orders by factory ID
   */
  findByFactoryId(factoryId: number): Promise<Order[]>;

  /**
   * Find orders by status
   */
  findByStatus(status: OrderStatus): Promise<Order[]>;

  /**
   * Find urgent orders
   */
  findUrgentOrders(): Promise<Order[]>;

  /**
   * Find overdue orders
   */
  findOverdueOrders(): Promise<Order[]>;

  /**
   * Find orders requiring deposit
   */
  findOrdersRequiringDeposit(): Promise<Order[]>;

  /**
   * Find orders in production
   */
  findOrdersInProduction(): Promise<Order[]>;

  /**
   * Find recent orders (last 30 days)
   */
  findRecentOrders(days?: number): Promise<Order[]>;

  /**
   * Count orders by status
   */
  countByStatus(status: OrderStatus): Promise<number>;

  /**
   * Count orders by customer
   */
  countByCustomerId(customerId: number): Promise<number>;

  /**
   * Count urgent orders
   */
  countUrgentOrders(): Promise<number>;

  /**
   * Count overdue orders
   */
  countOverdueOrders(): Promise<number>;

  /**
   * Get total order value for customer
   */
  getTotalValueByCustomerId(customerId: number): Promise<number>;

  /**
   * Get average order value
   */
  getAverageOrderValue(): Promise<number>;

  /**
   * Delete order (soft delete)
   */
  delete(id: OrderId): Promise<void>;

  /**
   * Check if order number exists
   */
  existsByOrderNumber(orderNumber: string): Promise<boolean>;

  /**
   * Find orders with pending payments
   */
  findOrdersWithPendingPayments(): Promise<Order[]>;

  /**
   * Find orders for production scheduling
   */
  findOrdersForProduction(limit?: number): Promise<Order[]>;

  /**
   * Get status counts for dashboard
   */
  getStatusCounts(): Promise<Record<string, number>>;

  /**
   * Count total orders
   */
  countTotal(): Promise<number>;

  // Production migration methods
  findProductionOrders(filters?: any): Promise<Order[]>;
  bulkCreate(orders: Order[]): Promise<Order[]>;

  // NOTE: getSeatSizeSummary removed - legacy system stores seat size in special_notes field
}

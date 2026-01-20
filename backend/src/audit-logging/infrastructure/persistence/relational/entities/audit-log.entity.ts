import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "../../../../../users/infrastructure/persistence/relational/entities/user.entity";
import { OrderEntity } from "../../../../../orders/infrastructure/persistence/relational/entities/order.entity";

/**
 * AuditLog TypeORM Entity
 *
 * Stores application audit logs for comprehensive tracking of user actions
 * and system events. Designed to handle 764K+ production audit records.
 *
 * Performance optimizations:
 * - Strategic indexes for common query patterns
 * - Lazy loading for relationships
 * - Dual ID system for legacy migration support
 */
@Entity("audit_log")
@Index(["userId", "timestamp"]) // Primary query pattern
@Index(["orderId"]) // Order-specific audit trails
@Index(["timestamp"]) // Time-based queries
@Index(["action"]) // Action-specific filtering
@Index(["userType"]) // User type filtering
@Index(["orderStatusFrom", "orderStatusTo"]) // Status change tracking
export class AuditLogEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  /**
   * User who performed the action
   */
  @Column({ name: "user_id", type: "integer" })
  userId: number;

  /**
   * Type of user (from legacy system)
   * Enum values from legacy: 1=Admin, 2=Fitter, 3=Customer, etc.
   */
  @Column({ name: "user_type", type: "integer" })
  userType: number;

  /**
   * Order ID if action is order-related (nullable for non-order actions)
   */
  @Column({ name: "order_id", type: "integer", nullable: true })
  orderId: number | null;

  /**
   * Description of the action performed
   * Examples: "Order created", "Status changed", "Customer updated", etc.
   */
  @Column({ type: "text" })
  action: string;

  /**
   * Previous order status (for status change tracking)
   */
  @Column({ name: "order_status_from", type: "integer", nullable: true })
  orderStatusFrom: number | null;

  /**
   * New order status (for status change tracking)
   */
  @Column({ name: "order_status_to", type: "integer", nullable: true })
  orderStatusTo: number | null;

  /**
   * When the action occurred (preserved from legacy system)
   */
  @Column({ name: "timestamp", type: "timestamp" })
  timestamp: Date;

  /**
   * When this record was created in the new system
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Relationships

  /**
   * User who performed the action
   * Lazy loaded for performance
   */
  @ManyToOne(() => UserEntity, { lazy: true })
  @JoinColumn({ name: "user_id" })
  user: Promise<UserEntity>;

  /**
   * Order that was affected (optional)
   * Lazy loaded for performance
   */
  @ManyToOne(() => OrderEntity, { lazy: true, nullable: true })
  @JoinColumn({ name: "order_id" })
  order: Promise<OrderEntity | null>;

  constructor() {
    this.userType = 0;
    this.orderId = null;
    this.action = "";
    this.orderStatusFrom = null;
    this.orderStatusTo = null;
    this.timestamp = new Date();
  }
}

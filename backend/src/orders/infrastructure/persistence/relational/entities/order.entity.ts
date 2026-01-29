import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

/**
 * Order TypeORM Entity
 *
 * Represents the orders table structure in the database.
 * Maps to the Order domain entity through the infrastructure layer.
 */
@Entity("orders")
@Index(["customerId"])
@Index(["fitterId"])
@Index(["factoryId"])
@Index(["status"])
@Index(["priority"])
@Index(["orderNumber"], { unique: true })
@Index(["isUrgent"])
@Index(["estimatedDeliveryDate"])
@Index(["createdAt"])
@Index(["deletedAt"])
@Index(["saddleId"])
@Index(["customerName"])
@Index(["fitterId", "createdAt"])
@Index(["saddleId", "createdAt"])
export class OrderEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "customer_id", type: "integer" })
  customerId: number;

  @Column({ name: "order_number", type: "varchar", length: 50, unique: true })
  orderNumber: string;

  @Column({
    type: "varchar",
    length: 50,
    default: "pending",
  })
  status: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "normal",
  })
  priority: string;

  @Column({ name: "fitter_id", type: "integer", nullable: true })
  fitterId: number | null;

  @Column({ name: "factory_id", type: "integer", nullable: true })
  factoryId: number | null;

  @Column({
    name: "saddle_specifications",
    type: "json",
    transformer: {
      to: (value: Record<string, any>) => JSON.stringify(value || {}),
      from: (value: string) => {
        if (typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return value || {};
      },
    },
  })
  saddleSpecifications: Record<string, any>;

  @Column({ name: "special_instructions", type: "text", nullable: true })
  specialInstructions: string | null;

  @Column({
    name: "estimated_delivery_date",
    type: "timestamp",
    nullable: true,
  })
  estimatedDeliveryDate: Date | null;

  @Column({ name: "actual_delivery_date", type: "timestamp", nullable: true })
  actualDeliveryDate: Date | null;

  @Column({
    name: "total_amount",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @Column({
    name: "deposit_paid",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  depositPaid: number;

  @Column({
    name: "balance_owing",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balanceOwing: number;

  @Column({
    type: "json",
    nullable: true,
    transformer: {
      to: (value: Record<string, any> | null) =>
        value ? JSON.stringify(value) : null,
      from: (value: string | null) => {
        if (value && typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      },
    },
  })
  measurements: Record<string, any> | null;

  /**
   * Seat sizes extracted from special_notes field.
   * Format: ["17", "17,5"] (European decimal notation with comma)
   * Populated via extract-seat-sizes.sh script
   */
  @Column({
    name: "seat_sizes",
    type: "jsonb",
    nullable: true,
    default: null,
    transformer: {
      to: (value: string[] | null) => value,
      from: (value: any) => {
        if (value && typeof value === "string") {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      },
    },
  })
  seatSizes: string[] | null;

  @Column({
    name: "customer_name",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  customerName: string | null;

  @Column({ name: "saddle_id", type: "integer", nullable: true })
  saddleId: number | null;

  @Column({
    name: "is_urgent",
    type: "boolean",
    default: false,
    transformer: {
      to: (value: boolean) => value,
      from: (value: any) => {
        if (typeof value === "string") {
          return value.toLowerCase() === "true" || value === "1";
        }
        return Boolean(value);
      },
    },
  })
  isUrgent: boolean;

  // Legacy boolean flags synced from production data
  @Column({ type: "boolean", default: false })
  rushed: boolean;

  @Column({ type: "boolean", default: false })
  repair: boolean;

  @Column({ type: "boolean", default: false })
  demo: boolean;

  @Column({ type: "boolean", default: false })
  sponsored: boolean;

  @Column({ name: "fitter_stock", type: "boolean", default: false })
  fitterStock: boolean;

  @Column({ name: "custom_order", type: "boolean", default: false })
  customOrder: boolean;

  // Legacy changed timestamp (Unix timestamp)
  @Column({ type: "bigint", nullable: true })
  changed: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  constructor() {
    this.saddleSpecifications = {};
    this.totalAmount = 0;
    this.depositPaid = 0;
    this.balanceOwing = 0;
    this.isUrgent = false;
    this.customerName = null;
    // Legacy boolean flags
    this.rushed = false;
    this.repair = false;
    this.demo = false;
    this.sponsored = false;
    this.fitterStock = false;
    this.customOrder = false;
    this.changed = null;
  }
}

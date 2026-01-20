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

  @Column({
    name: "seat_sizes",
    type: "jsonb",
    nullable: true,
    transformer: {
      to: (value: string[] | null) =>
        value && value.length > 0 ? JSON.stringify(value) : null,
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
    this.seatSizes = null;
    this.customerName = null;
  }
}

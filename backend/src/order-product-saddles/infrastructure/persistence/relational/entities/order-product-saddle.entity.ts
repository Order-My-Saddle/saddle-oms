import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OrderEntity } from "../../../../../orders/infrastructure/persistence/relational/entities/order.entity";
// import { SaddleEntity } from "../../../../../products/infrastructure/persistence/relational/entities/saddle.entity"; // Temporarily disabled

/**
 * OrderProductSaddle TypeORM Entity
 *
 * Junction table linking orders with products (saddles).
 * Represents the many-to-many relationship between orders and saddles,
 * including configuration, quantities, and product-specific notes.
 */
@Entity("order_product_saddle")
@Index(["orderId"])
@Index(["productId"])
@Index(["serial"])
@Index(["orderId", "sequence"])
export class OrderProductSaddleEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "order_id", type: "integer" })
  orderId: number;

  @Column({ name: "product_id", type: "integer" })
  productId: number;

  @Column({ name: "serial", type: "varchar", length: 100, nullable: true })
  serial: string | null;

  @Column({
    name: "configuration",
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
  configuration: Record<string, any> | null;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ type: "int", default: 0 })
  sequence: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  // Relations
  @ManyToOne(() => OrderEntity, { nullable: false })
  @JoinColumn({ name: "order_id" })
  order?: OrderEntity;

  // @ManyToOne(() => SaddleEntity, { nullable: false })
  // @JoinColumn({ name: "product_id" })
  // product?: SaddleEntity; // Temporarily disabled

  constructor() {
    this.configuration = null;
    this.quantity = 1;
    this.sequence = 0;
    this.serial = null;
    this.notes = null;
  }
}

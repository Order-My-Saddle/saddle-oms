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
 * Comment TypeORM Entity
 *
 * Represents the comments table structure in the database.
 * Used for order comments, internal notes, and customer communications.
 *
 * Uses INTEGER IDs to match current schema (orders, credentials tables).
 */
@Entity("comment")
@Index(["orderId"])
@Index(["userId"])
@Index(["type"])
@Index(["orderId", "createdAt"])
@Index(["orderId", "isInternal"])
@Index(["createdAt"])
@Index(["deletedAt"])
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "order_id", type: "integer" })
  @Index()
  orderId: number;

  @Column({ name: "user_id", type: "integer", nullable: true })
  userId: number | null;

  @Column({ type: "text" })
  content: string;

  @Column({
    type: "varchar",
    length: 50,
    default: "general",
  })
  type: string;

  @Column({
    name: "is_internal",
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
  isInternal: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  constructor() {
    this.type = "general";
    this.isInternal = false;
    this.userId = null;
  }
}

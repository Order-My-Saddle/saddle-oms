import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

/**
 * Warehouse TypeORM Entity
 *
 * Represents the warehouse table structure in the database.
 * Maps to the Warehouse domain entity through the infrastructure layer.
 */
@Entity("warehouse")
@Index(["name"])
@Index(["code"], { unique: true })
@Index(["city"])
@Index(["country"])
@Index(["isActive"])
@Index(["deletedAt"])
export class WarehouseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  code: string | null;

  @Column({ type: "text", nullable: true })
  address: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  country: string | null;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
    transformer: {
      to: (value: boolean) => value,
      from: (value: any) => {
        if (value === null || value === undefined) return true;
        if (typeof value === "string")
          return value.toLowerCase() === "true" || value === "1";
        if (typeof value === "number") return value === 1;
        return Boolean(value);
      },
    },
  })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  // Computed properties for business logic
  get fullAddress(): string {
    const parts = [this.address, this.city, this.country].filter(
      (part) => part && part.trim() !== "",
    );
    return parts.join(", ");
  }

  get displayName(): string {
    return this.code ? `${this.name} (${this.code})` : this.name;
  }

  get effectivelyActive(): boolean {
    return this.isActive && !this.deletedAt;
  }

  constructor() {
    this.code = null;
    this.address = null;
    this.city = null;
    this.country = null;
    this.isActive = true;
  }
}

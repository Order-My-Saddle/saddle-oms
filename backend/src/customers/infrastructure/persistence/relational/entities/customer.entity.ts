import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { CustomerStatus } from "../../../../domain/value-objects/customer-status.value-object";

/**
 * Customer TypeORM Entity
 *
 * Represents the customers table in the database.
 * Uses INTEGER IDs to match PostgreSQL schema.
 */
@Entity("customers")
@Index("customer_name_index", ["name"])
@Index("customer_email_index", ["email"])
@Index("customer_fitter_index", ["fitterId"])
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "email", type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "horse_name", type: "varchar", length: 255, nullable: true })
  horseName?: string;

  @Column({ name: "company", type: "varchar", length: 255, nullable: true })
  company?: string;

  @Column({ name: "address", type: "text", nullable: true })
  address?: string;

  @Column({ name: "city", type: "varchar", length: 100, nullable: true })
  city?: string;

  @Column({ name: "state", type: "varchar", length: 100, nullable: true })
  state?: string;

  @Column({ name: "zipcode", type: "varchar", length: 20, nullable: true })
  zipcode?: string;

  @Column({ name: "country", type: "varchar", length: 100, nullable: true })
  country?: string;

  @Column({ name: "phone_no", type: "varchar", length: 50, nullable: true })
  phoneNo?: string;

  @Column({ name: "cell_no", type: "varchar", length: 50, nullable: true })
  cellNo?: string;

  @Column({
    name: "bank_account_number",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  bankAccountNumber?: string;

  @Column({ name: "fitter_id", type: "integer", nullable: true })
  fitterId?: number;

  @Column({
    name: "deleted",
    type: "smallint",
    default: 0,
  })
  deleted: number;

  @Column({
    name: "status",
    type: "varchar",
    length: 50,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  // Computed properties for business logic
  get isActive(): boolean {
    return this.deleted === 0 && !this.deletedAt;
  }

  get hasFitter(): boolean {
    return this.fitterId !== null && this.fitterId !== undefined;
  }

  get displayName(): string {
    if (this.email) {
      return `${this.name} (${this.email})`;
    }
    return this.name;
  }

  get displayInfo(): string {
    const parts = [this.city, this.state, this.country].filter(Boolean);
    return parts.join(", ") || "No location";
  }

  constructor() {
    this.deleted = 0;
    this.status = CustomerStatus.ACTIVE;
  }
}

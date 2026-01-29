import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * Customer TypeORM Entity
 *
 * Represents the customers table in the database.
 * Uses INTEGER IDs to match PostgreSQL schema.
 * Schema matches the legacy database exactly.
 */
@Entity("customers")
@Index("idx_customers_fitter_id", ["fitterId"])
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "email", type: "varchar", length: 300, default: "" })
  email: string;

  @Column({ name: "name", type: "varchar", length: 255, default: "" })
  name: string;

  @Column({ name: "horse_name", type: "varchar", length: 255, default: "" })
  horseName: string;

  @Column({ name: "company", type: "varchar", length: 255, default: "" })
  company: string;

  @Column({ name: "address", type: "varchar", length: 255, default: "" })
  address: string;

  @Column({ name: "city", type: "varchar", length: 255, default: "" })
  city: string;

  @Column({ name: "state", type: "varchar", length: 255, default: "" })
  state: string;

  @Column({ name: "zipcode", type: "varchar", length: 20, default: "" })
  zipcode: string;

  @Column({ name: "country", type: "varchar", length: 255, default: "" })
  country: string;

  @Column({ name: "phone_no", type: "varchar", length: 20, default: "" })
  phoneNo: string;

  @Column({ name: "cell_no", type: "varchar", length: 20, default: "" })
  cellNo: string;

  @Column({
    name: "bank_account_number",
    type: "varchar",
    length: 20,
    default: "",
  })
  bankAccountNumber: string;

  @Column({ name: "fitter_id", type: "integer", default: 0 })
  fitterId: number;

  @Column({
    name: "deleted",
    type: "smallint",
    default: 0,
  })
  deleted: number;

  // Computed properties for business logic
  get isActive(): boolean {
    return this.deleted === 0;
  }

  get hasFitter(): boolean {
    return this.fitterId !== null && this.fitterId !== undefined && this.fitterId !== 0;
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
    this.fitterId = 0;
    this.email = "";
    this.name = "";
    this.horseName = "";
    this.company = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zipcode = "";
    this.country = "";
    this.phoneNo = "";
    this.cellNo = "";
    this.bankAccountNumber = "";
  }
}

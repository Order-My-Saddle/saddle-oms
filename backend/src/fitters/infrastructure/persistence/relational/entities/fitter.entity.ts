import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

/**
 * Fitter TypeORM Entity
 *
 * Represents the fitters table in the PostgreSQL database.
 * Uses INTEGER IDs and simplified schema matching production data.
 */
@Entity("fitters")
@Index(["userId"])
@Index(["city"])
@Index(["country"])
@Index(["deleted"])
export class FitterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id", type: "integer", nullable: true })
  userId: number | null;

  @Column({ name: "address", type: "varchar", length: 100, nullable: true })
  address: string | null;

  @Column({ name: "zipcode", type: "varchar", length: 20, nullable: true })
  zipcode: string | null;

  @Column({ name: "state", type: "varchar", length: 100, nullable: true })
  state: string | null;

  @Column({ name: "city", type: "varchar", length: 100, nullable: true })
  city: string | null;

  @Column({ name: "country", type: "varchar", length: 100, nullable: true })
  country: string | null;

  @Column({ name: "phone_no", type: "varchar", length: 50, nullable: true })
  phoneNo: string | null;

  @Column({ name: "cell_no", type: "varchar", length: 50, nullable: true })
  cellNo: string | null;

  @Column({ name: "currency", type: "integer", nullable: true })
  currency: number | null;

  @Column({ name: "emailaddress", type: "varchar", length: 255, nullable: true })
  emailaddress: string | null;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  // Computed properties for business logic
  get isActive(): boolean {
    return this.deleted === 0 && !this.deletedAt;
  }

  get fullAddress(): string {
    const parts = [this.address, this.city, this.state, this.zipcode, this.country].filter(
      (part) => part && part.trim() !== "",
    );
    return parts.join(", ");
  }

  get displayName(): string {
    return this.city ? `Fitter in ${this.city}` : `Fitter #${this.id}`;
  }

  constructor() {
    this.deleted = 0;
  }
}

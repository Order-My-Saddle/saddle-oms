import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "../../../../../users/infrastructure/persistence/relational/entities/user.entity";

/**
 * Country Manager Entity
 *
 * Represents country managers who oversee specific countries or regions
 * Table: country_manager
 */
@Entity("country_manager")
@Index("country_manager_user_index", ["userId"])
@Index("country_manager_country_index", ["country"])
@Index("country_manager_region_index", ["region"])
@Index("country_manager_active_index", ["isActive"])
export class CountryManagerEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "user_id", type: "integer", nullable: false })
  userId: number;

  @Column({ name: "country", type: "varchar", length: 100, nullable: false })
  country: string;

  @Column({
    name: "region",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  region?: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  createdBy?: number;

  @Column({ name: "updated_by", type: "integer", nullable: true })
  updatedBy?: number;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(() => UserEntity, { lazy: true })
  @JoinColumn({ name: "created_by" })
  creator?: UserEntity;

  @ManyToOne(() => UserEntity, { lazy: true })
  @JoinColumn({ name: "updated_by" })
  updater?: UserEntity;

  // Computed properties for business logic
  get displayInfo(): string {
    return `${this.country}${this.region ? ` (${this.region})` : ""}`;
  }

  /**
   * Check if effectively deleted
   */
  get effectivelyDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }
}

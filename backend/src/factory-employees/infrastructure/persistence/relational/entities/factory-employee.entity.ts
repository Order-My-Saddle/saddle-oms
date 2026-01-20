import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { FactoryEntity } from "../../../../../factories/infrastructure/persistence/relational/entities/factory.entity";

/**
 * Factory Employee TypeORM Entity
 *
 * Represents the factory_employees table structure in the database.
 * Maps to the FactoryEmployee domain entity through the infrastructure layer.
 * Uses integer IDs for production schema alignment.
 */
@Entity("factory_employees")
@Index("factory_employees_factory_id_index", ["factoryId"])
@Index("factory_employees_name_index", ["name"])
@Index("factory_employees_factory_name_unique", ["factoryId", "name"], {
  unique: true,
})
export class FactoryEmployeeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "factory_id", type: "integer", nullable: false })
  factoryId: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => FactoryEntity, { lazy: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "factory_id" })
  factory?: FactoryEntity;

  // Computed properties for business logic
  get displayInfo(): string {
    return `${this.name} (Factory: ${this.factoryId})`;
  }

  /**
   * Check if employee belongs to specific factory
   */
  belongsToFactory(factoryId: number): boolean {
    return this.factoryId === factoryId;
  }

  constructor() {
    // Initialize with default values if needed
  }
}

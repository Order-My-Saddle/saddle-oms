import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * Leathertype TypeORM Entity
 *
 * Represents the leather_types table in the database.
 * Uses INTEGER IDs and simplified schema.
 */
@Entity("leather_types")
@Index("leathertype_name_index", ["name"])
@Index("leathertype_sequence_index", ["sequence"])
export class LeathertypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name", type: "varchar", length: 200, nullable: false })
  name: string;

  @Column({ name: "sequence", type: "smallint", default: 0 })
  sequence: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  // Computed properties for business logic
  get isActive(): boolean {
    return this.deleted === 0;
  }

  get displayName(): string {
    return this.name;
  }

  constructor() {
    this.deleted = 0;
    this.sequence = 0;
  }
}

import { Column, Entity, PrimaryColumn, Index } from "typeorm";

import { EntityRelationalHelper } from "../../../../../utils/relational-entity-helper";

/**
 * Status TypeORM Entity
 *
 * Represents the statuses table in the database.
 * Order status definitions with factory visibility settings.
 */
@Entity({
  name: "statuses",
})
@Index("idx_statuses_sequence", ["sequence"])
@Index("idx_statuses_factory_hidden", ["factoryHidden"])
export class StatusEntity extends EntityRelationalHelper {
  @PrimaryColumn()
  id: number;

  @Column({ name: "name", type: "varchar", length: 30, unique: true })
  name: string;

  @Column({ name: "factory_hidden", type: "smallint", default: 0 })
  factoryHidden: number;

  @Column({
    name: "factory_alternative_name",
    type: "varchar",
    length: 30,
    default: "",
  })
  factoryAlternativeName: string;

  @Column({ name: "sequence", type: "integer", default: 0 })
  sequence: number;

  // Computed property for visibility
  get isVisibleToFactory(): boolean {
    return this.factoryHidden === 0;
  }

  // Get display name for factory (alternative name if set, otherwise main name)
  get factoryDisplayName(): string {
    return this.factoryAlternativeName || this.name;
  }
}

import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("presets")
@Index("preset_name_index", ["name"])
@Index("preset_sequence_index", ["sequence"])
export class PresetEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "sequence", type: "integer", default: 0 })
  sequence: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;
}

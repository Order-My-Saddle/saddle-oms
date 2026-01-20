import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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

  @Column({ name: "deleted", type: "boolean", default: false })
  deleted: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;
}

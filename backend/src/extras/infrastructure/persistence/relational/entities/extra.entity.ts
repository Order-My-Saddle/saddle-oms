import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("extras")
@Index("extra_name_index", ["name"])
export class ExtraEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({
    name: "price",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({ name: "sequence", type: "integer", default: 0 })
  sequence: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;
}

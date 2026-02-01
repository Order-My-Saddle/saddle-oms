import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SaddleEntity } from "../../../../../saddles/infrastructure/persistence/relational/entities/saddle.entity";

@Entity("saddle_extras")
@Index("idx_saddle_extras_saddle_id", ["saddleId"])
@Index("idx_saddle_extras_extra_id", ["extraId"])
export class SaddleExtraEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "saddle_id", type: "integer", nullable: false })
  saddleId: number;

  @Column({ name: "extra_id", type: "integer", nullable: false })
  extraId: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  @ManyToOne(() => SaddleEntity, { nullable: false })
  @JoinColumn({ name: "saddle_id" })
  saddle?: SaddleEntity;

  get isActive(): boolean {
    return this.deleted === 0;
  }

  constructor() {
    this.deleted = 0;
  }
}

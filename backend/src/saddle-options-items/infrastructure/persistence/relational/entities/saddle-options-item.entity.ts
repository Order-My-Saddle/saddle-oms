import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SaddleEntity } from "../../../../../saddles/infrastructure/persistence/relational/entities/saddle.entity";
import { OptionEntity } from "../../../../../options/infrastructure/persistence/relational/entities/option.entity";
import { OptionItemEntity } from "../../../../../options-items/infrastructure/persistence/relational/entities/option-item.entity";

/**
 * SaddleOptionsItem TypeORM Entity
 *
 * Represents the saddle_options_items table in the database.
 * Complex saddle configuration linking saddles to option items.
 */
@Entity("saddle_options_items")
@Index("idx_saddle_options_items_saddle_id", ["saddleId"])
@Index("idx_saddle_options_items_option_id", ["optionId"])
@Index("idx_saddle_options_items_option_item_id", ["optionItemId"])
@Index("idx_saddle_options_items_leather_id", ["leatherId"])
@Index("idx_saddle_options_items_sequence", ["sequence"])
export class SaddleOptionsItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "saddle_id", type: "integer", nullable: false })
  saddleId: number;

  @Column({ name: "option_id", type: "integer", nullable: false })
  optionId: number;

  @Column({ name: "option_item_id", type: "integer", nullable: false })
  optionItemId: number;

  @Column({ name: "leather_id", type: "integer", nullable: false })
  leatherId: number;

  @Column({ name: "sequence", type: "smallint", default: 0 })
  sequence: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  // Relationships
  @ManyToOne(() => SaddleEntity, { nullable: false })
  @JoinColumn({ name: "saddle_id" })
  saddle?: SaddleEntity;

  @ManyToOne(() => OptionEntity, { nullable: false })
  @JoinColumn({ name: "option_id" })
  option?: OptionEntity;

  @ManyToOne(() => OptionItemEntity, { nullable: false })
  @JoinColumn({ name: "option_item_id" })
  optionItem?: OptionItemEntity;

  // Computed properties
  get isActive(): boolean {
    return this.deleted === 0;
  }

  constructor() {
    this.deleted = 0;
    this.sequence = 0;
  }
}

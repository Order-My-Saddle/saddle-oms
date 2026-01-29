import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OptionEntity } from "../../../../../options/infrastructure/persistence/relational/entities/option.entity";

/**
 * OptionItem TypeORM Entity
 *
 * Represents the options_items table in the database.
 * Uses INTEGER IDs and 7-tier pricing structure.
 */
@Entity("options_items")
@Index("idx_options_items_option_id", ["optionId"])
@Index("idx_options_items_leather_id", ["leatherId"])
@Index("idx_options_items_name", ["name"])
@Index("idx_options_items_sequence", ["sequence"])
export class OptionItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "option_id", type: "integer", nullable: false })
  optionId: number;

  @Column({ name: "leather_id", type: "integer", default: 0 })
  leatherId: number;

  @Column({ name: "name", type: "varchar", length: 250, nullable: false })
  name: string;

  @Column({ name: "user_color", type: "smallint", default: 0 })
  userColor: number;

  @Column({ name: "user_leather", type: "smallint", default: 0 })
  userLeather: number;

  // 7-tier pricing structure
  @Column({ name: "price1", type: "smallint", default: 0 })
  price1: number;

  @Column({ name: "price2", type: "smallint", default: 0 })
  price2: number;

  @Column({ name: "price3", type: "smallint", default: 0 })
  price3: number;

  @Column({ name: "price4", type: "integer", default: 0 })
  price4: number;

  @Column({ name: "price5", type: "integer", default: 0 })
  price5: number;

  @Column({ name: "price6", type: "integer", default: 0 })
  price6: number;

  @Column({ name: "price7", type: "integer", default: 0 })
  price7: number;

  @Column({ name: "sequence", type: "smallint", default: 0 })
  sequence: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  @Column({ name: "restrict", type: "text", nullable: true })
  restrict?: string;

  // Relationship to parent option
  @ManyToOne(() => OptionEntity, { nullable: false })
  @JoinColumn({ name: "option_id" })
  option?: OptionEntity;

  // Computed properties
  get isActive(): boolean {
    return this.deleted === 0;
  }

  /**
   * Get price for specific tier
   */
  getPriceForTier(tier: number): number {
    if (tier < 1 || tier > 7) {
      throw new Error("Price tier must be between 1 and 7");
    }
    const priceField = `price${tier}`;
    return this[priceField] || 0;
  }

  /**
   * Get all prices as array
   */
  getAllPrices(): number[] {
    return [
      this.price1,
      this.price2,
      this.price3,
      this.price4,
      this.price5,
      this.price6,
      this.price7,
    ];
  }

  constructor() {
    this.deleted = 0;
    this.sequence = 0;
    this.leatherId = 0;
    this.userColor = 0;
    this.userLeather = 0;
  }
}

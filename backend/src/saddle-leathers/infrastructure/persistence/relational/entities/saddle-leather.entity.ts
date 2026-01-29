import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SaddleEntity } from "../../../../../saddles/infrastructure/persistence/relational/entities/saddle.entity";

/**
 * SaddleLeather TypeORM Entity
 *
 * Represents the saddle_leathers table in the database.
 * Links saddles with leather options and 7-tier pricing.
 */
@Entity("saddle_leathers")
@Index("idx_saddle_leathers_saddle_id", ["saddleId"])
@Index("idx_saddle_leathers_leather_id", ["leatherId"])
@Index("idx_saddle_leathers_sequence", ["sequence"])
export class SaddleLeatherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "saddle_id", type: "integer", nullable: false })
  saddleId: number;

  @Column({ name: "leather_id", type: "integer", nullable: false })
  leatherId: number;

  // 7-tier pricing structure
  @Column({ name: "price1", type: "integer", default: 0 })
  price1: number;

  @Column({ name: "price2", type: "integer", default: 0 })
  price2: number;

  @Column({ name: "price3", type: "integer", default: 0 })
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

  // Relationship to saddle
  @ManyToOne(() => SaddleEntity, { nullable: false })
  @JoinColumn({ name: "saddle_id" })
  saddle?: SaddleEntity;

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
  }
}

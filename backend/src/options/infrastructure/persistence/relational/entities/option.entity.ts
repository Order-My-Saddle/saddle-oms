import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

/**
 * Option TypeORM Entity
 *
 * Represents the options table in the database.
 * Uses INTEGER IDs and 7-tier pricing structure.
 */
@Entity("options")
@Index("idx_options_name", ["name"])
@Index("idx_options_group", ["group"])
@Index("idx_options_sequence", ["sequence"])
@Index("idx_options_type", ["type"])
export class OptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "group", type: "varchar", length: 255, nullable: true })
  group?: string;

  @Column({ name: "type", type: "smallint", default: 0 })
  type: number;

  // 7-tier pricing structure
  @Column({ name: "price_1", type: "integer", default: 0 })
  price1: number;

  @Column({ name: "price_2", type: "integer", default: 0 })
  price2: number;

  @Column({ name: "price_3", type: "integer", default: 0 })
  price3: number;

  @Column({ name: "price_4", type: "integer", default: 0 })
  price4: number;

  @Column({ name: "price_5", type: "integer", default: 0 })
  price5: number;

  @Column({ name: "price_6", type: "integer", default: 0 })
  price6: number;

  @Column({ name: "price_7", type: "integer", default: 0 })
  price7: number;

  // Contrast pricing tiers
  @Column({ name: "price_contrast_1", type: "integer", default: 0 })
  priceContrast1: number;

  @Column({ name: "price_contrast_2", type: "integer", default: 0 })
  priceContrast2: number;

  @Column({ name: "price_contrast_3", type: "integer", default: 0 })
  priceContrast3: number;

  @Column({ name: "price_contrast_4", type: "integer", default: 0 })
  priceContrast4: number;

  @Column({ name: "price_contrast_5", type: "integer", default: 0 })
  priceContrast5: number;

  @Column({ name: "price_contrast_6", type: "integer", default: 0 })
  priceContrast6: number;

  @Column({ name: "price_contrast_7", type: "integer", default: 0 })
  priceContrast7: number;

  @Column({ name: "sequence", type: "smallint", default: 0 })
  sequence: number;

  @Column({ name: "extra_allowed", type: "smallint", default: 0 })
  extraAllowed: number;

  @Column({ name: "deleted", type: "smallint", default: 0 })
  deleted: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  // Computed properties for business logic
  get isActive(): boolean {
    return this.deleted === 0 && !this.deletedAt;
  }

  /**
   * Get price for specific tier
   */
  getPriceForTier(tier: number, contrast: boolean = false): number {
    if (tier < 1 || tier > 7) {
      throw new Error("Price tier must be between 1 and 7");
    }

    const priceField = contrast ? `priceContrast${tier}` : `price${tier}`;
    return this[priceField] || 0;
  }

  /**
   * Get all prices as array
   */
  getAllPrices(contrast: boolean = false): number[] {
    return Array.from({ length: 7 }, (_, i) =>
      this.getPriceForTier(i + 1, contrast),
    );
  }

  constructor() {
    this.deleted = 0;
    this.sequence = 0;
    this.type = 0;
  }
}

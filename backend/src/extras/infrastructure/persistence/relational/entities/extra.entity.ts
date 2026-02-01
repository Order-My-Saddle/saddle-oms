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

  // 7-tier pricing structure (USD, EUR, GBP, CAD, AUD, NOK, DKK)
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

  @Column({ name: "sequence", type: "integer", default: 0 })
  sequence: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  get isActive(): boolean {
    return this.deletedAt === null;
  }

  getPriceForTier(tier: number): number {
    if (tier < 1 || tier > 7) {
      throw new Error("Price tier must be between 1 and 7");
    }
    const priceField = `price${tier}`;
    return this[priceField] || 0;
  }

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
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BrandEntity } from "../../../../../brands/infrastructure/persistence/relational/entities/brand.entity";

@Entity("saddles")
@Index("saddle_brand_index", ["brand"])
@Index("saddle_sequence_index", ["sequence"])
@Index("saddle_legacy_id_index", ["legacyId"], { unique: true })
export class SaddleEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "legacy_id", type: "integer", unique: true, nullable: true })
  legacyId: number | null;

  // Factory assignments by region
  @Column({ name: "factory_eu", type: "integer", default: 0 })
  factoryEu: number;

  @Column({ name: "factory_gb", type: "integer", default: 0 })
  factoryGb: number;

  @Column({ name: "factory_us", type: "integer", default: 0 })
  factoryUs: number;

  @Column({ name: "factory_ca", type: "integer", default: 0 })
  factoryCa: number;

  @Column({ name: "factory_aud", type: "integer", nullable: true })
  factoryAud?: number;

  @Column({ name: "factory_de", type: "integer", nullable: true })
  factoryDe?: number;

  @Column({ name: "factory_nl", type: "integer", nullable: true })
  factoryNl?: number;

  @Column({ name: "brand", type: "varchar", length: 255, nullable: false })
  brand: string;

  @Column({ name: "model_name", type: "varchar", length: 255, nullable: false })
  modelName: string;

  @Column({ name: "presets", type: "text", nullable: true })
  presets?: string; // JSON data

  @Column({ name: "active", type: "boolean", default: true })
  active: boolean;

  @Column({ name: "type", type: "integer", default: 0 })
  type: number;

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

  /**
   * Get factory ID for specific region
   */
  getFactoryForRegion(region: string): number | null {
    const regionMap = {
      eu: this.factoryEu,
      gb: this.factoryGb,
      us: this.factoryUs,
      ca: this.factoryCa,
      aud: this.factoryAud,
      de: this.factoryDe,
      nl: this.factoryNl,
    };

    return regionMap[region.toLowerCase()] || null;
  }

  /**
   * Check if saddle is available for ordering
   */
  isAvailable(): boolean {
    return this.active && !this.deleted && !this.deletedAt;
  }

  /**
   * Find by either UUID or legacy ID
   */
  static createFindOptions(id: string | number): any {
    if (typeof id === "string") {
      // UUID lookup
      return { id };
    } else {
      // Legacy ID lookup
      return { legacyId: id };
    }
  }
}

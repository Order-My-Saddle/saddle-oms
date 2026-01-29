import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * Saddle TypeORM Entity
 *
 * Represents the saddles table in the database.
 * Master product entity with regional factory assignments.
 */
@Entity("saddles")
@Index("idx_saddles_brand", ["brand"])
@Index("idx_saddles_model_name", ["modelName"])
@Index("idx_saddles_type", ["type"])
@Index("idx_saddles_sequence", ["sequence"])
@Index("idx_saddles_active", ["active"])
export class SaddleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Regional factory assignments
  @Column({ name: "factory_eu", type: "integer", nullable: false })
  factoryEu: number;

  @Column({ name: "factory_gb", type: "integer", nullable: false })
  factoryGb: number;

  @Column({ name: "factory_us", type: "integer", nullable: false })
  factoryUs: number;

  @Column({ name: "factory_ca", type: "integer", nullable: false })
  factoryCa: number;

  @Column({ name: "factory_aud", type: "integer", nullable: true })
  factoryAud?: number;

  @Column({ name: "factory_de", type: "integer", nullable: true })
  factoryDe?: number;

  @Column({ name: "factory_nl", type: "integer", nullable: true })
  factoryNl?: number;

  @Column({ name: "brand", type: "varchar", length: 300, nullable: false })
  brand: string;

  @Column({ name: "model_name", type: "varchar", length: 255, nullable: false })
  modelName: string;

  @Column({ name: "presets", type: "text", nullable: false })
  presets: string;

  @Column({ name: "active", type: "smallint", default: 1 })
  active: number;

  @Column({ name: "type", type: "smallint", default: 0 })
  type: number;

  @Column({ name: "deleted", type: "integer", default: 0 })
  deleted: number;

  @Column({ name: "sequence", type: "integer", nullable: false })
  sequence: number;

  // Computed properties
  get isActive(): boolean {
    return this.deleted === 0 && this.active === 1;
  }

  get displayName(): string {
    return `${this.brand} - ${this.modelName}`;
  }

  /**
   * Get factory ID for a specific region
   */
  getFactoryForRegion(region: string): number | undefined {
    const regionMap: Record<string, number | undefined> = {
      eu: this.factoryEu,
      gb: this.factoryGb,
      us: this.factoryUs,
      ca: this.factoryCa,
      aud: this.factoryAud,
      de: this.factoryDe,
      nl: this.factoryNl,
    };
    return regionMap[region.toLowerCase()];
  }

  /**
   * Get all factory assignments
   */
  getAllFactories(): Record<string, number | undefined> {
    return {
      eu: this.factoryEu,
      gb: this.factoryGb,
      us: this.factoryUs,
      ca: this.factoryCa,
      aud: this.factoryAud,
      de: this.factoryDe,
      nl: this.factoryNl,
    };
  }

  /**
   * Parse presets string to array
   */
  getPresetsArray(): number[] {
    if (!this.presets) return [];
    return this.presets
      .split(",")
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n));
  }

  constructor() {
    this.deleted = 0;
    this.active = 1;
    this.type = 0;
    this.sequence = 0;
    this.presets = "";
  }
}

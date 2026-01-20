import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";
import { BrandEntity } from "../../../../../brands/infrastructure/persistence/relational/entities/brand.entity";

@Entity("models")
@Index("model_name_brand_index", ["name", "brandId"])
@Index("model_brand_index", ["brandId"])
export class ModelEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "brand_id", type: "integer", nullable: false })
  brandId: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  // Relations
  @ManyToOne(() => BrandEntity, { lazy: true })
  @JoinColumn({ name: "brand_id", referencedColumnName: "id" })
  brand?: BrandEntity;

  /**
   * Find by UUID
   */
  static createFindOptions(id: string): any {
    return { id };
  }
}

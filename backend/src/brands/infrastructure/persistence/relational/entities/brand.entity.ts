import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("brands")
@Index("idx_brands_name", ["name"])
export class BrandEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "varchar", length: 200, nullable: false })
  name: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  /**
   * Find options for the brand
   */
  static createFindOptions(id: number): any {
    return { id };
  }
}

import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("brands")
@Index("idx_brands_name", ["name"])
export class BrandEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "brand_name", type: "varchar", length: 200, nullable: false })
  name: string;

  /**
   * Find options for the brand
   */
  static createFindOptions(id: number): any {
    return { id };
  }
}

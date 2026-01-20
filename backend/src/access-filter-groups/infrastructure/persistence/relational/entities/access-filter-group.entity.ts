import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("access_filter_group")
@Index("access_filter_group_name_index", ["name"])
@Index("access_filter_group_is_active_index", ["isActive"])
export class AccessFilterGroupEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "description", type: "text", nullable: true })
  description: string | null;

  @Column({
    name: "filters",
    type: "json",
    nullable: true,
    comment: "JSON object containing filter configuration",
  })
  filters: Record<string, any> | null;

  @Column({
    name: "user_ids",
    type: "json",
    nullable: true,
    comment: "Array of user IDs associated with this filter group",
  })
  userIds: number[] | null;

  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;

  @Column({ name: "created_by", type: "integer", nullable: true })
  createdBy: number | null;

  @Column({ name: "updated_by", type: "integer", nullable: true })
  updatedBy: number | null;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  // Helper methods
  get hasUsers(): boolean {
    return this.userIds !== null && this.userIds.length > 0;
  }

  get userCount(): number {
    return this.userIds?.length || 0;
  }

  get hasFilters(): boolean {
    return this.filters !== null && Object.keys(this.filters).length > 0;
  }

  get effectivelyDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  constructor() {
    this.description = null;
    this.filters = null;
    this.userIds = null;
    this.isActive = true;
    this.createdBy = null;
    this.updatedBy = null;
    this.deletedAt = null;
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "../../../../../users/infrastructure/persistence/relational/entities/user.entity";

/**
 * DatabaseQueryLog TypeORM Entity
 *
 * Stores database query logs for debugging and performance analysis.
 * Designed to handle 74K+ production database query records.
 *
 * Performance optimizations:
 * - Indexes on common query patterns
 * - Text fields for large query and backtrace data
 * - Lazy loading for user relationship
 */
@Entity("db_query_log")
@Index(["userId", "timestamp"]) // User-specific query analysis
@Index(["timestamp"]) // Time-based query patterns
@Index(["page"]) // Page-specific performance analysis
export class DatabaseQueryLogEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  /**
   * SQL query that was executed
   * Can contain very long queries, hence using text type
   */
  @Column({ type: "text" })
  query: string;

  /**
   * User who triggered the query
   */
  @Column({ name: "user_id", type: "integer" })
  userId: number;

  /**
   * When the query was executed (preserved from legacy system)
   */
  @Column({ name: "timestamp", type: "timestamp" })
  timestamp: Date;

  /**
   * Page/endpoint that triggered the query
   * Useful for identifying performance bottlenecks by page
   */
  @Column({ type: "text" })
  page: string;

  /**
   * Stack trace/backtrace information
   * Helps identify exactly where the query originated in the code
   */
  @Column({ type: "text" })
  backtrace: string;

  /**
   * When this record was created in the new system
   */
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Relationships

  /**
   * User who triggered the query
   * Lazy loaded for performance
   */
  @ManyToOne(() => UserEntity, { lazy: true })
  @JoinColumn({ name: "user_id" })
  user: Promise<UserEntity>;

  constructor() {
    this.query = "";
    this.timestamp = new Date();
    this.page = "";
    this.backtrace = "";
  }
}

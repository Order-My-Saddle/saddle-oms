import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreateCommentTable Migration
 *
 * Creates the comment table for order communications and notes.
 * Supports order comments, internal notes, and customer communications.
 *
 * Adapted from archived migration to use INTEGER IDs matching current schema.
 *
 * Comment Types:
 * - general: General order notes
 * - production: Factory production notes
 * - customer: Customer communications
 * - internal: Internal staff only
 * - status_change: Status transition notes
 */
export class CreateCommentTable1737100000000 implements MigrationInterface {
  name = 'CreateCommentTable1737100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. CREATE COMMENT TABLE
    // ========================================
    // Using INTEGER IDs to match current schema (orders, credentials)

    await queryRunner.query(`
      CREATE TABLE "comment" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL,
        "user_id" INTEGER,
        "content" TEXT NOT NULL,
        "type" VARCHAR(50) NOT NULL DEFAULT 'general',
        "is_internal" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMP
      )
    `);

    // ========================================
    // 2. CREATE INDEXES (7 total)
    // ========================================

    // Primary lookup indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_comment_order_id" ON "comment" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_user_id" ON "comment" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_type" ON "comment" ("type")
    `);

    // Composite indexes for common query patterns
    await queryRunner.query(`
      CREATE INDEX "IDX_comment_order_created" ON "comment" ("order_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_order_internal" ON "comment" ("order_id", "is_internal")
    `);

    // Timestamp indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_comment_created_at" ON "comment" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comment_deleted_at" ON "comment" ("deleted_at")
    `);

    // ========================================
    // 3. ADD FOREIGN KEY CONSTRAINTS
    // ========================================

    // FK to orders table (CASCADE delete - comments removed with order)
    await queryRunner.query(`
      ALTER TABLE "comment" ADD CONSTRAINT "FK_comment_order_id"
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
    `);

    // FK to credentials table (SET NULL - preserve comments if user deleted)
    await queryRunner.query(`
      ALTER TABLE "comment" ADD CONSTRAINT "FK_comment_user_id"
      FOREIGN KEY ("user_id") REFERENCES "credentials"("user_id") ON DELETE SET NULL
    `);

    // ========================================
    // 4. ADD TABLE COMMENTS (Documentation)
    // ========================================

    await queryRunner.query(`
      COMMENT ON TABLE "comment" IS 'Stores comments and notes for orders, supporting both internal and customer-facing communications'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "comment"."type" IS 'Comment category: general, production, customer, internal, status_change'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "comment"."is_internal" IS 'Whether this comment is visible only to internal staff'
    `);

    console.log('✅ Comment table created with 7 indexes and FK constraints');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. DROP FOREIGN KEY CONSTRAINTS
    // ========================================

    await queryRunner.query(`
      ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "FK_comment_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "FK_comment_order_id"
    `);

    // ========================================
    // 2. DROP INDEXES
    // ========================================

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_order_internal"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_order_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_order_id"`);

    // ========================================
    // 3. DROP TABLE
    // ========================================

    await queryRunner.query(`DROP TABLE IF EXISTS "comment"`);

    console.log('✅ Comment table removed');
  }
}

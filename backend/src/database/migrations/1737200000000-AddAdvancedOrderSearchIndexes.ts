import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddAdvancedOrderSearchIndexes Migration
 *
 * Adds 11 performance indexes to the orders table for backend search optimization.
 * These indexes support the OrderSearchService for <100ms query response at scale.
 *
 * NOTE: This migration only creates INDEXES. The columns (seat_sizes, customer_name,
 * saddle_id) already exist in the InitialSchema migration.
 *
 * Index Types:
 * - GIN indexes: Full-text search (customer_name) and JSONB containment (seat_sizes)
 * - Partial indexes: Optimized for common WHERE conditions
 * - Composite indexes: Multi-column indexes for common query patterns
 *
 * Based on: ARCHIVE/database/migrations/1735977000000-AddAdvancedOrderSearchFields.ts
 */
export class AddAdvancedOrderSearchIndexes1737200000000 implements MigrationInterface {
  name = 'AddAdvancedOrderSearchIndexes1737200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // HELPER: Check if column exists
    // ========================================
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT 1 FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
      return result.length > 0;
    };

    // ========================================
    // 1. GIN INDEXES FOR ADVANCED SEARCH (conditional)
    // ========================================

    // GIN index for full-text search on customer name
    // Note: Orders table may have 'name' or 'customer_name' depending on schema version
    if (await columnExists('orders', 'customer_name')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_orders_customer_name_gin"
        ON "orders" USING gin (to_tsvector('english', COALESCE(customer_name, '')))
      `);
    } else if (await columnExists('orders', 'name')) {
      // Fallback to 'name' column if 'customer_name' doesn't exist
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_orders_name_gin"
        ON "orders" USING gin (to_tsvector('english', COALESCE(name, '')))
      `);
    }

    // GIN index for JSONB containment queries on seat_sizes (if column exists)
    if (await columnExists('orders', 'seat_sizes')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_orders_seat_sizes_gin"
        ON "orders" USING gin (seat_sizes)
      `);
    }

    // ========================================
    // 2. PARTIAL INDEXES FOR COMMON FILTERS
    // ========================================

    // Partial index for urgent/rushed orders
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_urgency"
      ON "orders" (rushed) WHERE rushed = 1
    `);

    // Partial index for saddle ID lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_saddle_id_partial"
      ON "orders" (saddle_id) WHERE saddle_id IS NOT NULL
    `);

    // ========================================
    // 3. COMPOSITE INDEXES FOR QUERY PATTERNS
    // ========================================

    // Fitter + date composite (common dashboard query)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_fitter_date"
      ON "orders" (fitter_id, order_time DESC)
    `);

    // Factory + date composite (factory dashboard)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_factory_date"
      ON "orders" (factory_id, order_time DESC)
    `);

    // Status + urgency + date composite (priority queue)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_status_urgency"
      ON "orders" (order_status, rushed, order_time DESC)
    `);

    // Customer + date composite (customer order history)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_customer_date"
      ON "orders" (customer_id, order_time DESC)
    `);

    // ========================================
    // 4. B-TREE INDEX FOR CUSTOMER NAME SEARCH (conditional)
    // ========================================

    if (await columnExists('orders', 'customer_name')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_orders_customer_name"
        ON "orders" (customer_name)
      `);
    } else if (await columnExists('orders', 'name')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "idx_orders_name"
        ON "orders" (name)
      `);
    }

    // ========================================
    // 5. SADDLE + DATE COMPOSITE
    // ========================================

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_saddle_date"
      ON "orders" (saddle_id, order_time DESC)
    `);

    console.log('✅ Added performance indexes to orders table for backend search');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // DROP ALL INDEXES IN REVERSE ORDER
    // Note: Using IF EXISTS to handle conditional index creation
    // ========================================

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_saddle_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_customer_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_customer_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_status_urgency"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_factory_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_fitter_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_saddle_id_partial"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_urgency"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_seat_sizes_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_customer_name_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_name_gin"`);

    console.log('✅ Removed performance indexes from orders table');
  }
}

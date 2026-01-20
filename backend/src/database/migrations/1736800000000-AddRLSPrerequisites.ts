import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddRLSPrerequisites Migration
 *
 * Prepares the schema for Row Level Security by:
 * 1. Creating a "user" view that aliases the credentials table
 * 2. Adding audit columns (created_by, updated_by, deleted_at, created_at, updated_at)
 *    to business entity tables
 *
 * This migration must run BEFORE EnableRowLevelSecurity migration.
 */
export class AddRLSPrerequisites1736800000000 implements MigrationInterface {
  name = 'AddRLSPrerequisites1736800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. CREATE USER VIEW (alias for credentials table)
    // ========================================
    // This allows RLS policies to reference "user" table
    // while the actual data lives in credentials table

    // Create user view with column aliases matching UserEntity
    // Uses uuid_generate_v5 for deterministic UUID from user_id
    await queryRunner.query(`
      CREATE VIEW "user" AS
      SELECT
        uuid_generate_v5(uuid_ns_oid(), user_id::text) AS id,
        last_login,
        user_name AS username,
        password_hash AS password,
        password_reset_hash AS reset_token,
        password_reset_valid_to AS reset_token_expires_at,
        (blocked = 0) AS enabled,
        NULL::varchar AS email,
        NULL::varchar AS address,
        NULL::varchar AS city,
        NULL::varchar AS zipcode,
        NULL::varchar AS state,
        NULL::varchar AS cell_no,
        NULL::varchar AS phone_no,
        NULL::varchar AS country,
        'USD'::varchar AS currency,
        full_name AS name,
        CURRENT_TIMESTAMP AS created_at,
        CURRENT_TIMESTAMP AS updated_at,
        CASE WHEN deleted = 1 THEN CURRENT_TIMESTAMP ELSE NULL END AS deleted_at
      FROM credentials
    `);

    // ========================================
    // 2. ADD AUDIT COLUMNS TO CUSTOMERS TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 3. ADD AUDIT COLUMNS TO ORDERS TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 4. ADD AUDIT COLUMNS TO FITTERS TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE fitters ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE fitters ADD COLUMN IF NOT EXISTS updated_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE fitters ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE fitters ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE fitters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 5. ADD AUDIT COLUMNS TO FACTORIES TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE factories ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE factories ADD COLUMN IF NOT EXISTS updated_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE factories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE factories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE factories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 6. ADD AUDIT COLUMNS TO FACTORY_EMPLOYEES TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE factory_employees ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE factory_employees ADD COLUMN IF NOT EXISTS updated_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE factory_employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE factory_employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE factory_employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 7. ADD AUDIT COLUMNS TO LOG TABLE
    // ========================================

    await queryRunner.query(`
      ALTER TABLE log ADD COLUMN IF NOT EXISTS created_by INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE log ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE log ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // ========================================
    // 8. CREATE INDEXES FOR AUDIT COLUMNS
    // ========================================

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers (created_by) WHERE created_by IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers (deleted_at) WHERE deleted_at IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders (created_by) WHERE created_by IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders (deleted_at) WHERE deleted_at IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_fitters_deleted_at ON fitters (deleted_at) WHERE deleted_at IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_factories_deleted_at ON factories (deleted_at) WHERE deleted_at IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_factory_employees_deleted_at ON factory_employees (deleted_at) WHERE deleted_at IS NOT NULL
    `);

    console.log('✅ RLS prerequisites added: user view and audit columns created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. DROP INDEXES
    // ========================================

    await queryRunner.query(`DROP INDEX IF EXISTS idx_factory_employees_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_factories_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_fitters_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_created_by`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_created_by`);

    // ========================================
    // 2. DROP AUDIT COLUMNS FROM LOG TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE log DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE log DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE log DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 3. DROP AUDIT COLUMNS FROM FACTORY_EMPLOYEES TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE factory_employees DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE factory_employees DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE factory_employees DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE factory_employees DROP COLUMN IF EXISTS updated_by`);
    await queryRunner.query(`ALTER TABLE factory_employees DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 4. DROP AUDIT COLUMNS FROM FACTORIES TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE factories DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE factories DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE factories DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE factories DROP COLUMN IF EXISTS updated_by`);
    await queryRunner.query(`ALTER TABLE factories DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 5. DROP AUDIT COLUMNS FROM FITTERS TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE fitters DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE fitters DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE fitters DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE fitters DROP COLUMN IF EXISTS updated_by`);
    await queryRunner.query(`ALTER TABLE fitters DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 6. DROP AUDIT COLUMNS FROM ORDERS TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS updated_by`);
    await queryRunner.query(`ALTER TABLE orders DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 7. DROP AUDIT COLUMNS FROM CUSTOMERS TABLE
    // ========================================

    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS updated_at`);
    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS created_at`);
    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS updated_by`);
    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS created_by`);

    // ========================================
    // 8. DROP USER VIEW
    // ========================================

    await queryRunner.query(`DROP VIEW IF EXISTS "user"`);

    console.log('✅ RLS prerequisites removed: user view and audit columns dropped');
  }
}

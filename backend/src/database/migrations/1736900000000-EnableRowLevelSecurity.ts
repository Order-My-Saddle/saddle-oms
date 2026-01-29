import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * EnableRowLevelSecurity Migration
 *
 * Implements comprehensive Row Level Security (RLS) for multi-tenant data isolation.
 *
 * Role System (matches RoleEnum - aligned with production user_types):
 * - fitter (1): Own customers and orders only
 * - admin (2): Full access to business entities
 * - factory (3): Own data and assigned orders only
 * - customsaddler (4): Similar to user
 * - supervisor (5): Full access to all data (super admin)
 * - user (6): Own data only
 *
 * Tables with RLS:
 * - user (view aliasing credentials)
 * - customers
 * - orders
 * - fitters
 * - factories
 * - factory_employees
 * - log
 *
 * This migration requires AddRLSPrerequisites to run first.
 */
export class EnableRowLevelSecurity1736900000000 implements MigrationInterface {
  name = "EnableRowLevelSecurity1736900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===============================
    // 1. CREATE HELPER FUNCTIONS
    // ===============================

    // Helper function to get current user ID (INTEGER)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION current_user_id()
      RETURNS INTEGER AS $$
      BEGIN
        RETURN COALESCE(
          current_setting('rls.user_id', true)::INTEGER,
          0
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN 0;
      END;
      $$ LANGUAGE plpgsql STABLE SECURITY DEFINER
    `);

    // Helper function to get current user role
    // (1=fitter, 2=admin, 3=factory, 4=customsaddler, 5=supervisor, 6=user)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION current_user_role()
      RETURNS INTEGER AS $$
      BEGIN
        RETURN COALESCE(
          current_setting('rls.user_role', true)::INTEGER,
          2 -- Default to 'user' role
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN 2;
      END;
      $$ LANGUAGE plpgsql STABLE SECURITY DEFINER
    `);

    // Helper function to get current user's factory ID
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION current_user_factory_id()
      RETURNS INTEGER AS $$
      DECLARE
        v_factory_id INTEGER;
      BEGIN
        -- Try session variable first
        BEGIN
          v_factory_id := current_setting('rls.factory_id', true)::INTEGER;
          IF v_factory_id IS NOT NULL AND v_factory_id > 0 THEN
            RETURN v_factory_id;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Continue to database lookup
        END;

        -- Fallback: lookup from factories table
        SELECT f.id INTO v_factory_id
        FROM factories f
        WHERE f.user_id = current_user_id()
        AND f.deleted = 0;

        RETURN v_factory_id;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql STABLE SECURITY DEFINER
    `);

    // Helper function to get current user's fitter ID
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION current_user_fitter_id()
      RETURNS INTEGER AS $$
      DECLARE
        v_fitter_id INTEGER;
      BEGIN
        -- Try session variable first
        BEGIN
          v_fitter_id := current_setting('rls.fitter_id', true)::INTEGER;
          IF v_fitter_id IS NOT NULL AND v_fitter_id > 0 THEN
            RETURN v_fitter_id;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- Continue to database lookup
        END;

        -- Fallback: lookup from fitters table
        SELECT f.id INTO v_fitter_id
        FROM fitters f
        WHERE f.user_id = current_user_id()
        AND f.deleted = 0;

        RETURN v_fitter_id;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql STABLE SECURITY DEFINER
    `);

    // ===============================
    // 2. ENABLE RLS ON TABLES
    // ===============================

    // Note: "user" is a view, so we enable RLS on the underlying credentials table
    await queryRunner.query(
      `ALTER TABLE credentials ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`ALTER TABLE customers ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE fitters ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE factories ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `ALTER TABLE factory_employees ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`ALTER TABLE log ENABLE ROW LEVEL SECURITY`);

    // ===============================
    // 3. SUPERVISOR POLICIES (Role 5) - Full Access
    // ===============================

    await queryRunner.query(`
      CREATE POLICY supervisor_all_credentials ON credentials
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_customers ON customers
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_orders ON orders
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_fitters ON fitters
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_factories ON factories
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_factory_employees ON factory_employees
      FOR ALL
      USING (current_user_role() = 5)
    `);

    await queryRunner.query(`
      CREATE POLICY supervisor_all_logs ON log
      FOR ALL
      USING (current_user_role() = 5)
    `);

    // ===============================
    // 4. ADMIN POLICIES (Role 2) - Business Entities
    // ===============================

    await queryRunner.query(`
      CREATE POLICY admin_business_customers ON customers
      FOR ALL
      USING (current_user_role() = 2)
    `);

    await queryRunner.query(`
      CREATE POLICY admin_business_orders ON orders
      FOR ALL
      USING (current_user_role() = 2)
    `);

    await queryRunner.query(`
      CREATE POLICY admin_business_fitters ON fitters
      FOR ALL
      USING (current_user_role() = 2)
    `);

    await queryRunner.query(`
      CREATE POLICY admin_business_factories ON factories
      FOR ALL
      USING (current_user_role() = 2)
    `);

    await queryRunner.query(`
      CREATE POLICY admin_business_factory_employees ON factory_employees
      FOR ALL
      USING (current_user_role() = 2)
    `);

    await queryRunner.query(`
      CREATE POLICY admin_view_logs ON log
      FOR SELECT
      USING (current_user_role() = 2)
    `);

    // ===============================
    // 5. FITTER POLICIES (Role 1) - Own Customers/Orders
    // ===============================

    await queryRunner.query(`
      CREATE POLICY fitter_own_customers ON customers
      FOR ALL
      USING (
        current_user_role() = 1
        AND fitter_id = current_user_fitter_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY fitter_own_orders ON orders
      FOR ALL
      USING (
        current_user_role() = 1
        AND fitter_id = current_user_fitter_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY fitter_own_profile ON fitters
      FOR ALL
      USING (
        current_user_role() = 1
        AND id = current_user_fitter_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY fitter_own_credentials ON credentials
      FOR ALL
      USING (
        current_user_role() = 1
        AND user_id = current_user_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY fitter_view_own_logs ON log
      FOR SELECT
      USING (
        current_user_role() = 1
        AND user_id = current_user_id()
      )
    `);

    // ===============================
    // 6. FACTORY POLICIES (Role 3) - Own Data/Orders
    // ===============================

    await queryRunner.query(`
      CREATE POLICY factory_own_data ON factories
      FOR ALL
      USING (
        current_user_role() = 3
        AND id = current_user_factory_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY factory_own_employees ON factory_employees
      FOR ALL
      USING (
        current_user_role() = 3
        AND factory_id = current_user_factory_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY factory_own_orders ON orders
      FOR ALL
      USING (
        current_user_role() = 3
        AND factory_id = current_user_factory_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY factory_own_credentials ON credentials
      FOR ALL
      USING (
        current_user_role() = 3
        AND user_id = current_user_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY factory_view_own_logs ON log
      FOR SELECT
      USING (
        current_user_role() = 3
        AND user_id = current_user_id()
      )
    `);

    // ===============================
    // 7. USER POLICIES (Role 6) - Own Data Only
    // ===============================

    await queryRunner.query(`
      CREATE POLICY user_own_credentials ON credentials
      FOR ALL
      USING (
        current_user_role() = 6
        AND user_id = current_user_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY user_own_customers ON customers
      FOR ALL
      USING (
        current_user_role() = 6
        AND created_by = current_user_id()
      )
    `);

    await queryRunner.query(`
      CREATE POLICY user_view_own_logs ON log
      FOR SELECT
      USING (
        current_user_role() = 6
        AND user_id = current_user_id()
      )
    `);

    // ===============================
    // 8. SYSTEM BYPASS POLICIES (No User Context)
    // Allows seeds, migrations, and system operations to work
    // ===============================

    await queryRunner.query(`
      CREATE POLICY system_bypass_credentials ON credentials
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_customers ON customers
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_orders ON orders
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_fitters ON fitters
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_factories ON factories
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_factory_employees ON factory_employees
      FOR ALL
      USING (current_user_id() = 0)
    `);

    await queryRunner.query(`
      CREATE POLICY system_bypass_logs ON log
      FOR ALL
      USING (current_user_id() = 0)
    `);

    // ===============================
    // 9. PERFORMANCE INDEXES FOR RLS
    // Note: Using DO block to conditionally create indexes only if columns exist
    // ===============================

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_fitter_rls
      ON customers (fitter_id)
      WHERE fitter_id IS NOT NULL AND fitter_id > 0
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_created_by_rls
      ON customers (created_by)
      WHERE created_by IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_fitter_rls
      ON orders (fitter_id)
      WHERE fitter_id IS NOT NULL AND fitter_id > 0
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_factory_rls
      ON orders (factory_id)
      WHERE factory_id IS NOT NULL AND factory_id > 0
    `);

    // Create indexes conditionally only if columns exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'fitters' AND column_name = 'user_id'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_fitters_user_rls ON fitters (user_id);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'factories' AND column_name = 'user_id'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_factories_user_rls ON factories (user_id);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_factory_employees_factory_rls
      ON factory_employees (factory_id)
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'log' AND column_name = 'user_id'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_log_user_rls ON log (user_id);
        END IF;
      END $$;
    `);

    // ===============================
    // 10. GRANT PERMISSIONS ON HELPER FUNCTIONS
    // ===============================

    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION current_user_id() TO PUBLIC`,
    );
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION current_user_role() TO PUBLIC`,
    );
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION current_user_factory_id() TO PUBLIC`,
    );
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION current_user_fitter_id() TO PUBLIC`,
    );

    console.log("✅ Row Level Security enabled with comprehensive policies");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ===============================
    // 1. DROP PERFORMANCE INDEXES (IF EXISTS handles missing indexes gracefully)
    // ===============================

    await queryRunner.query(`DROP INDEX IF EXISTS idx_log_user_rls`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_factory_employees_factory_rls`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_factories_user_rls`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_fitters_user_rls`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_factory_rls`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_fitter_rls`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_customers_created_by_rls`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_fitter_rls`);

    // ===============================
    // 2. DROP SYSTEM BYPASS POLICIES
    // ===============================

    await queryRunner.query(`DROP POLICY IF EXISTS system_bypass_logs ON log`);
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_factory_employees ON factory_employees`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_factories ON factories`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_fitters ON fitters`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_orders ON orders`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_customers ON customers`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS system_bypass_credentials ON credentials`,
    );

    // ===============================
    // 3. DROP USER POLICIES (Role 2)
    // ===============================

    await queryRunner.query(`DROP POLICY IF EXISTS user_view_own_logs ON log`);
    await queryRunner.query(
      `DROP POLICY IF EXISTS user_own_customers ON customers`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS user_own_credentials ON credentials`,
    );

    // ===============================
    // 4. DROP FACTORY POLICIES (Role 4)
    // ===============================

    await queryRunner.query(
      `DROP POLICY IF EXISTS factory_view_own_logs ON log`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS factory_own_credentials ON credentials`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS factory_own_orders ON orders`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS factory_own_employees ON factory_employees`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS factory_own_data ON factories`,
    );

    // ===============================
    // 5. DROP FITTER POLICIES (Role 3)
    // ===============================

    await queryRunner.query(
      `DROP POLICY IF EXISTS fitter_view_own_logs ON log`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS fitter_own_credentials ON credentials`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS fitter_own_profile ON fitters`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS fitter_own_orders ON orders`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS fitter_own_customers ON customers`,
    );

    // ===============================
    // 6. DROP ADMIN POLICIES (Role 1)
    // ===============================

    await queryRunner.query(`DROP POLICY IF EXISTS admin_view_logs ON log`);
    await queryRunner.query(
      `DROP POLICY IF EXISTS admin_business_factory_employees ON factory_employees`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS admin_business_factories ON factories`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS admin_business_fitters ON fitters`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS admin_business_orders ON orders`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS admin_business_customers ON customers`,
    );

    // ===============================
    // 7. DROP SUPERVISOR POLICIES (Role 5)
    // ===============================

    await queryRunner.query(`DROP POLICY IF EXISTS supervisor_all_logs ON log`);
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_factory_employees ON factory_employees`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_factories ON factories`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_fitters ON fitters`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_orders ON orders`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_customers ON customers`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS supervisor_all_credentials ON credentials`,
    );

    // ===============================
    // 8. DISABLE RLS ON TABLES
    // ===============================

    await queryRunner.query(`ALTER TABLE log DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `ALTER TABLE factory_employees DISABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`ALTER TABLE factories DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE fitters DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE orders DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE customers DISABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `ALTER TABLE credentials DISABLE ROW LEVEL SECURITY`,
    );

    // ===============================
    // 9. DROP HELPER FUNCTIONS
    // ===============================

    await queryRunner.query(`DROP FUNCTION IF EXISTS current_user_fitter_id()`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS current_user_factory_id()`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS current_user_role()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS current_user_id()`);

    console.log("✅ Row Level Security disabled and all policies removed");
  }
}

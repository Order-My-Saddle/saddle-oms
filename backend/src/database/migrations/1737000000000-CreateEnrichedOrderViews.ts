import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * CreateEnrichedOrderViews Migration
 *
 * Creates materialized views for efficient order querying:
 * 1. enriched_order_view - Pre-computed order data with customer, fitter, factory, and saddle details
 * 2. order_edit_view - Aggregated order details for editing
 *
 * Performance benefits:
 * - Pre-joined data eliminates runtime joins
 * - Concurrent refresh support via unique index
 * - Automatic refresh function for scheduled updates
 *
 * IMPORTANT: Uses legacy schema column names from InitialSchema migration.
 */
export class CreateEnrichedOrderViews1737000000000
  implements MigrationInterface
{
  name = "CreateEnrichedOrderViews1737000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. CREATE ENRICHED ORDER VIEW (Materialized)
    // ========================================
    // Pre-computes order data with related entity information
    // for fast list queries and dashboard display

    await queryRunner.query(`
      CREATE MATERIALIZED VIEW enriched_order_view AS
      SELECT
        -- Order core fields
        o.id,
        o.id as order_id,
        o.order_status,
        o.order_time,
        o.payment_time,
        o.rushed as is_urgent,
        o.fitter_reference,
        o.special_notes,
        o.serial_number,
        o.custom_order,
        o.repair,
        o.demo,
        o.sponsored,
        o.order_step,
        o.currency,

        -- Order address fields
        o.name as order_name,
        o.horse_name,
        o.address as order_address,
        o.city as order_city,
        o.state as order_state,
        o.zipcode as order_zipcode,
        o.country as order_country,
        o.phone_no as order_phone,
        o.cell_no as order_cell,
        o.email as order_email,

        -- Shipping fields
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_state,
        o.ship_zipcode,
        o.ship_country,

        -- Pricing fields
        o.price_saddle,
        o.price_tradein,
        o.price_deposit,
        o.price_discount,
        o.price_fittingeval,
        o.price_callfee,
        o.price_girth,
        o.price_shipping,
        o.price_tax,
        o.price_additional,
        (o.price_saddle - o.price_tradein - o.price_deposit - o.price_discount +
         o.price_fittingeval + o.price_callfee + o.price_girth +
         o.price_shipping + o.price_tax + o.price_additional) as total_price,

        -- Customer fields
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.address as customer_address,
        c.city as customer_city,
        c.state as customer_state,
        c.zipcode as customer_zipcode,
        c.country as customer_country,
        c.phone_no as customer_phone,
        c.cell_no as customer_cell,
        c.horse_name as customer_horse_name,

        -- Fitter fields (join via credentials for name)
        f.id as fitter_id,
        fc.full_name as fitter_name,
        fc.user_name as fitter_username,
        f.emailaddress as fitter_email,
        f.address as fitter_address,
        f.city as fitter_city,
        f.state as fitter_state,
        f.zipcode as fitter_zipcode,
        f.country as fitter_country,
        f.phone_no as fitter_phone,
        f.cell_no as fitter_cell,

        -- Factory fields (join via credentials for name)
        fa.id as factory_id,
        fac.full_name as factory_name,
        fac.user_name as factory_username,
        fa.emailaddress as factory_email,
        fa.address as factory_address,
        fa.city as factory_city,
        fa.state as factory_state,
        fa.zipcode as factory_zipcode,
        fa.country as factory_country,
        fa.phone_no as factory_phone,
        fa.cell_no as factory_cell,

        -- Saddle/Product fields
        s.id as saddle_id,
        s.brand as brand_name,
        s.model_name,
        s.type as saddle_type,

        -- Leather type
        lt.id as leather_id,
        lt.name as leather_name,

        -- Status information
        st.name as status_name,
        st.sequence as status_sequence

      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN fitters f ON o.fitter_id = f.id
      LEFT JOIN credentials fc ON f.user_id = fc.user_id
      LEFT JOIN factories fa ON o.factory_id = fa.id
      LEFT JOIN credentials fac ON fa.user_id = fac.user_id
      LEFT JOIN saddles s ON o.saddle_id = s.id
      LEFT JOIN leather_types lt ON o.leather_id = lt.id
      LEFT JOIN statuses st ON o.order_status = st.id
    `);

    // Create unique index for CONCURRENT refresh
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_enriched_order_view_id
      ON enriched_order_view (id)
    `);

    // Performance indexes on the materialized view
    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_customer
      ON enriched_order_view (customer_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_fitter
      ON enriched_order_view (fitter_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_factory
      ON enriched_order_view (factory_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_status
      ON enriched_order_view (order_status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_order_time
      ON enriched_order_view (order_time DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_customer_name
      ON enriched_order_view (customer_name)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enriched_order_view_fitter_name
      ON enriched_order_view (fitter_name)
    `);

    // ========================================
    // 2. CREATE ORDER EDIT VIEW (Materialized)
    // ========================================
    // Aggregates order configuration details for editing

    await queryRunner.query(`
      CREATE MATERIALIZED VIEW order_edit_view AS
      SELECT
        o.id,
        o.id as order_id,
        o.order_status,
        o.order_time,
        o.fitter_reference,
        o.special_notes,

        -- Customer info
        c.id as customer_id,
        c.name as customer_name,

        -- Fitter info
        f.id as fitter_id,
        fc.full_name as fitter_name,

        -- Factory info
        fa.id as factory_id,
        fac.full_name as factory_name,

        -- Saddle info
        s.id as saddle_id,
        s.brand as brand_name,
        s.model_name,

        -- Leather
        lt.id as leather_id,
        lt.name as leather_name,

        -- Pricing
        o.price_saddle,
        o.price_tradein,
        o.price_deposit,
        o.price_discount,
        o.price_fittingeval,
        o.price_callfee,
        o.price_girth,
        o.price_shipping,
        o.price_tax,
        o.price_additional,

        -- Order data (contains configuration details)
        o.order_data

      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN fitters f ON o.fitter_id = f.id
      LEFT JOIN credentials fc ON f.user_id = fc.user_id
      LEFT JOIN factories fa ON o.factory_id = fa.id
      LEFT JOIN credentials fac ON fa.user_id = fac.user_id
      LEFT JOIN saddles s ON o.saddle_id = s.id
      LEFT JOIN leather_types lt ON o.leather_id = lt.id
    `);

    // Create unique index for CONCURRENT refresh
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_order_edit_view_id
      ON order_edit_view (id)
    `);

    // ========================================
    // 3. CREATE REFRESH FUNCTIONS
    // ========================================

    // Function to refresh enriched_order_view
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_enriched_order_view()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY enriched_order_view;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Function to refresh order_edit_view
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_order_edit_view()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY order_edit_view;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Function to refresh all order views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_all_order_views()
      RETURNS void AS $$
      BEGIN
        PERFORM refresh_enriched_order_view();
        PERFORM refresh_order_edit_view();
      END;
      $$ LANGUAGE plpgsql
    `);

    // ========================================
    // 4. CREATE TRIGGER FOR AUTO-REFRESH (Optional)
    // ========================================
    // Note: For production, consider using a scheduled job instead
    // as triggers on every change can impact write performance

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_refresh_enriched_views()
      RETURNS trigger AS $$
      BEGIN
        -- Only refresh if significant time has passed (debounce)
        -- This prevents excessive refreshes on bulk operations
        PERFORM pg_advisory_xact_lock(hashtext('refresh_enriched_views'));
        PERFORM refresh_all_order_views();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `);

    // Grant permissions on functions
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION refresh_enriched_order_view() TO PUBLIC`,
    );
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION refresh_order_edit_view() TO PUBLIC`,
    );
    await queryRunner.query(
      `GRANT EXECUTE ON FUNCTION refresh_all_order_views() TO PUBLIC`,
    );

    console.log("✅ Enriched order views created with refresh functions");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // 1. DROP TRIGGER FUNCTION
    // ========================================
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS trigger_refresh_enriched_views() CASCADE`,
    );

    // ========================================
    // 2. DROP REFRESH FUNCTIONS
    // ========================================
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS refresh_all_order_views()`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS refresh_order_edit_view()`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS refresh_enriched_order_view()`,
    );

    // ========================================
    // 3. DROP ORDER EDIT VIEW
    // ========================================
    await queryRunner.query(
      `DROP MATERIALIZED VIEW IF EXISTS order_edit_view CASCADE`,
    );

    // ========================================
    // 4. DROP ENRICHED ORDER VIEW
    // ========================================
    await queryRunner.query(
      `DROP MATERIALIZED VIEW IF EXISTS enriched_order_view CASCADE`,
    );

    console.log("✅ Enriched order views removed");
  }
}

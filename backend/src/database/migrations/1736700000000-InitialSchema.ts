import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * Creates all tables from MySQL source with INTEGER primary keys.
 * Source: ordermys_new.sql
 *
 * Tables:
 * - Core Business: Orders, Customers, Fitters, Factories, FactoryEmployees
 * - Product Catalog: Brands, LeatherTypes, Options, OptionsItems, Presets, PresetsItems, Saddles
 * - System Admin: Credentials, UserTypes, Statuses, ClientConfirmation
 * - Relationships: SaddleLeathers, SaddleOptionsItems, OrdersInfo
 * - Audit: Log, DBlog
 */
export class InitialSchema1736700000000 implements MigrationInterface {
  name = 'InitialSchema1736700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // SYSTEM ADMIN TABLES (Create first - referenced by others)
    // ========================================

    // UserTypes - Role definitions
    await queryRunner.query(`
      CREATE TABLE "user_types" (
        "id" SERIAL PRIMARY KEY,
        "type_description" VARCHAR(100) NOT NULL
      )
    `);

    // Statuses - Order status definitions
    await queryRunner.query(`
      CREATE TABLE "statuses" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(30) NOT NULL UNIQUE,
        "factory_hidden" SMALLINT NOT NULL,
        "factory_alternative_name" VARCHAR(30) NOT NULL,
        "sequence" INTEGER NOT NULL
      )
    `);

    // ========================================
    // PRODUCT CATALOG TABLES
    // ========================================

    // Brands
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" SERIAL PRIMARY KEY,
        "brand_name" VARCHAR(200) NOT NULL
      )
    `);

    // LeatherTypes
    await queryRunner.query(`
      CREATE TABLE "leather_types" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(250) NOT NULL,
        "sequence" SMALLINT NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0
      )
    `);

    // Options - Product configuration categories
    await queryRunner.query(`
      CREATE TABLE "options" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(250) NOT NULL,
        "group" VARCHAR(255),
        "price1" INTEGER NOT NULL,
        "price2" INTEGER NOT NULL,
        "price3" INTEGER NOT NULL,
        "price_contrast1" INTEGER NOT NULL,
        "price_contrast2" INTEGER NOT NULL,
        "price_contrast3" INTEGER NOT NULL,
        "sequence" INTEGER NOT NULL,
        "type" SMALLINT NOT NULL,
        "extra_allowed" INTEGER NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "price4" INTEGER NOT NULL,
        "price5" INTEGER NOT NULL,
        "price6" INTEGER NOT NULL,
        "price7" INTEGER NOT NULL,
        "price_contrast4" SMALLINT NOT NULL,
        "price_contrast5" INTEGER NOT NULL,
        "price_contrast6" INTEGER NOT NULL,
        "price_contrast7" INTEGER NOT NULL
      )
    `);

    // OptionsItems - Specific choices within option categories
    await queryRunner.query(`
      CREATE TABLE "options_items" (
        "id" SERIAL PRIMARY KEY,
        "option_id" INTEGER NOT NULL,
        "leather_id" INTEGER NOT NULL DEFAULT 0,
        "name" VARCHAR(250) NOT NULL,
        "user_color" SMALLINT NOT NULL DEFAULT 0,
        "user_leather" SMALLINT NOT NULL DEFAULT 0,
        "price1" SMALLINT NOT NULL DEFAULT 0,
        "price2" SMALLINT NOT NULL DEFAULT 0,
        "price3" SMALLINT NOT NULL DEFAULT 0,
        "sequence" SMALLINT NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "restrict" TEXT,
        "price4" INTEGER NOT NULL DEFAULT 0,
        "price5" INTEGER NOT NULL,
        "price6" INTEGER NOT NULL,
        "price7" INTEGER NOT NULL
      )
    `);

    // Presets - Saved configurations
    await queryRunner.query(`
      CREATE TABLE "presets" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(250) NOT NULL,
        "sequence" INTEGER NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0
      )
    `);

    // PresetsItems - Links between presets and option items
    await queryRunner.query(`
      CREATE TABLE "presets_items" (
        "options_id" INTEGER NOT NULL,
        "item_id" INTEGER NOT NULL,
        "preset_id" INTEGER NOT NULL,
        UNIQUE ("options_id", "item_id", "preset_id")
      )
    `);

    // Saddles - Master product entity
    await queryRunner.query(`
      CREATE TABLE "saddles" (
        "id" SERIAL PRIMARY KEY,
        "factory_eu" INTEGER NOT NULL,
        "factory_gb" INTEGER NOT NULL,
        "factory_us" INTEGER NOT NULL,
        "brand" VARCHAR(300) NOT NULL,
        "model_name" VARCHAR(255) NOT NULL,
        "presets" TEXT NOT NULL,
        "active" SMALLINT NOT NULL DEFAULT 1,
        "type" SMALLINT NOT NULL DEFAULT 0,
        "deleted" INTEGER NOT NULL DEFAULT 0,
        "sequence" INTEGER NOT NULL,
        "factory_ca" INTEGER NOT NULL,
        "factory_aud" INTEGER,
        "factory_de" INTEGER,
        "factory_nl" INTEGER
      )
    `);

    // ========================================
    // CORE BUSINESS TABLES
    // ========================================

    // Factories - matches actual MySQL dump (ordermys_new.sql)
    await queryRunner.query(`
      CREATE TABLE "factories" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "address" VARCHAR(200) NOT NULL,
        "zipcode" VARCHAR(20) NOT NULL,
        "state" VARCHAR(200) NOT NULL,
        "city" VARCHAR(200) NOT NULL,
        "country" VARCHAR(255) NOT NULL,
        "phone_no" VARCHAR(11) NOT NULL,
        "cell_no" VARCHAR(11) NOT NULL,
        "currency" INTEGER NOT NULL DEFAULT 1,
        "emailaddress" VARCHAR(200) NOT NULL
      )
    `);

    // FactoryEmployees - matches actual MySQL dump (ordermys_new.sql)
    await queryRunner.query(`
      CREATE TABLE "factory_employees" (
        "id" SERIAL PRIMARY KEY,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "name" VARCHAR(255) NOT NULL,
        "factory_id" INTEGER NOT NULL
      )
    `);

    // Fitters - matches actual MySQL dump (ordermys_new.sql)
    await queryRunner.query(`
      CREATE TABLE "fitters" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "address" VARCHAR(200) NOT NULL,
        "zipcode" VARCHAR(20) NOT NULL,
        "state" VARCHAR(200) NOT NULL,
        "city" VARCHAR(200) NOT NULL,
        "country" VARCHAR(100) NOT NULL,
        "phone_no" VARCHAR(20) NOT NULL,
        "cell_no" VARCHAR(20) NOT NULL,
        "currency" INTEGER NOT NULL DEFAULT 1,
        "emailaddress" VARCHAR(200) NOT NULL
      )
    `);

    // Customers
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" SERIAL PRIMARY KEY,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "fitter_id" INTEGER NOT NULL DEFAULT 0,
        "horse_name" VARCHAR(255) NOT NULL DEFAULT '',
        "name" VARCHAR(255) NOT NULL DEFAULT '',
        "address" VARCHAR(255) NOT NULL DEFAULT '',
        "company" VARCHAR(255) NOT NULL DEFAULT '',
        "city" VARCHAR(255) NOT NULL DEFAULT '',
        "country" VARCHAR(255) NOT NULL DEFAULT '',
        "state" VARCHAR(255) NOT NULL DEFAULT '',
        "zipcode" VARCHAR(20) NOT NULL DEFAULT '',
        "email" VARCHAR(300) NOT NULL DEFAULT '',
        "phone_no" VARCHAR(20) NOT NULL DEFAULT '',
        "cell_no" VARCHAR(20) NOT NULL DEFAULT '',
        "bank_account_number" VARCHAR(20) NOT NULL DEFAULT ''
      )
    `);

    // Orders - matches actual MySQL dump (ordermys_new.sql)
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL PRIMARY KEY,
        "fitter_id" INTEGER NOT NULL,
        "saddle_id" INTEGER NOT NULL,
        "leather_id" INTEGER NOT NULL DEFAULT 0,
        "factory_id" INTEGER NOT NULL,
        "fitter_stock" SMALLINT NOT NULL DEFAULT 0,
        "customer_id" INTEGER NOT NULL DEFAULT 0,
        "shipped_by_employee" INTEGER NOT NULL DEFAULT 0,
        "fitter_reference" VARCHAR(255) NOT NULL DEFAULT '',
        "last_seen_fitter" INTEGER NOT NULL DEFAULT 0,
        "last_seen_cs" INTEGER NOT NULL DEFAULT 0,
        "last_seen_factory" INTEGER NOT NULL DEFAULT 0,
        "horse_name" VARCHAR(255) NOT NULL DEFAULT '',
        "name" VARCHAR(255) NOT NULL DEFAULT '',
        "address" VARCHAR(255) NOT NULL DEFAULT '',
        "zipcode" VARCHAR(20) NOT NULL DEFAULT '',
        "city" VARCHAR(255) NOT NULL DEFAULT '',
        "state" VARCHAR(255) NOT NULL DEFAULT '',
        "country" VARCHAR(255) NOT NULL DEFAULT '',
        "phone_no" VARCHAR(20) NOT NULL DEFAULT '',
        "cell_no" VARCHAR(20) NOT NULL DEFAULT '',
        "email" VARCHAR(300) NOT NULL DEFAULT '',
        "order_status" INTEGER NOT NULL DEFAULT 0,
        "ship_name" VARCHAR(255) NOT NULL DEFAULT '',
        "ship_address" VARCHAR(255) NOT NULL DEFAULT '',
        "ship_zipcode" VARCHAR(20) NOT NULL DEFAULT '',
        "ship_city" VARCHAR(255) NOT NULL DEFAULT '',
        "ship_state" VARCHAR(255) NOT NULL DEFAULT '',
        "ship_country" VARCHAR(255) NOT NULL DEFAULT '',
        "order_time" INTEGER NOT NULL,
        "payment" TEXT NOT NULL,
        "payment_time" INTEGER NOT NULL DEFAULT 0,
        "order_step" INTEGER NOT NULL DEFAULT 1,
        "price_saddle" INTEGER NOT NULL,
        "price_tradein" INTEGER NOT NULL,
        "price_deposit" INTEGER NOT NULL,
        "price_discount" INTEGER NOT NULL,
        "price_fittingeval" INTEGER NOT NULL,
        "price_callfee" INTEGER NOT NULL,
        "price_girth" INTEGER NOT NULL,
        "price_shipping" INTEGER NOT NULL,
        "price_tax" INTEGER NOT NULL,
        "price_additional" INTEGER NOT NULL DEFAULT 0,
        "special_notes" TEXT NOT NULL,
        "serial_number" VARCHAR(100) NOT NULL DEFAULT '',
        "custom_order" INTEGER NOT NULL DEFAULT 0,
        "changed" INTEGER NOT NULL DEFAULT 0,
        "repair" SMALLINT NOT NULL DEFAULT 0,
        "demo" SMALLINT NOT NULL DEFAULT 0,
        "sponsored" SMALLINT NOT NULL DEFAULT 0,
        "rushed" SMALLINT NOT NULL DEFAULT 0,
        "oms_version" INTEGER NOT NULL DEFAULT 1,
        "currency" INTEGER NOT NULL DEFAULT 0,
        "order_data" TEXT NOT NULL
      )
    `);

    // Credentials - User authentication
    await queryRunner.query(`
      CREATE TABLE "credentials" (
        "user_id" SERIAL PRIMARY KEY,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "user_type" INTEGER NOT NULL,
        "user_name" VARCHAR(100) NOT NULL UNIQUE,
        "full_name" VARCHAR(200) NOT NULL,
        "password_hash" VARCHAR(40) NOT NULL,
        "last_login" INTEGER NOT NULL,
        "blocked" INTEGER NOT NULL DEFAULT 0,
        "password_reset_hash" VARCHAR(40) NOT NULL,
        "password_reset_valid_to" INTEGER NOT NULL DEFAULT 0,
        "supervisor" SMALLINT NOT NULL DEFAULT 0
      )
    `);

    // ClientConfirmation
    await queryRunner.query(`
      CREATE TABLE "client_confirmation" (
        "id" SERIAL PRIMARY KEY,
        "uid" VARCHAR(255) NOT NULL UNIQUE,
        "customer_id" INTEGER NOT NULL,
        "order_id" INTEGER NOT NULL,
        "confirmed" SMALLINT NOT NULL DEFAULT 0,
        "send_time" INTEGER NOT NULL DEFAULT 0,
        "confirm_time" INTEGER NOT NULL DEFAULT 0,
        "sign" VARCHAR(255) NOT NULL DEFAULT ''
      )
    `);

    // ========================================
    // RELATIONSHIP TABLES
    // ========================================

    // SaddleLeathers - Links saddles with leather options
    await queryRunner.query(`
      CREATE TABLE "saddle_leathers" (
        "id" SERIAL PRIMARY KEY,
        "saddle_id" INTEGER NOT NULL,
        "leather_id" INTEGER NOT NULL,
        "price1" INTEGER NOT NULL,
        "price2" INTEGER NOT NULL,
        "price3" INTEGER NOT NULL,
        "sequence" SMALLINT NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0,
        "price4" INTEGER NOT NULL,
        "price5" INTEGER NOT NULL,
        "price6" INTEGER NOT NULL,
        "price7" INTEGER NOT NULL
      )
    `);

    // SaddleOptionsItems - Complex saddle configuration
    await queryRunner.query(`
      CREATE TABLE "saddle_options_items" (
        "id" SERIAL PRIMARY KEY,
        "saddle_id" INTEGER NOT NULL,
        "option_id" INTEGER NOT NULL,
        "option_item_id" INTEGER NOT NULL,
        "leather_id" INTEGER NOT NULL,
        "sequence" SMALLINT NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0
      )
    `);

    // OrdersInfo - Order configuration details
    await queryRunner.query(`
      CREATE TABLE "orders_info" (
        "order_id" INTEGER NOT NULL,
        "option_id" INTEGER NOT NULL DEFAULT 0,
        "option_item_id" INTEGER NOT NULL DEFAULT 0,
        "clone_number" INTEGER NOT NULL,
        "color" VARCHAR(200) NOT NULL,
        "leathertype" VARCHAR(200) NOT NULL,
        "custom" VARCHAR(200) NOT NULL,
        PRIMARY KEY ("order_id", "option_id", "option_item_id", "clone_number")
      )
    `);

    // ========================================
    // AUDIT TABLES (Optional - large data)
    // ========================================

    // Log - Application audit trail
    await queryRunner.query(`
      CREATE TABLE "log" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "user_type" INTEGER NOT NULL,
        "only_for" INTEGER NOT NULL DEFAULT 0,
        "order_id" INTEGER NOT NULL,
        "text" TEXT NOT NULL,
        "time" INTEGER NOT NULL,
        "order_status_updated_from" INTEGER,
        "order_status_updated_to" INTEGER
      )
    `);

    // DBlog - Database query logging
    await queryRunner.query(`
      CREATE TABLE "dblog" (
        "id" SERIAL PRIMARY KEY,
        "query" TEXT NOT NULL,
        "user" INTEGER NOT NULL,
        "timestamp" INTEGER NOT NULL,
        "page" TEXT NOT NULL,
        "backtrace" TEXT NOT NULL
      )
    `);

    // ========================================
    // INDEXES FOR PERFORMANCE
    // ========================================

    // Orders indexes
    await queryRunner.query(`
      CREATE INDEX "idx_orders_customer_id" ON "orders" ("customer_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_orders_fitter_id" ON "orders" ("fitter_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_orders_factory_id" ON "orders" ("factory_id")
      `);
    await queryRunner.query(`CREATE INDEX "idx_orders_saddle_id" ON "orders" ("saddle_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_order_status" ON "orders" ("order_status")`);

    // Customers indexes
    await queryRunner.query(`CREATE INDEX "idx_customers_fitter_id" ON "customers" ("fitter_id")`);

    // Fitters indexes
    await queryRunner.query(`CREATE INDEX "idx_fitters_user_id" ON "fitters" ("user_id")`);

    // Credentials indexes
    await queryRunner.query(`CREATE INDEX "idx_credentials_user_type" ON "credentials" ("user_type")`);

    // FactoryEmployees indexes
    await queryRunner.query(`CREATE INDEX "idx_factory_employees_factory_id" ON "factory_employees" ("factory_id")`);

    // OptionsItems indexes
    await queryRunner.query(`CREATE INDEX "idx_options_items_option_id" ON "options_items" ("option_id")`);

    // SaddleLeathers indexes
    await queryRunner.query(`CREATE INDEX "idx_saddle_leathers_saddle_id" ON "saddle_leathers" ("saddle_id")`);
    await queryRunner.query(`CREATE INDEX "idx_saddle_leathers_leather_id" ON "saddle_leathers" ("leather_id")`);

    // SaddleOptionsItems indexes
    await queryRunner.query(`CREATE INDEX "idx_saddle_options_items_saddle_id" ON "saddle_options_items" ("saddle_id")`);

    // Log indexes
    await queryRunner.query(`CREATE INDEX "idx_log_order_id" ON "log" ("order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_log_user_id" ON "log" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_log_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_log_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_saddle_options_items_saddle_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_saddle_leathers_leather_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_saddle_leathers_saddle_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_options_items_option_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_factory_employees_factory_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_credentials_user_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fitters_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_customers_fitter_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_order_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_saddle_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_factory_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_fitter_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_customer_id"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "dblog"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders_info"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saddle_options_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saddle_leathers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_confirmation"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credentials"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fitters"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "factory_employees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "factories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saddles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "presets_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "presets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "options_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "options"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leather_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "statuses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_types"`);
  }
}

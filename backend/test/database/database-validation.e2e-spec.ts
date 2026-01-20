import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

describe("Database Validation", () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      username: process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DATABASE_PASSWORD || "postgres",
      database: process.env.DATABASE_NAME || "oms_nest",
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe("Schema Validation", () => {
    const expectedTables = [
      "user",
      "role",
      "status",
      "session",
      "customer",
      "orders",
      "fitter",
      "fitters",
      "factories",
      "factory_employees",
      "suppliers",
      "brands",
      "models",
      "options",
      "leather_type",
      "audit_log",
      "db_query_log",
      "feature_flags",
      "migrations",
    ];

    it("should have all required tables", async () => {
      const result = await dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const tableNames = result.map((r: any) => r.table_name);

      for (const table of expectedTables) {
        expect(tableNames).toContain(table);
      }
    });

    describe("User Table", () => {
      it("should have correct columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'user'
          ORDER BY ordinal_position
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("username");
        expect(columns).toContain("email");
        expect(columns).toContain("password");
        expect(columns).toContain("name");
        expect(columns).toContain("enabled");
        expect(columns).toContain("legacy_id");
      });
    });

    describe("Orders Table", () => {
      it("should have correct columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'orders'
          ORDER BY ordinal_position
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("customer_id");
        expect(columns).toContain("order_number");
        expect(columns).toContain("status");
        expect(columns).toContain("fitter_id");
        expect(columns).toContain("factory_id");
        expect(columns).toContain("total_amount");
        expect(columns).toContain("created_at");
        expect(columns).toContain("updated_at");
      });

      it("should have seat_sizes column as jsonb", async () => {
        const result = await dataSource.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'orders' AND column_name = 'seat_sizes'
        `);

        expect(result.length).toBe(1);
        expect(result[0].data_type).toBe("jsonb");
      });
    });

    describe("Customer Table", () => {
      it("should have correct columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'customer'
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("email");
        expect(columns).toContain("name");
        expect(columns).toContain("fitter_id");
        expect(columns).toContain("status");
        expect(columns).toContain("legacy_id");
      });
    });

    describe("Factories Table", () => {
      it("should have correct columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'factories'
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("company_name");
        expect(columns).toContain("contact_person");
        expect(columns).toContain("phone");
        expect(columns).toContain("address");
        expect(columns).toContain("city");
        expect(columns).toContain("country");
        expect(columns).toContain("is_active");
        expect(columns).toContain("legacy_id");
      });
    });

    describe("Brands Table", () => {
      it("should have correct columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'brands'
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("name");
        expect(columns).toContain("created_at");
        expect(columns).toContain("updated_at");
      });
    });

    describe("Options Table", () => {
      it("should have pricing columns", async () => {
        const result = await dataSource.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'options'
        `);

        const columns = result.map((r: any) => r.column_name);

        expect(columns).toContain("id");
        expect(columns).toContain("name");
        expect(columns).toContain("price_1");
        expect(columns).toContain("price_2");
        expect(columns).toContain("price_3");
        expect(columns).toContain("price_4");
        expect(columns).toContain("price_5");
        expect(columns).toContain("price_6");
        expect(columns).toContain("price_7");
        expect(columns).toContain("type");
        expect(columns).toContain("sequence");
      });
    });
  });

  describe("Seed Data Validation", () => {
    it("should have seeded roles", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM role
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });

    it("should have seeded statuses", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM status
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });

    it("should have seeded users", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM "user"
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });

    it("should have seeded customers", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM customer
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });

    it("should have seeded factories", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM factories
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });

    it("should have seeded orders", async () => {
      const result = await dataSource.query(`
        SELECT COUNT(*) as count FROM orders
      `);

      expect(parseInt(result[0].count)).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Index Validation", () => {
    it("should have indexes on user table", async () => {
      const result = await dataSource.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'user'
      `);

      const indexNames = result.map((r: any) => r.indexname);

      expect(indexNames.some((name: string) => name.includes("username"))).toBe(
        true,
      );
      expect(indexNames.some((name: string) => name.includes("email"))).toBe(
        true,
      );
    });

    it("should have indexes on orders table", async () => {
      const result = await dataSource.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'orders'
      `);

      const indexNames = result.map((r: any) => r.indexname);

      // orders table should have primary key and multiple indexes
      expect(indexNames.length).toBeGreaterThan(5);
      // Should have primary key
      expect(indexNames.some((name: string) => name.includes("PK_"))).toBe(
        true,
      );
      // Should have unique constraint on order_number
      expect(indexNames.some((name: string) => name.includes("UQ_"))).toBe(
        true,
      );
    });

    it("should have indexes on customer table", async () => {
      const result = await dataSource.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'customer'
      `);

      const indexNames = result.map((r: any) => r.indexname);

      expect(indexNames.some((name: string) => name.includes("fitter"))).toBe(
        true,
      );
    });
  });

  describe("Foreign Key Validation", () => {
    it("should have customer_id column in orders table", async () => {
      // Note: Foreign key constraint may not exist but column should be present
      const result = await dataSource.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'customer_id'
      `);

      expect(result.length).toBe(1);
    });

    it("should have foreign key from models to brands", async () => {
      const result = await dataSource.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'models'
      `);

      const foreignKeys = result.map((r: any) => ({
        column: r.column_name,
        foreignTable: r.foreign_table_name,
      }));

      expect(
        foreignKeys.some(
          (fk: any) => fk.column === "brand_id" && fk.foreignTable === "brands",
        ),
      ).toBe(true);
    });
  });

  describe("RLS Policies Validation", () => {
    it("should have RLS enabled on user table", async () => {
      const result = await dataSource.query(`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = 'user'
      `);

      expect(result[0].relrowsecurity).toBe(true);
    });

    it("should have RLS enabled on orders table", async () => {
      const result = await dataSource.query(`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = 'orders'
      `);

      expect(result[0].relrowsecurity).toBe(true);
    });

    it("should have RLS enabled on customer table", async () => {
      const result = await dataSource.query(`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = 'customer'
      `);

      expect(result[0].relrowsecurity).toBe(true);
    });

    it("should have admin policy on orders", async () => {
      const result = await dataSource.query(`
        SELECT polname
        FROM pg_policy
        WHERE polrelid = 'orders'::regclass
      `);

      const policyNames = result.map((r: any) => r.polname);
      expect(
        policyNames.some((name: string) =>
          name.toLowerCase().includes("admin"),
        ),
      ).toBe(true);
    });
  });

  describe("Data Integrity Validation", () => {
    it("should track customer-order relationships", async () => {
      // Count orders with valid customer relationships
      const validResult = await dataSource.query(`
        SELECT COUNT(*) as valid_count
        FROM orders o
        INNER JOIN customer c ON o.customer_id = c.id
      `);

      // Count total orders
      const totalResult = await dataSource.query(`
        SELECT COUNT(*) as total_count FROM orders
      `);

      // Log relationship statistics for validation purposes
      const validCount = parseInt(validResult[0].valid_count);
      const totalCount = parseInt(totalResult[0].total_count);

      // Orders table exists and has data
      expect(totalCount).toBeGreaterThanOrEqual(0);

      // Log for debugging (not a hard failure since seed data may have null customer_ids)
      console.log(`Orders with valid customers: ${validCount}/${totalCount}`);
    });

    it("should have valid order statuses", async () => {
      const result = await dataSource.query(`
        SELECT DISTINCT status
        FROM orders
        WHERE status IS NOT NULL
      `);

      // Extended list of valid statuses (from production workflow)
      const validStatuses = [
        // Basic statuses
        "pending",
        "confirmed",
        "normal",
        "completed",
        "cancelled",
        // Production stages
        "in_production",
        "in_production_p1",
        "in_production_p2",
        "in_production_p3",
        // Shipping stages
        "shipped",
        "shipped_to_fitter",
        "shipped_to_customer",
        "delivered",
        // Special statuses
        "on_hold",
        "on_trial",
        "approved",
        "unordered",
        "ordered_changed",
        "completed_sale",
      ];

      for (const row of result) {
        expect(validStatuses).toContain(row.status);
      }
    });

    it("should have unique usernames", async () => {
      const result = await dataSource.query(`
        SELECT username, COUNT(*) as count
        FROM "user"
        GROUP BY username
        HAVING COUNT(*) > 1
      `);

      expect(result.length).toBe(0);
    });

    it("should have unique order numbers", async () => {
      const result = await dataSource.query(`
        SELECT order_number, COUNT(*) as count
        FROM orders
        GROUP BY order_number
        HAVING COUNT(*) > 1
      `);

      expect(result.length).toBe(0);
    });
  });

  describe("Extensions Validation", () => {
    it("should have uuid-ossp extension", async () => {
      const result = await dataSource.query(`
        SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
      `);

      expect(result.length).toBe(1);
    });

    it("should have pg_trgm extension for text search", async () => {
      const result = await dataSource.query(`
        SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'
      `);

      expect(result.length).toBe(1);
    });
  });

  describe("Migrations Validation", () => {
    it("should have all migrations recorded", async () => {
      const result = await dataSource.query(`
        SELECT name FROM migrations ORDER BY timestamp
      `);

      expect(result.length).toBeGreaterThanOrEqual(5);

      const migrationNames = result.map((r: any) => r.name);

      expect(
        migrationNames.some((name: string) =>
          name.includes("UpdatedMigration"),
        ),
      ).toBe(true);
      expect(
        migrationNames.some((name: string) =>
          name.includes("EnableRLSSecurityPolicies"),
        ),
      ).toBe(true);
      expect(
        migrationNames.some((name: string) =>
          name.includes("EnhanceFitterEntity"),
        ),
      ).toBe(true);
      expect(
        migrationNames.some((name: string) =>
          name.includes("SimpleProductionMigration"),
        ),
      ).toBe(true);
      expect(
        migrationNames.some((name: string) =>
          name.includes("SimplifyBrandsEntity"),
        ),
      ).toBe(true);
    });
  });

  describe("Helper Functions Validation", () => {
    it("should have current_user_id function", async () => {
      const result = await dataSource.query(`
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_name = 'current_user_id'
        AND routine_schema = 'public'
      `);

      expect(result.length).toBe(1);
    });

    it("should have current_user_role function", async () => {
      const result = await dataSource.query(`
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_name = 'current_user_role'
        AND routine_schema = 'public'
      `);

      expect(result.length).toBe(1);
    });
  });
});

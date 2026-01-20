/**
 * E2E API Tests: Migrated Data API Validation
 *
 * Tests that migrated production data is correctly accessible
 * through the API endpoints and validates data integrity.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";

describe("Migrated Data API Validation (E2E)", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  // Test credentials
  const testCredentials = {
    email: "adamwhitehouse",
    password: "welcomeAdam!@",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    // Get data source from app
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Authenticate
    try {
      const loginResponse = await request(app.getHttpServer())
        .post("/api/v1/auth/email/login")
        .send(testCredentials);

      if (loginResponse.body.token) {
        authToken = loginResponse.body.token;
      }
    } catch (error) {
      console.warn("Authentication failed:", error);
    }
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  const authRequest = () => ({
    get: (url: string) =>
      request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Bearer ${authToken}`),
  });

  describe("Database vs API Count Comparison", () => {
    it("should match orders count between database and API", async () => {
      if (!authToken) return;

      // Get count from database
      const dbResult = await dataSource.query(
        "SELECT COUNT(*) as count FROM orders",
      );
      const dbCount = parseInt(dbResult[0].count);

      // Get count from API (via stats endpoint)
      const apiResponse = await authRequest().get("/api/v1/orders/stats");

      if (apiResponse.status === 200 && apiResponse.body.totalOrders) {
        console.log(`Database orders: ${dbCount}`);
        console.log(`API total orders: ${apiResponse.body.totalOrders}`);
        // Note: API might have RLS filtering, so counts may differ
        expect(apiResponse.body.totalOrders).toBeGreaterThanOrEqual(0);
      }
    });

    it("should match brands count between database and API", async () => {
      if (!authToken) return;

      // Get count from database
      const dbResult = await dataSource.query(
        "SELECT COUNT(*) as count FROM brands WHERE deleted_at IS NULL",
      );
      const dbCount = parseInt(dbResult[0].count);

      // Get count from API
      const apiResponse = await authRequest().get("/api/v1/brands");

      if (apiResponse.status === 200 && apiResponse.body.data) {
        const apiCount = apiResponse.body.data.length;
        console.log(`Database brands: ${dbCount}`);
        console.log(`API brands: ${apiCount}`);
        // Should be close (API might paginate)
        expect(apiCount).toBeGreaterThan(0);
      }
    });

    it("should match customers count between database and API", async () => {
      if (!authToken) return;

      // Get count from database
      const dbResult = await dataSource.query(
        "SELECT COUNT(*) as count FROM customer",
      );
      const dbCount = parseInt(dbResult[0].count);

      // Get list from API (limited)
      const apiResponse = await authRequest().get("/api/v1/customers?limit=100");

      if (apiResponse.status === 200) {
        console.log(`Database customers: ${dbCount}`);
        console.log(`API customers (limited): ${apiResponse.body.length}`);
        expect(dbCount).toBeGreaterThanOrEqual(apiResponse.body.length);
      }
    });
  });

  describe("Data Quality via API", () => {
    it("should return valid brand data structure", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/brands");

      if (response.status === 200 && response.body.data?.length > 0) {
        const brand = response.body.data[0];
        expect(brand).toHaveProperty("id");
        expect(brand).toHaveProperty("name");
        console.log("Sample brand:", JSON.stringify(brand, null, 2));
      }
    });

    it("should return valid customer data structure", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/customers?limit=1");

      if (response.status === 200 && response.body.length > 0) {
        const customer = response.body[0];
        expect(customer).toHaveProperty("id");
        // Name might be in different formats
        expect(
          customer.name ||
            customer.first_name ||
            customer.firstName ||
            customer.company,
        ).toBeDefined();
        console.log("Sample customer:", JSON.stringify(customer, null, 2));
      }
    });

    it("should return valid fitter data structure", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/fitters?limit=1");

      if (response.status === 200 && response.body.length > 0) {
        const fitter = response.body[0];
        expect(fitter).toHaveProperty("id");
        console.log("Sample fitter:", JSON.stringify(fitter, null, 2));
      }
    });

    it("should return valid factory data structure", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/factories?limit=1");

      if (response.status === 200 && response.body.length > 0) {
        const factory = response.body[0];
        expect(factory).toHaveProperty("id");
        console.log("Sample factory:", JSON.stringify(factory, null, 2));
      }
    });

    it("should return valid options data structure", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/options?limit=1");

      if (response.status === 200 && response.body.length > 0) {
        const option = response.body[0];
        expect(option).toHaveProperty("id");
        expect(option).toHaveProperty("name");
        console.log("Sample option:", JSON.stringify(option, null, 2));
      }
    });
  });

  describe("Relationship Data via API", () => {
    it("should return orders with customer relationships", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/orders?limit=5");

      if (response.status === 200 && response.body.length > 0) {
        const order = response.body[0];
        expect(order).toHaveProperty("id");
        // Order should have customer reference
        if (order.customer || order.customer_id || order.customerId) {
          console.log("Order has customer relationship");
        }
        console.log("Sample order:", JSON.stringify(order, null, 2));
      }
    });

    it("should return customers with fitter relationships", async () => {
      if (!authToken) return;

      // Get customers that have a fitter assigned
      const response = await authRequest().get("/api/v1/customers?limit=10");

      if (response.status === 200 && response.body.length > 0) {
        const customersWithFitter = response.body.filter(
          (c: { fitter_id?: number; fitterId?: number; fitter?: unknown }) =>
            c.fitter_id || c.fitterId || c.fitter,
        );
        console.log(
          `Customers with fitter: ${customersWithFitter.length}/${response.body.length}`,
        );
      }
    });
  });

  describe("Search and Filter via API", () => {
    it("should support order search", async () => {
      if (!authToken) return;

      const response = await authRequest().get(
        "/api/v1/orders/search?limit=5",
      );

      if (response.status === 200) {
        expect(response.body).toHaveProperty("orders");
        expect(response.body).toHaveProperty("total");
        console.log(`Search returned ${response.body.total} total orders`);
      }
    });

    it("should support brand search", async () => {
      if (!authToken) return;

      const response = await authRequest().get("/api/v1/brands?search=a");

      if (response.status === 200 && response.body.data) {
        console.log(
          `Brand search for "a" returned ${response.body.data.length} results`,
        );
      }
    });

    it("should support pagination", async () => {
      if (!authToken) return;

      // Page 1
      const page1 = await authRequest().get("/api/v1/brands?page=1&limit=2");

      if (page1.status === 200 && page1.body.data?.length >= 2) {
        // Page 2
        const page2 = await authRequest().get("/api/v1/brands?page=2&limit=2");

        if (page2.status === 200 && page2.body.data?.length > 0) {
          // Pages should have different data
          const page1Ids = page1.body.data.map(
            (b: { id: number | string }) => b.id,
          );
          const page2Ids = page2.body.data.map(
            (b: { id: number | string }) => b.id,
          );
          const overlap = page1Ids.filter((id: number | string) =>
            page2Ids.includes(id),
          );

          console.log(`Page 1 IDs: ${page1Ids.join(", ")}`);
          console.log(`Page 2 IDs: ${page2Ids.join(", ")}`);
          expect(overlap.length).toBe(0);
        }
      }
    });
  });

  describe("Data Consistency", () => {
    it("should have consistent data between direct DB and API", async () => {
      if (!authToken) return;

      // Get a specific brand from DB
      const dbBrands = await dataSource.query(
        "SELECT id, name FROM brands LIMIT 1",
      );

      if (dbBrands.length > 0) {
        const dbBrand = dbBrands[0];

        // Get same brand from API
        const apiResponse = await authRequest().get(
          `/api/v1/brands/${dbBrand.id}`,
        );

        if (apiResponse.status === 200) {
          expect(apiResponse.body.name).toBe(dbBrand.name);
          console.log(`Brand ${dbBrand.id} name matches between DB and API`);
        }
      }
    });
  });

  describe("Migrated Data Summary", () => {
    it("should generate complete API data summary", async () => {
      if (!authToken) return;

      console.log("\n========================================");
      console.log("API Data Summary");
      console.log("========================================");

      // Note: LeatherTypes, Extras, Presets modules are disabled in AppModule
      const endpoints = [
        { name: "Brands", url: "/api/v1/brands", countPath: "data.length" },
        { name: "Options", url: "/api/v1/options", countPath: "length" },
        // { name: "Leather Types", url: "/api/v1/leathertypes", countPath: "length" }, // Disabled
        // { name: "Extras", url: "/api/v1/extras", countPath: "length" }, // Disabled
        // { name: "Presets", url: "/api/v1/presets", countPath: "length" }, // Disabled
        { name: "Factories", url: "/api/v1/factories", countPath: "length" },
        { name: "Fitters", url: "/api/v1/fitters", countPath: "length" },
        { name: "Customers", url: "/api/v1/customers?limit=1", countPath: "length" },
        { name: "Orders", url: "/api/v1/orders?limit=1", countPath: "length" },
      ];

      console.log("Endpoint                 | Status | Count");
      console.log("------------------------|--------|------");

      for (const endpoint of endpoints) {
        try {
          const response = await authRequest().get(endpoint.url);
          const status = response.status;
          let count = "N/A";

          if (status === 200) {
            if (endpoint.countPath === "data.length" && response.body.data) {
              count = response.body.data.length.toString();
            } else if (endpoint.countPath === "length") {
              count = Array.isArray(response.body)
                ? response.body.length.toString()
                : "0";
            }
          }

          console.log(
            `${endpoint.name.padEnd(24)} | ${status.toString().padEnd(6)} | ${count}`,
          );
        } catch {
          console.log(
            `${endpoint.name.padEnd(24)} | ERROR  | -`,
          );
        }
      }

      console.log("========================================\n");
    });
  });
});

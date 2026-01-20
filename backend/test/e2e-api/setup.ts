/**
 * E2E API Test Setup
 *
 * Initializes environment for E2E API tests with migrated data.
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load E2E test environment variables
dotenv.config({ path: path.join(__dirname, ".env.e2e") });

// Ensure test environment
process.env.NODE_ENV = "test";

// Set E2E database connection (fresh database with migrated data)
process.env.DATABASE_HOST = process.env.E2E_DATABASE_HOST || "127.0.0.1";
process.env.DATABASE_PORT = process.env.E2E_DATABASE_PORT || "5434";
process.env.DATABASE_USERNAME =
  process.env.E2E_DATABASE_USERNAME || "oms_e2e_user";
process.env.DATABASE_PASSWORD =
  process.env.E2E_DATABASE_PASSWORD || "oms_e2e_password";
process.env.DATABASE_NAME = process.env.E2E_DATABASE_NAME || "oms_e2e_test";

// Set Redis connection
process.env.REDIS_HOST = process.env.E2E_REDIS_HOST || "127.0.0.1";
process.env.REDIS_PORT = process.env.E2E_REDIS_PORT || "6380";

// Set app port for E2E tests
process.env.APP_PORT = process.env.E2E_APP_PORT || "3002";

// Global test timeout
jest.setTimeout(60000);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Cleanup handler
afterAll(async () => {
  // Allow connections to close gracefully
  await new Promise((resolve) => setTimeout(resolve, 500));
});

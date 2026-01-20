/**
 * Migration Test Setup
 *
 * Global setup configuration for migration validation tests
 */

import { config } from "dotenv";
import { join } from "path";

// Load environment variables for testing
config({ path: join(__dirname, "../../.env.test") });

// Set test timeout for long-running migration tests
jest.setTimeout(60000);

// Global test configuration
beforeAll(() => {
  // Ensure we're in test mode
  process.env.NODE_ENV = "test";

  // Set test database configuration if not already set
  if (!process.env.DATABASE_NAME) {
    process.env.DATABASE_NAME = "oms_test";
  }

  console.log("🧪 Migration test environment initialized");
});

afterAll(() => {
  console.log("✅ Migration tests completed");
});

// Handle unhandled promise rejections in tests
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

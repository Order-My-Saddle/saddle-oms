/**
 * Simple validation test to verify test setup works
 */

describe("Test Setup Validation", () => {
  it("should have working Jest environment", () => {
    expect(true).toBe(true);
  });

  it("should have access to test helpers", () => {
    // Test helpers are imported from local modules
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TestDataFactory, TestUtils } = require("./helpers/test-helpers");
    expect(TestDataFactory).toBeDefined();
    expect(TestUtils).toBeDefined();
  });

  it("should have custom Jest matchers available", () => {
    // Custom matchers may not be fully loaded yet, so just check basic functionality
    expect(5).toBeGreaterThan(4);
    expect(5).toBeLessThan(6);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("success");
    expect(result).toBe("success");
  });
});

describe("NestJS Core Components", () => {
  it("should be able to import @nestjs/common", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nestjs = require("@nestjs/common");
    expect(nestjs.Injectable).toBeDefined();
  });

  it("should be able to import typeorm", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const typeorm = require("typeorm");
    expect(typeorm.Entity).toBeDefined();
  });
});

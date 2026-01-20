/**
 * Jest E2E API Test Configuration
 *
 * Configuration for end-to-end API testing with migrated production data.
 * Tests focus on:
 * - Data count validation
 * - API endpoint responses
 * - Data integrity verification
 */

module.exports = {
  displayName: "E2E API Tests",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../../",
  testEnvironment: "node",
  testRegex: "test/e2e-api/.*\\.e2e-spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/test/e2e-api/setup.ts"],
  testTimeout: 60000, // 60 seconds for API tests
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1, // Run tests sequentially for database consistency
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/main.ts",
  ],
  coverageDirectory: "<rootDir>/coverage/e2e-api",
};

/**
 * Jest E2E Test Configuration
 *
 * Configuration for end-to-end testing with actual database.
 */

module.exports = {
  displayName: "E2E Tests",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../../",
  testEnvironment: "node",
  testRegex: "test/e2e/.*\\.e2e-spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 60000, // 60 seconds for E2E tests
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1, // Run tests sequentially for database consistency
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
};

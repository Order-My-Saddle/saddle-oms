// Pure Jest configuration for API tests (not using Next.js Jest)
// This avoids interference from Next.js fetch mocking

const customJestConfig = {
  displayName: 'API Tests',
  preset: 'ts-jest',
  testEnvironment: 'node', // Use Node.js environment for API tests
  testMatch: [
    '<rootDir>/tests/api/**/*.test.ts',
    '<rootDir>/tests/api/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/api/setup/jest.setup.ts'],
  collectCoverageFrom: [
    'tests/api/**/*.{js,ts}',
    '!tests/api/**/*.d.ts',
    '!tests/api/setup/**',
  ],
  coverageDirectory: 'coverage/api',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 60000, // 60 second timeout for slower backend with retry logic
  maxWorkers: 1, // Run tests sequentially to avoid overwhelming backend
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Don't transform node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(undici)/)'
  ]
}

module.exports = customJestConfig
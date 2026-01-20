module.exports = {
  displayName: 'Migration Tests',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../../',
  testRegex: 'test/migration/.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'scripts/**/*.(t|j)s',
    '!scripts/**/*.spec.ts',
    '!scripts/**/*.e2e-spec.ts',
  ],
  coverageDirectory: './coverage/migration',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/migration/setup.ts'],
  testTimeout: 60000, // Migration tests may take longer
  moduleNameMapping: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^scripts/(.*)$': '<rootDir>/scripts/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
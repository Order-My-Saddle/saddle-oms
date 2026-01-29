/**
 * Jest setup file for unit tests
 * This file runs before each test file
 */

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);

// Mock external services and dependencies
jest.mock('@nestjs/cache-manager', () => ({
  CACHE_MANAGER: 'CACHE_MANAGER',
}));

// Note: We intentionally do NOT mock TypeORM decorators here.
// The mocked property decorators cause properties to become read-only,
// breaking entity constructors. The actual TypeORM decorators work fine in tests.

// Note: We intentionally do NOT mock @nestjs/common here.
// Mocking Injectable/Inject breaks NestJS dependency injection in tests.
// The Test.createTestingModule() needs the real decorators to work properly.

// Mock behavior decorators - commented out until decorators are implemented
// jest.mock('../../../src/behaviors/decorators', () => ({
//   Blameable: () => (target) => target,
//   Timestampable: () => (target) => target,
//   SoftDeletable: () => (target) => target,
//   Versionable: () => (target) => target,
//   getBehaviorConfig: jest.fn().mockReturnValue(null),
//   getBlameableConfig: jest.fn().mockReturnValue(null),
//   getTimestampableConfig: jest.fn().mockReturnValue(null),
//   getSoftDeletableConfig: jest.fn().mockReturnValue(null),
//   getVersionableConfig: jest.fn().mockReturnValue(null),
//   isBlameable: jest.fn().mockReturnValue(false),
//   isTimestampable: jest.fn().mockReturnValue(false),
//   isSoftDeletable: jest.fn().mockReturnValue(false),
//   isVersionable: jest.fn().mockReturnValue(false),
// }));

// Global test helpers
global.TestHelpers = {
  createMockDate: (dateString) => {
    const mockDate = new Date(dateString);
    const originalDate = global.Date;

    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return mockDate;
        }
        return new originalDate(...args);
      }

      static now() {
        return mockDate.getTime();
      }
    };

    return {
      restore: () => {
        global.Date = originalDate;
      }
    };
  },

  createMockProcess: (env = {}) => {
    const originalEnv = process.env;
    process.env = { ...originalEnv, ...env };

    return {
      restore: () => {
        process.env = originalEnv;
      }
    };
  },

  expectToMatchSnapshot: (received, propertiesToIgnore = []) => {
    const cleaned = { ...received };
    propertiesToIgnore.forEach(prop => {
      delete cleaned[prop];
    });
    expect(cleaned).toMatchSnapshot();
  },

  expectAsyncToThrow: async (asyncFn, expectedError) => {
    let thrownError;
    try {
      await asyncFn();
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    if (expectedError) {
      if (typeof expectedError === 'string') {
        expect(thrownError.message).toContain(expectedError);
      } else if (expectedError instanceof RegExp) {
        expect(thrownError.message).toMatch(expectedError);
      } else if (typeof expectedError === 'function') {
        expect(thrownError).toBeInstanceOf(expectedError);
      }
    }
  },

  waitForCondition: async (condition, timeout = 5000, interval = 100) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Set up global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in test environment, but log the error
});

// Clean up after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Reset all modules to ensure clean state
  jest.resetModules();

  // Clear all mocks
  jest.clearAllMocks();

  // Restore all mocks
  jest.restoreAllMocks();
});

// Global beforeEach
beforeEach(() => {
  // Set up fake timers if needed
  // jest.useFakeTimers();

  // Reset any global state
  if (global.TestHelpers.mockDate) {
    global.TestHelpers.mockDate.restore();
  }

  if (global.TestHelpers.mockProcess) {
    global.TestHelpers.mockProcess.restore();
  }
});

// Global afterAll cleanup
afterAll(async () => {
  // Clean up any global resources
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Custom matchers for Jest
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithPartial(received, expected) {
    const calls = received.mock.calls;
    const pass = calls.some(call =>
      call.some(arg =>
        typeof arg === 'object' &&
        Object.keys(expected).every(key => arg[key] === expected[key])
      )
    );

    if (pass) {
      return {
        message: () => `expected mock not to have been called with partial object ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected mock to have been called with partial object ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledInOrder(received) {
    const callOrders = received.map(mock =>
      Math.min(...mock.mock.invocationCallOrder.filter(order => order !== undefined))
    );

    const pass = callOrders.every((order, index) =>
      index === 0 || order > callOrders[index - 1]
    );

    if (pass) {
      return {
        message: () => `expected mocks not to have been called in order`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected mocks to have been called in order`,
        pass: false,
      };
    }
  },

  async toCompleteWithin(received, timeLimit) {
    const start = Date.now();

    try {
      await received;
      const duration = Date.now() - start;
      const pass = duration <= timeLimit;

      if (pass) {
        return {
          message: () => `expected promise not to complete within ${timeLimit}ms (completed in ${duration}ms)`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected promise to complete within ${timeLimit}ms (took ${duration}ms)`,
          pass: false,
        };
      }
    } catch (error) {
      return {
        message: () => `expected promise to complete within ${timeLimit}ms but it rejected with: ${error.message}`,
        pass: false,
      };
    }
  }
});
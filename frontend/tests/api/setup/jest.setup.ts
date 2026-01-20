/**
 * Jest setup for API tests
 */

// Add missing globals for Jest environment
Object.assign(global, {
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder,
});

// Simple fetch polyfill for Jest test environment
const fetch = require('node-fetch');
global.fetch = fetch;
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;

// Set test timeout
jest.setTimeout(30000);

// Global test configuration
global.API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

// Console configuration for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress expected console errors during tests unless in debug mode
  if (!process.env.DEBUG_TESTS) {
    console.error = (...args: any[]) => {
      // Still show authentication and important API errors
      const message = args.join(' ');
      if (message.includes('authentication') || message.includes('ECONNREFUSED') || message.includes('500')) {
        originalConsoleError(...args);
      }
    };

    console.warn = (...args: any[]) => {
      // Suppress most warnings unless they're critical
      const message = args.join(' ');
      if (message.includes('deprecated') === false) {
        originalConsoleWarn(...args);
      }
    };
  }
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

afterEach(() => {
  // Clean up any active API requests after each test to prevent Jest warnings
  if (typeof require !== 'undefined') {
    try {
      // Dynamically import and clean up the API client to avoid circular dependencies
      const { apiClient } = require('../shared/api-client');
      if (apiClient && typeof apiClient.cleanup === 'function') {
        apiClient.cleanup();
      }
    } catch (error) {
      // Ignore cleanup errors - just ensure we don't leave hanging requests
    }
  }
});

// Global test utilities
declare global {
  var API_BASE_URL: string;
}

// Add custom Jest matchers
import { setupMatchers } from '../shared/matchers';
setupMatchers();
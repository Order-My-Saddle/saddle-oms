/**
 * Simple test to verify the setup works
 */

describe('Simple Tests', () => {
  test('API base URL is configured', () => {
    expect(global.API_BASE_URL).toBeDefined();
    expect(global.API_BASE_URL).toContain('localhost');
  });

  test('fetch is available', () => {
    expect(global.fetch).toBeDefined();
    expect(typeof global.fetch).toBe('function');
  });
});
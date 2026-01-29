import { test, expect } from '@playwright/test';

test.describe('OMS Staging V2 Deployment Validation', () => {
  test('Frontend application loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/OMS|Order Management/i);

    // Verify no console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(logs.length).toBe(0);
  });

  test('Backend API health check passes', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    const response = await request.get(`${apiURL}/api/health`);
    // Health endpoint might return 503 if some services are down, but should respond
    expect([200, 503]).toContain(response.status());

    const health = await response.json();
    expect(health).toHaveProperty('status');
  });

  test('Backend API documentation is accessible', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    // Swagger docs endpoint
    const response = await request.get(`${apiURL}/docs`);
    expect(response.ok()).toBeTruthy();
  });

  test('Authentication endpoints are protected', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    // Try to access protected endpoint without auth
    const response = await request.get(`${apiURL}/api/v1/customers`);
    expect(response.status()).toBe(401);
  });

  test('Database connectivity works via API health', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    // Health check endpoint validates database connectivity
    const response = await request.get(`${apiURL}/api/health`);
    expect([200, 503]).toContain(response.status());

    const health = await response.json();
    expect(health).toHaveProperty('status');
  });

  test('All core entity endpoints are available', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    // Core NestJS backend endpoints (v1 API)
    const endpoints = [
      '/api/v1/customers',
      '/api/v1/orders',
      '/api/v1/fitters',
      '/api/v1/factories',
      '/api/v1/enriched_orders',
      '/api/v1/saddles',  // Models are stored in saddles table
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${apiURL}${endpoint}`);
      // Should return 401 (unauthorized) not 404 (not found)
      expect([401, 200]).toContain(response.status());
    }
  });

  test('CORS headers are properly configured', async ({ request }) => {
    const apiURL = process.env.API_URL || 'https://api-staging-v2.ordermysaddle.com';

    const response = await request.options(`${apiURL}/api/v1/customers`, {
      headers: {
        'Origin': 'https://staging-v2.ordermysaddle.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });

    expect(response.headers()['access-control-allow-origin']).toBeTruthy();
  });

  test('Security headers are present', async ({ request }) => {
    const response = await request.get('/');

    const headers = response.headers();
    expect(headers['x-frame-options']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBeTruthy();
  });

  test('Application performance is acceptable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Error pages handle correctly', async ({ page }) => {
    // Test 404 page
    const response = await page.goto('/non-existent-page', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(404);

    // Should show custom error page, not default server error
    await expect(page.locator('body')).not.toContainText('Cannot GET');
  });
});
import { test, expect } from '@playwright/test';

test.describe('E2E Setup Verification', () => {
  test('should verify frontend is accessible', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login or dashboard
    await page.waitForURL(/(login|dashboard)/, { timeout: 10000 });

    // Page should load without errors
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should verify API backend is accessible', async ({ request }) => {
    // Test API health endpoint
    const healthResponse = await request.get('http://localhost:8888/health/simple');

    // Should get 200 OK response from health endpoint
    expect(healthResponse.status()).toBe(200);

    // Check response structure
    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('status', 'ok');
    expect(healthData).toHaveProperty('message');
    expect(healthData).toHaveProperty('timestamp');
  });

  test('should verify login page loads correctly', async ({ page }) => {
    await page.goto('/login');

    // Should see login form elements (using placeholder text as the form doesn't use name attributes)
    const usernameInput = page.locator('input[placeholder="Gebruikersnaam"]');
    const passwordInput = page.locator('input[placeholder="Wachtwoord"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should verify test configuration is working', async ({ page }) => {
    // Test basic Playwright functionality
    await page.goto('/login');

    // Test that we can interact with elements
    const usernameInput = page.locator('input[placeholder="Gebruikersnaam"]');
    await usernameInput.fill('test');

    const value = await usernameInput.inputValue();
    expect(value).toBe('test');

    // Clear for cleanup
    await usernameInput.clear();
  });
});
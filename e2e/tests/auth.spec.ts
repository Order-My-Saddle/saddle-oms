import { test, expect, Page } from '@playwright/test';

/**
 * 🔐 Authentication E2E Tests
 * 🎯 Critical path testing for user authentication flows
 * 🚀 Ralph Loop automation compatible
 */

test.describe('Authentication Flow @critical @smoke', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test('should display login page correctly @smoke', async () => {
    await page.goto('/auth/signin');

    // Verify page elements
    await expect(page).toHaveTitle(/Sign In.*OMS/);
    await expect(page.locator('h1')).toContainText(/Sign In/i);

    // Check form fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check security elements
    await expect(page.locator('form')).toHaveAttribute('method', 'post');
  });

  test('should show validation errors for invalid inputs @critical', async () => {
    await page.goto('/auth/signin');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation messages
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email/i);
  });

  test('should handle login failure gracefully @critical', async () => {
    await page.goto('/auth/signin');

    // Use invalid credentials
    await page.fill('input[name="email"]', 'nonexistent@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error handling
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-error"]')).toContainText(/invalid/i);

    // Ensure user stays on login page
    await expect(page).toHaveURL(/signin/);
  });

  test('should successfully login with valid credentials @critical @smoke', async () => {
    await page.goto('/auth/signin');

    // Use test credentials
    await page.fill('input[name="email"]', 'admin@omsaddle.com');
    await page.fill('input[name="password"]', 'AdminPass123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Verify successful login indicators
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('admin@omsaddle.com');
  });

  test('should handle role-based access correctly @critical', async () => {
    // Login as fitter
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'sarah.thompson@fitters.com');
    await page.fill('input[name="password"]', 'FitterPass123!');
    await page.click('button[type="submit"]');

    // Verify fitter dashboard access
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('[data-testid="fitter-menu"]')).toBeVisible();

    // Try to access admin-only page (should be blocked)
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/403|unauthorized/);
  });

  test('should handle session expiration @critical', async () => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@omsaddle.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);

    // Simulate expired session by clearing storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to access protected route
    await page.goto('/orders');

    // Should redirect to login
    await expect(page).toHaveURL(/signin/);
    await expect(page.locator('[data-testid="session-expired"]')).toBeVisible();
  });

  test('should successfully logout @smoke', async () => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@omsaddle.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Verify logout
    await expect(page).toHaveURL(/signin/);
    await expect(page.locator('[data-testid="logout-success"]')).toBeVisible();

    // Verify session cleared
    const storage = await page.evaluate(() => ({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    }));

    expect(Object.keys(storage.localStorage)).toHaveLength(0);
  });

  test('should handle password reset flow @regression', async () => {
    await page.goto('/auth/signin');

    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]');
    await expect(page).toHaveURL(/forgot-password/);

    // Submit email for reset
    await page.fill('input[name="email"]', 'admin@omsaddle.com');
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-email-sent"]')).toContainText(/check your email/i);
  });

  test('should enforce security policies @security', async () => {
    await page.goto('/auth/signin');

    // Test weak password handling (if registration is available)
    await page.goto('/auth/signup');

    if (await page.locator('input[name="password"]').isVisible()) {
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', '123'); // Weak password

      await page.click('button[type="submit"]');

      // Should show password policy error
      await expect(page.locator('[data-testid="password-policy-error"]')).toBeVisible();
    }
  });

  test('should handle concurrent sessions @security', async ({ browser }) => {
    // Create two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Login in first session
      await page1.goto('/auth/signin');
      await page1.fill('input[name="email"]', 'admin@omsaddle.com');
      await page1.fill('input[name="password"]', 'AdminPass123!');
      await page1.click('button[type="submit"]');
      await expect(page1).toHaveURL(/dashboard/);

      // Login in second session with same user
      await page2.goto('/auth/signin');
      await page2.fill('input[name="email"]', 'admin@omsaddle.com');
      await page2.fill('input[name="password"]', 'AdminPass123!');
      await page2.click('button[type="submit"]');
      await expect(page2).toHaveURL(/dashboard/);

      // Both sessions should remain active or show concurrent session warning
      // Implementation depends on your session management strategy

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
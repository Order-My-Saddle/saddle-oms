import { test, expect, Page } from '@playwright/test';

/**
 * 🛍️ Order Management E2E Tests
 * 🎯 Critical business flow testing for order lifecycle
 * 🚀 Ralph Loop automation compatible
 */

test.describe('Order Management Flow @critical', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // Login as admin user before each test
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'admin@omsaddle.com');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display orders list page correctly @smoke', async () => {
    await page.goto('/orders');

    // Verify page elements
    await expect(page).toHaveTitle(/Orders.*OMS/);
    await expect(page.locator('h1')).toContainText(/Orders/i);

    // Check main UI elements
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-order-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-orders"]')).toBeVisible();

    // Check table headers
    const tableHeaders = ['Order ID', 'Customer', 'Status', 'Date', 'Total'];
    for (const header of tableHeaders) {
      await expect(page.locator('th', { hasText: header })).toBeVisible();
    }
  });

  test('should create new order successfully @critical @smoke', async () => {
    await page.goto('/orders');

    // Click new order button
    await page.click('[data-testid="new-order-button"]');
    await expect(page).toHaveURL(/orders\/new/);

    // Fill order form
    await page.selectOption('select[name="customerId"]', { label: 'Test Customer' });
    await page.selectOption('select[name="fitterId"]', { label: 'Test Fitter' });

    // Add product details
    await page.selectOption('select[name="brandId"]', { label: 'Tack & Saddle' });
    await page.selectOption('select[name="modelId"]', { label: 'Classic Dressage' });
    await page.selectOption('select[name="leatherType"]', { label: 'Calfskin' });

    // Fill measurement details
    await page.fill('input[name="seatSize"]', '17.5');
    await page.fill('input[name="flap"]', 'Regular');
    await page.fill('textarea[name="notes"]', 'E2E Test Order - Automated Creation');

    // Submit order
    await page.click('button[type="submit"]');

    // Verify order creation success
    await expect(page).toHaveURL(/orders\/\d+/);
    await expect(page.locator('[data-testid="order-created-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Draft');
  });

  test('should validate order form correctly @critical', async () => {
    await page.goto('/orders/new');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator('[data-testid="customer-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="fitter-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-error"]')).toBeVisible();

    // Invalid seat size
    await page.fill('input[name="seatSize"]', 'invalid');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="seat-size-error"]')).toContainText(/valid number/i);
  });

  test('should update order status @critical', async () => {
    // First create an order
    await page.goto('/orders/new');
    await page.selectOption('select[name="customerId"]', { index: 1 });
    await page.selectOption('select[name="fitterId"]', { index: 1 });
    await page.selectOption('select[name="brandId"]', { index: 1 });
    await page.selectOption('select[name="modelId"]', { index: 1 });
    await page.fill('input[name="seatSize"]', '17.5');
    await page.fill('textarea[name="notes"]', 'E2E Test - Status Update');
    await page.click('button[type="submit"]');

    // Verify order creation
    await expect(page).toHaveURL(/orders\/\d+/);
    const orderId = await page.locator('[data-testid="order-id"]').textContent();

    // Update status
    await page.click('[data-testid="status-dropdown"]');
    await page.click('[data-testid="status-in-progress"]');
    await page.click('[data-testid="update-status-button"]');

    // Verify status update
    await expect(page.locator('[data-testid="order-status"]')).toContainText('In Progress');
    await expect(page.locator('[data-testid="status-updated-success"]')).toBeVisible();
  });

  test('should search and filter orders @regression', async () => {
    await page.goto('/orders');

    // Test search functionality
    await page.fill('[data-testid="search-orders"]', 'E2E Test');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const orderRows = page.locator('[data-testid="order-row"]');
    const count = await orderRows.count();

    for (let i = 0; i < count; i++) {
      const orderText = await orderRows.nth(i).textContent();
      expect(orderText.toLowerCase()).toContain('e2e test');
    }

    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'Draft');
    await expect(page.locator('[data-testid="order-row"][data-status="draft"]')).toBeVisible();

    // Test date range filter
    await page.fill('[data-testid="date-from"]', '2024-01-01');
    await page.fill('[data-testid="date-to"]', '2024-12-31');
    await page.click('[data-testid="apply-date-filter"]');

    // Verify filtered results
    await expect(page.locator('[data-testid="filter-active-indicator"]')).toBeVisible();
  });

  test('should handle order details view @smoke', async () => {
    await page.goto('/orders');

    // Click on first order
    const firstOrder = page.locator('[data-testid="order-row"]').first();
    await firstOrder.click();

    // Verify order details page
    await expect(page).toHaveURL(/orders\/\d+/);
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();

    // Check order information sections
    await expect(page.locator('[data-testid="customer-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="fitter-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible();
  });

  test('should update order details @critical', async () => {
    // Navigate to existing order
    await page.goto('/orders');
    await page.locator('[data-testid="order-row"]').first().click();

    // Click edit button
    await page.click('[data-testid="edit-order-button"]');

    // Update notes
    const newNotes = `Updated notes - ${Date.now()}`;
    await page.fill('textarea[name="notes"]', newNotes);

    // Update seat size
    await page.fill('input[name="seatSize"]', '18.0');

    // Save changes
    await page.click('[data-testid="save-order-button"]');

    // Verify update success
    await expect(page.locator('[data-testid="order-updated-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-notes"]')).toContainText(newNotes);
    await expect(page.locator('[data-testid="seat-size-display"]')).toContainText('18.0');
  });

  test('should handle order workflow transitions @critical', async () => {
    // Create order and verify workflow
    await page.goto('/orders/new');
    await page.selectOption('select[name="customerId"]', { index: 1 });
    await page.selectOption('select[name="fitterId"]', { index: 1 });
    await page.selectOption('select[name="brandId"]', { index: 1 });
    await page.selectOption('select[name="modelId"]', { index: 1 });
    await page.fill('input[name="seatSize"]', '17.5');
    await page.click('button[type="submit"]');

    // Test workflow: Draft → In Progress → Production → Ready → Delivered
    const statuses = ['In Progress', 'Production', 'Ready', 'Delivered'];

    for (const status of statuses) {
      await page.click('[data-testid="status-dropdown"]');
      await page.click(`[data-testid="status-${status.toLowerCase().replace(' ', '-')}"]`);
      await page.click('[data-testid="update-status-button"]');

      await expect(page.locator('[data-testid="order-status"]')).toContainText(status);

      // Verify workflow constraints if any
      if (status === 'Delivered') {
        await expect(page.locator('[data-testid="order-completed-badge"]')).toBeVisible();
      }
    }
  });

  test('should handle order cancellation @critical', async () => {
    // Navigate to existing order
    await page.goto('/orders');
    await page.locator('[data-testid="order-row"]').first().click();

    // Click cancel order button
    await page.click('[data-testid="cancel-order-button"]');

    // Confirm cancellation in modal
    await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).toBeVisible();
    await page.fill('[data-testid="cancellation-reason"]', 'Customer requested cancellation - E2E Test');
    await page.click('[data-testid="confirm-cancel-button"]');

    // Verify cancellation
    await expect(page.locator('[data-testid="order-status"]')).toContainText('Cancelled');
    await expect(page.locator('[data-testid="order-cancelled-success"]')).toBeVisible();
  });

  test('should export orders data @regression', async () => {
    await page.goto('/orders');

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await page.click('[data-testid="export-orders-button"]');

    // Select export format
    await page.click('[data-testid="export-csv"]');

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/orders.*\.csv$/);

    // Verify download completed
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });

  test('should handle order pagination @performance', async () => {
    await page.goto('/orders');

    // Test pagination controls
    if (await page.locator('[data-testid="pagination"]').isVisible()) {
      // Check current page indicator
      await expect(page.locator('[data-testid="current-page"]')).toBeVisible();

      // Test page size selector
      await page.selectOption('[data-testid="page-size-selector"]', '50');
      await expect(page).toHaveURL(/pageSize=50/);

      // Test next page navigation
      if (await page.locator('[data-testid="next-page"]').isEnabled()) {
        await page.click('[data-testid="next-page"]');
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });

  test('should handle concurrent order editing @security', async ({ browser }) => {
    // Create two browser contexts for concurrent editing test
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Login both users
      for (const testPage of [page1, page2]) {
        await testPage.goto('/auth/signin');
        await testPage.fill('input[name="email"]', 'admin@omsaddle.com');
        await testPage.fill('input[name="password"]', 'AdminPass123!');
        await testPage.click('button[type="submit"]');
      }

      // Both users edit the same order
      const orderUrl = '/orders/1';
      await page1.goto(orderUrl);
      await page2.goto(orderUrl);

      // User 1 starts editing
      await page1.click('[data-testid="edit-order-button"]');
      await page1.fill('textarea[name="notes"]', 'User 1 changes');

      // User 2 also starts editing
      await page2.click('[data-testid="edit-order-button"]');

      // User 2 should see conflict warning or be blocked
      await expect(page2.locator('[data-testid="edit-conflict-warning"]')).toBeVisible();

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
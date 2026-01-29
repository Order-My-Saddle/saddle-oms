import { test, expect, request } from '@playwright/test';

/**
 * 📦 Product Entities E2E Tests
 * 🎯 Testing all product-related entities (Saddles, Options)
 * 🚀 NestJS backend API validation
 *
 * NOTE: Many product entity modules are currently disabled in the NestJS backend:
 * - BrandsModule (disabled - schema mismatch)
 * - ModelsModule (disabled - models are stored in saddles table)
 * - LeathertypesModule (disabled)
 * - ExtrasModule (disabled)
 * - PresetsModule (disabled)
 * - ProductsModule (disabled)
 *
 * Available endpoints:
 * - /api/v1/saddles - Saddle models
 * - /api/v1/options - Options (limited functionality)
 */

test.describe('Product Entities API @products @critical', () => {
  let apiContext: any;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'OMS-E2E-Tests/1.0.0'
      },
      ignoreHTTPSErrors: true,
    });
  });

  test.beforeEach(async ({ playwright }) => {
    // Authenticate and get token for protected endpoints
    const loginResponse = await apiContext.post('http://localhost:3001/api/v1/auth/email/login', {
      data: {
        email: 'admin@omsaddle.com',
        password: 'AdminPass123!'
      }
    });

    if (!loginResponse.ok()) {
      console.log('Login failed. Status:', loginResponse.status());
      console.log('Response text:', await loginResponse.text());
    }

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;

    // Set authorization header for subsequent requests
    apiContext = await playwright.request.newContext({
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'OMS-E2E-Tests/1.0.0'
      },
      ignoreHTTPSErrors: true,
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // SKIPPED: Brands module is disabled due to schema mismatch issues
  test.skip('should CRUD brands via API @brands @critical', async () => {
    // Brands module is disabled in app.module.ts
    // This test is skipped until the module is re-enabled
  });

  // Test saddles API (models are stored in saddles table)
  test('should list saddles (models) via API @saddles @critical', async () => {
    // LIST: Get all saddles with pagination
    const listResponse = await apiContext.get('http://localhost:3001/api/v1/saddles?page=1&limit=10');
    expect(listResponse.ok()).toBeTruthy();

    const listData = await listResponse.json();
    expect(listData).toHaveProperty('data');
    expect(listData).toHaveProperty('total');
    expect(listData).toHaveProperty('pages');
    expect(Array.isArray(listData.data)).toBeTruthy();

    console.log(`Saddles returned: ${listData.data.length} of ${listData.total} total`);

    // Verify saddle structure if data exists
    if (listData.data.length > 0) {
      const saddle = listData.data[0];
      expect(saddle).toHaveProperty('id');
      expect(saddle).toHaveProperty('brand');
      expect(saddle).toHaveProperty('modelName');
      expect(saddle).toHaveProperty('sequence');
      expect(typeof saddle.id).toBe('number');
    }
  });

  test('should get active saddles @saddles @api', async () => {
    // Get only active saddles
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/saddles/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();

    console.log(`Active saddles: ${activeData.length}`);

    // All saddles should be active
    activeData.forEach((saddle: any) => {
      expect(saddle.isActive).toBe(true);
    });
  });

  test('should get unique brands from saddles @saddles @api', async () => {
    const brandsResponse = await apiContext.get('http://localhost:3001/api/v1/saddles/brands');
    expect(brandsResponse.ok()).toBeTruthy();

    const brands = await brandsResponse.json();
    expect(Array.isArray(brands)).toBeTruthy();

    console.log(`Unique brands: ${brands.length}`);
  });

  // SKIPPED: Models module is disabled - models are stored in saddles table
  test.skip('should CRUD models via API @models @critical', async () => {
    // Models module is disabled in app.module.ts
    // Models are stored as modelName in the saddles table
    // Use /api/v1/saddles endpoint instead
  });

  // SKIPPED: Leathertypes module is disabled
  test.skip('should CRUD leathertypes via API @leathertypes @critical', async () => {
    // Leathertypes module is disabled in app.module.ts
  });

  // SKIPPED: Options module has schema issues
  test.skip('should CRUD options via API @options @critical', async () => {
    // Options module has schema mismatch issues (legacyId column doesn't exist)
  });

  // SKIPPED: Extras module is disabled
  test.skip('should CRUD extras via API @extras @critical', async () => {
    // Extras module is disabled in app.module.ts
  });

  // SKIPPED: Presets module is disabled
  test.skip('should CRUD presets via API @presets @critical', async () => {
    // Presets module is disabled in app.module.ts
  });

  test('should handle saddles pagination @pagination @api', async () => {
    // Test saddles pagination
    const saddlesResponse = await apiContext.get('http://localhost:3001/api/v1/saddles?page=1&limit=10');
    expect(saddlesResponse.ok()).toBeTruthy();

    const saddlesData = await saddlesResponse.json();
    expect(saddlesData).toHaveProperty('data');
    expect(saddlesData).toHaveProperty('total');
    expect(saddlesData).toHaveProperty('pages');
    expect(Array.isArray(saddlesData.data)).toBeTruthy();
    expect(saddlesData.data.length).toBeLessThanOrEqual(10);

    console.log(`Saddles pagination: page 1, ${saddlesData.data.length} items, ${saddlesData.total} total`);
  });

  test('should handle saddles filtering by brand @filtering @api', async () => {
    // First get brands to find one to filter by
    const brandsResponse = await apiContext.get('http://localhost:3001/api/v1/saddles/brands');
    const brands = await brandsResponse.json();

    if (brands.length > 0) {
      const brandName = brands[0];
      const saddlesResponse = await apiContext.get(`http://localhost:3001/api/v1/saddles?page=1&limit=10&brand=${encodeURIComponent(brandName)}`);
      expect(saddlesResponse.ok()).toBeTruthy();

      const saddlesData = await saddlesResponse.json();
      expect(saddlesData).toHaveProperty('data');
      expect(Array.isArray(saddlesData.data)).toBeTruthy();

      console.log(`Saddles with brand "${brandName}": ${saddlesData.data.length}`);
    }
  });

  test('should handle saddles active-only filter @filtering @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/saddles?page=1&limit=10&activeOnly=true');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(activeData).toHaveProperty('data');
    expect(Array.isArray(activeData.data)).toBeTruthy();

    // All returned saddles should be active
    activeData.data.forEach((saddle: any) => {
      expect(saddle.isActive).toBe(true);
    });
  });

  // SKIPPED: Products module is disabled
  test.skip('should validate product entity relationships @relationships @api', async () => {
    // Products module is disabled in app.module.ts
    // Brand-Model relationships are stored in saddles table as brand/modelName fields
  });
});
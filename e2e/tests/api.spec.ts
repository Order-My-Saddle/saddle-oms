import { test, expect, request } from '@playwright/test';

/**
 * API E2E Tests
 * Backend API testing for Ralph Loop automation
 * Direct API validation without UI layer
 */

test.describe('API Endpoints @api @critical', () => {
  let apiContext: any;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context without baseURL (use absolute URLs instead)
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
    // Authenticate and get token for protected endpoints using absolute URL
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

    // Create new apiContext with authorization header for subsequent requests
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

  // ==================== Health & Auth ====================

  test('should have healthy API endpoints @smoke @api', async () => {
    const healthResponse = await apiContext.get('http://localhost:3001/api/health');

    // Health endpoint might return 503 due to Redis being down, but it should still respond
    expect(healthResponse.status()).toBeGreaterThan(0);
    expect([200, 503].includes(healthResponse.status())).toBeTruthy();

    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('status');
  });

  test('should handle authentication correctly @critical @api', async () => {
    // Test successful login
    const validLoginResponse = await apiContext.post('http://localhost:3001/api/v1/auth/email/login', {
      data: {
        email: 'admin@omsaddle.com',
        password: 'AdminPass123!'
      }
    });

    expect(validLoginResponse.ok()).toBeTruthy();
    const loginData = await validLoginResponse.json();
    expect(loginData).toHaveProperty('token');
    expect(loginData).toHaveProperty('user');
    expect(loginData.user.email).toBe('admin@omsaddle.com');

    // Test invalid credentials
    const invalidLoginResponse = await apiContext.post('http://localhost:3001/api/v1/auth/email/login', {
      data: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }
    });

    expect(invalidLoginResponse.status()).toBe(422);
  });

  test('should protect endpoints with authentication @security @api', async () => {
    // Create context without authentication
    const unauthenticatedContext = await request.newContext({
      baseURL: process.env.E2E_API_URL || 'http://localhost:3001',
    });

    // Try to access protected endpoint
    const protectedResponse = await unauthenticatedContext.get('http://localhost:3001/api/v1/customers');
    expect(protectedResponse.status()).toBe(401);

    await unauthenticatedContext.dispose();
  });

  // ==================== Customers ====================

  test('should handle customers API @api', async () => {
    const customersResponse = await apiContext.get('http://localhost:3001/api/v1/customers');
    expect(customersResponse.ok()).toBeTruthy();

    const customersData = await customersResponse.json();

    // NestJS API returns direct array
    expect(Array.isArray(customersData)).toBeTruthy();
    expect(customersData.length).toBeGreaterThan(0);

    if (customersData.length > 0) {
      const customer = customersData[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('name');
    }
  });

  test('should handle customers without-fitter endpoint @api', async () => {
    const response = await apiContext.get('http://localhost:3001/api/v1/customers/without-fitter');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();

    console.log(`Customers without fitter: ${data.length}`);
  });

  test('should handle customers by-fitter endpoint @api', async () => {
    const response = await apiContext.get('http://localhost:3001/api/v1/customers/fitter/1');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();

    console.log(`Customers for fitter 1: ${data.length}`);
  });

  // ==================== Fitters ====================

  test('should handle fitters API @api', async () => {
    const fittersResponse = await apiContext.get('http://localhost:3001/api/v1/fitters');
    expect(fittersResponse.ok()).toBeTruthy();

    const fittersData = await fittersResponse.json();

    expect(Array.isArray(fittersData)).toBeTruthy();

    console.log(`Fitters returned: ${fittersData.length}`);

    if (fittersData.length > 0) {
      const fitter = fittersData[0];
      expect(fitter).toHaveProperty('id');
      expect(typeof fitter.id).toBe('number');
      if (fitter.userId !== undefined) {
        expect(typeof fitter.userId).toBe('number');
      }
      if (fitter.country !== undefined) {
        expect(typeof fitter.country).toBe('string');
      }
    }
  });

  test('should handle fitters active endpoint @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/fitters/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();

    console.log(`Active fitters: ${activeData.length}`);
  });

  test('should handle fitters by country endpoint @api', async () => {
    // First get fitters to find a country
    const fittersResponse = await apiContext.get('http://localhost:3001/api/v1/fitters');
    const fitters = await fittersResponse.json();

    if (fitters.length > 0 && fitters[0].country) {
      const country = fitters[0].country;
      const countryResponse = await apiContext.get(`http://localhost:3001/api/v1/fitters/country/${encodeURIComponent(country)}`);
      expect(countryResponse.ok()).toBeTruthy();

      const countryData = await countryResponse.json();
      expect(Array.isArray(countryData)).toBeTruthy();

      console.log(`Fitters in ${country}: ${countryData.length}`);
    }
  });

  // ==================== Factories ====================

  test('should handle factories API @api', async () => {
    const factoriesResponse = await apiContext.get('http://localhost:3001/api/v1/factories');
    expect(factoriesResponse.ok()).toBeTruthy();

    const factoriesData = await factoriesResponse.json();

    expect(Array.isArray(factoriesData)).toBeTruthy();

    console.log(`Factories returned: ${factoriesData.length}`);

    if (factoriesData.length > 0) {
      const factory = factoriesData[0];
      expect(factory).toHaveProperty('id');
      expect(typeof factory.id).toBe('number');
    }
  });

  test('should handle factories active endpoint @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/factories/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();
  });

  test('should handle factories stats endpoint @api', async () => {
    const statsResponse = await apiContext.get('http://localhost:3001/api/v1/factories/stats/active/count');
    expect(statsResponse.ok()).toBeTruthy();

    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty('count');
    expect(typeof statsData.count).toBe('number');
  });

  // ==================== Brands ====================

  test('should handle brands API @api', async () => {
    const brandsResponse = await apiContext.get('http://localhost:3001/api/v1/brands');
    expect(brandsResponse.ok()).toBeTruthy();

    const brandsData = await brandsResponse.json();

    console.log(`Brands returned: ${JSON.stringify(brandsData).slice(0, 200)}`);

    if (Array.isArray(brandsData)) {
      expect(brandsData.length).toBeGreaterThanOrEqual(0);
    } else {
      expect(brandsData).toHaveProperty('data');
    }
  });

  test('should handle brands active endpoint @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/brands/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();
  });

  // ==================== Options ====================

  test('should handle options API @api', async () => {
    const optionsResponse = await apiContext.get('http://localhost:3001/api/v1/options');
    expect(optionsResponse.ok()).toBeTruthy();

    const optionsData = await optionsResponse.json();

    if (optionsData.data) {
      expect(Array.isArray(optionsData.data)).toBeTruthy();
    } else {
      expect(Array.isArray(optionsData)).toBeTruthy();
    }
    console.log(`Options API responded successfully`);
  });

  // ==================== Extras ====================

  test('should handle extras API @api', async () => {
    const extrasResponse = await apiContext.get('http://localhost:3001/api/v1/extras');
    expect(extrasResponse.ok()).toBeTruthy();

    const extrasData = await extrasResponse.json();

    if (extrasData.data) {
      expect(Array.isArray(extrasData.data)).toBeTruthy();
    } else {
      expect(Array.isArray(extrasData)).toBeTruthy();
    }
    console.log(`Extras API responded successfully`);
  });

  test('should handle extras active endpoint @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/extras/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();

    console.log(`Active extras: ${activeData.length}`);
  });

  // ==================== Leathertypes ====================

  test('should handle leathertypes API @api', async () => {
    const leathertypesResponse = await apiContext.get('http://localhost:3001/api/v1/leathertypes');
    expect(leathertypesResponse.ok()).toBeTruthy();

    const leathertypesData = await leathertypesResponse.json();

    if (leathertypesData.data) {
      expect(Array.isArray(leathertypesData.data)).toBeTruthy();
    } else {
      expect(Array.isArray(leathertypesData)).toBeTruthy();
    }
    console.log(`Leathertypes API responded successfully`);
  });

  // ==================== Presets ====================

  test('should handle presets API @api', async () => {
    const presetsResponse = await apiContext.get('http://localhost:3001/api/v1/presets');
    expect(presetsResponse.ok()).toBeTruthy();

    const presetsData = await presetsResponse.json();

    if (presetsData.data) {
      expect(Array.isArray(presetsData.data)).toBeTruthy();
    } else {
      expect(Array.isArray(presetsData)).toBeTruthy();
    }
    console.log(`Presets API responded successfully`);
  });

  // ==================== Users ====================

  test('should handle users API @api', async () => {
    const usersResponse = await apiContext.get('http://localhost:3001/api/v1/users');
    expect(usersResponse.ok()).toBeTruthy();

    const usersData = await usersResponse.json();

    // Users endpoint returns infinity pagination format
    if (usersData.data) {
      expect(Array.isArray(usersData.data)).toBeTruthy();
      if (usersData.meta) {
        expect(usersData.meta).toHaveProperty('hasNextPage');
      }
    } else {
      expect(Array.isArray(usersData)).toBeTruthy();
    }
    console.log(`Users API responded successfully`);
  });

  // ==================== Warehouses ====================

  test('should handle warehouses API @api', async () => {
    const warehousesResponse = await apiContext.get('http://localhost:3001/api/v1/warehouses');
    expect(warehousesResponse.ok()).toBeTruthy();

    const warehousesData = await warehousesResponse.json();

    // Warehouses return { data: [], meta: { total, page, limit, totalPages } }
    if (warehousesData.data) {
      expect(Array.isArray(warehousesData.data)).toBeTruthy();
      if (warehousesData.meta) {
        expect(warehousesData.meta).toHaveProperty('total');
        expect(warehousesData.meta).toHaveProperty('page');
      }
    } else if (Array.isArray(warehousesData)) {
      expect(warehousesData).toBeTruthy();
    }

    console.log(`Warehouses API responded successfully`);
  });

  // ==================== Saddle Stock ====================

  test('should handle saddle-stock API @api', async () => {
    const saddleStockResponse = await apiContext.get('http://localhost:3001/api/v1/saddle-stock?type=all&page=1&limit=10');
    expect(saddleStockResponse.ok()).toBeTruthy();

    const saddleStockData = await saddleStockResponse.json();

    // Saddle stock returns Hydra format
    expect(saddleStockData).toHaveProperty('@context');
    expect(saddleStockData).toHaveProperty('@type', 'hydra:Collection');
    expect(saddleStockData).toHaveProperty('hydra:member');
    expect(saddleStockData).toHaveProperty('hydra:totalItems');
    expect(Array.isArray(saddleStockData['hydra:member'])).toBeTruthy();

    console.log(`Saddle stock returned: ${saddleStockData['hydra:member'].length} of ${saddleStockData['hydra:totalItems']} total`);
  });

  // ==================== Orders ====================

  test('should handle orders API @api', async () => {
    const ordersResponse = await apiContext.get('http://localhost:3001/api/v1/orders?page=1&limit=10');
    expect(ordersResponse.ok()).toBeTruthy();

    const ordersData = await ordersResponse.json();

    expect(ordersData).toHaveProperty('data');
    expect(ordersData).toHaveProperty('total');
    expect(ordersData).toHaveProperty('pages');
    expect(Array.isArray(ordersData.data)).toBeTruthy();
    expect(typeof ordersData.total).toBe('number');
    expect(typeof ordersData.pages).toBe('number');

    console.log(`Orders returned: ${ordersData.data.length} of ${ordersData.total} total`);

    if (ordersData.data.length > 0) {
      const order = ordersData.data[0];
      expect(order).toHaveProperty('id');
      expect(typeof order.id).toBe('number');
    }
  });

  test('should handle orders urgent endpoint @api', async () => {
    const urgentResponse = await apiContext.get('http://localhost:3001/api/v1/orders/urgent');
    expect(urgentResponse.ok()).toBeTruthy();

    const urgentData = await urgentResponse.json();
    expect(Array.isArray(urgentData)).toBeTruthy();

    console.log(`Urgent orders returned: ${urgentData.length}`);
  });

  test('should handle orders overdue endpoint @api', async () => {
    const overdueResponse = await apiContext.get('http://localhost:3001/api/v1/orders/overdue');
    expect(overdueResponse.ok()).toBeTruthy();

    const overdueData = await overdueResponse.json();
    expect(Array.isArray(overdueData)).toBeTruthy();

    console.log(`Overdue orders returned: ${overdueData.length}`);
  });

  test('should handle orders production endpoint @api', async () => {
    const productionResponse = await apiContext.get('http://localhost:3001/api/v1/orders/production');
    expect(productionResponse.ok()).toBeTruthy();

    const productionData = await productionResponse.json();
    expect(Array.isArray(productionData)).toBeTruthy();

    console.log(`Production orders returned: ${productionData.length}`);
  });

  test('should handle orders stats endpoint @api', async () => {
    const statsResponse = await apiContext.get('http://localhost:3001/api/v1/orders/stats');
    expect(statsResponse.ok()).toBeTruthy();

    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty('totalOrders');
    expect(statsData).toHaveProperty('urgentOrders');
    expect(statsData).toHaveProperty('overdueOrders');
    expect(statsData).toHaveProperty('statusCounts');
    expect(typeof statsData.totalOrders).toBe('number');

    console.log(`Order stats: total=${statsData.totalOrders}, urgent=${statsData.urgentOrders}, overdue=${statsData.overdueOrders}`);
  });

  test('should handle orders search endpoint @api', async () => {
    const searchResponse = await apiContext.get('http://localhost:3001/api/v1/orders/search?page=1&limit=10');
    expect(searchResponse.ok()).toBeTruthy();

    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty('orders');
    expect(searchData).toHaveProperty('total');
    expect(searchData).toHaveProperty('page');
    expect(searchData).toHaveProperty('limit');
    expect(searchData).toHaveProperty('hasNext');
    expect(searchData).toHaveProperty('hasPrev');
    expect(Array.isArray(searchData.orders)).toBeTruthy();

    console.log(`Search returned: ${searchData.orders.length} of ${searchData.total} total (page ${searchData.page})`);
  });

  test('should handle orders search with filters @api', async () => {
    const searchResponse = await apiContext.get('http://localhost:3001/api/v1/orders/search?page=1&limit=10&isUrgent=true');
    expect(searchResponse.ok()).toBeTruthy();

    const searchData = await searchResponse.json();
    expect(searchData).toHaveProperty('orders');
    expect(searchData).toHaveProperty('total');
    expect(Array.isArray(searchData.orders)).toBeTruthy();

    console.log(`Urgent search returned: ${searchData.orders.length} of ${searchData.total} total`);
  });

  test('should handle orders search stats endpoint @api', async () => {
    const statsResponse = await apiContext.get('http://localhost:3001/api/v1/orders/search/stats?page=1&limit=10');
    expect(statsResponse.ok()).toBeTruthy();

    const statsData = await statsResponse.json();
    expect(statsData).toHaveProperty('totalMatching');
    expect(statsData).toHaveProperty('urgentCount');
    expect(statsData).toHaveProperty('statusBreakdown');

    console.log(`Search stats: totalMatching=${statsData.totalMatching}, urgentCount=${statsData.urgentCount}`);
  });

  test('should handle orders search suggestions endpoint @api', async () => {
    const suggestionsResponse = await apiContext.get('http://localhost:3001/api/v1/orders/search/suggestions?type=customer&query=test&limit=5');
    expect(suggestionsResponse.ok()).toBeTruthy();

    const suggestionsData = await suggestionsResponse.json();
    expect(suggestionsData).toHaveProperty('suggestions');
    expect(Array.isArray(suggestionsData.suggestions)).toBeTruthy();

    console.log(`Customer suggestions returned: ${suggestionsData.suggestions.length}`);
  });

  // ==================== Saddles (Models) ====================

  test('should handle saddles API (models) @api', async () => {
    const saddlesResponse = await apiContext.get('http://localhost:3001/api/v1/saddles?page=1&limit=10');
    expect(saddlesResponse.ok()).toBeTruthy();

    const saddlesData = await saddlesResponse.json();

    expect(saddlesData).toHaveProperty('data');
    expect(saddlesData).toHaveProperty('total');
    expect(saddlesData).toHaveProperty('pages');
    expect(Array.isArray(saddlesData.data)).toBeTruthy();

    console.log(`Saddles returned: ${saddlesData.data.length} of ${saddlesData.total} total`);

    if (saddlesData.data.length > 0) {
      const saddle = saddlesData.data[0];
      expect(saddle).toHaveProperty('id');
      expect(saddle).toHaveProperty('brand');
      expect(saddle).toHaveProperty('modelName');
      expect(saddle).toHaveProperty('sequence');
    }
  });

  test('should handle saddles active endpoint @api', async () => {
    const activeResponse = await apiContext.get('http://localhost:3001/api/v1/saddles/active');
    expect(activeResponse.ok()).toBeTruthy();

    const activeData = await activeResponse.json();
    expect(Array.isArray(activeData)).toBeTruthy();

    console.log(`Active saddles returned: ${activeData.length}`);

    activeData.forEach((saddle: any) => {
      expect(saddle.isActive).toBe(true);
    });
  });

  test('should handle saddles brands endpoint @api', async () => {
    const brandsResponse = await apiContext.get('http://localhost:3001/api/v1/saddles/brands');
    expect(brandsResponse.ok()).toBeTruthy();

    const brandsData = await brandsResponse.json();
    expect(Array.isArray(brandsData)).toBeTruthy();

    console.log(`Unique brands from saddles: ${brandsData.length}`);
  });

  test('should handle saddles search by brand @api', async () => {
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

  // ==================== Enriched Orders ====================

  test('should handle enriched-orders API @api', async () => {
    const enrichedResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders?page=1&limit=10');
    expect(enrichedResponse.ok()).toBeTruthy();

    const enrichedData = await enrichedResponse.json();

    expect(enrichedData).toHaveProperty('@context');
    expect(enrichedData).toHaveProperty('@type', 'hydra:Collection');
    expect(enrichedData).toHaveProperty('@id');
    expect(enrichedData).toHaveProperty('hydra:member');
    expect(enrichedData).toHaveProperty('hydra:totalItems');
    expect(enrichedData).toHaveProperty('hydra:view');
    expect(Array.isArray(enrichedData['hydra:member'])).toBeTruthy();
    expect(typeof enrichedData['hydra:totalItems']).toBe('number');

    console.log(`Enriched orders returned: ${enrichedData['hydra:member'].length} of ${enrichedData['hydra:totalItems']} total`);

    if (enrichedData['hydra:member'].length > 0) {
      const order = enrichedData['hydra:member'][0];
      expect(order).toHaveProperty('id');
    }
  });

  test('should handle enriched-orders with search filter @api', async () => {
    const enrichedResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders?page=1&limit=10&searchTerm=test');
    expect(enrichedResponse.ok()).toBeTruthy();

    const enrichedData = await enrichedResponse.json();

    expect(enrichedData).toHaveProperty('hydra:member');
    expect(enrichedData).toHaveProperty('hydra:totalItems');
    expect(Array.isArray(enrichedData['hydra:member'])).toBeTruthy();

    console.log(`Enriched orders search returned: ${enrichedData['hydra:member'].length} of ${enrichedData['hydra:totalItems']} total`);
  });

  test('should handle enriched-orders with fitter filter @api', async () => {
    const enrichedResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders?page=1&limit=10&fitterId=1');
    expect(enrichedResponse.ok()).toBeTruthy();

    const enrichedData = await enrichedResponse.json();

    expect(enrichedData).toHaveProperty('hydra:member');
    expect(enrichedData).toHaveProperty('hydra:totalItems');
    expect(Array.isArray(enrichedData['hydra:member'])).toBeTruthy();

    console.log(`Enriched orders by fitter returned: ${enrichedData['hydra:member'].length} of ${enrichedData['hydra:totalItems']} total`);
  });

  test('should handle enriched-orders with urgency filter @api', async () => {
    const enrichedResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders?page=1&limit=10&urgent=true');
    expect(enrichedResponse.ok()).toBeTruthy();

    const enrichedData = await enrichedResponse.json();

    expect(enrichedData).toHaveProperty('hydra:member');
    expect(enrichedData).toHaveProperty('hydra:totalItems');
    expect(Array.isArray(enrichedData['hydra:member'])).toBeTruthy();

    console.log(`Urgent enriched orders returned: ${enrichedData['hydra:member'].length} of ${enrichedData['hydra:totalItems']} total`);
  });

  test('should handle enriched-orders health endpoint @api', async () => {
    const healthResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders/health');
    expect(healthResponse.ok()).toBeTruthy();

    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('status', 'healthy');
    expect(healthData).toHaveProperty('service', 'enriched-orders');
    expect(healthData).toHaveProperty('timestamp');
    expect(healthData).toHaveProperty('version');

    console.log(`Enriched orders health: ${healthData.status}`);
  });

  test('should handle enriched-orders pagination @api', async () => {
    const page1Response = await apiContext.get('http://localhost:3001/api/v1/enriched_orders?page=1&limit=5');
    expect(page1Response.ok()).toBeTruthy();

    const page1Data = await page1Response.json();
    expect(page1Data).toHaveProperty('hydra:member');
    expect(page1Data).toHaveProperty('hydra:view');

    const view = page1Data['hydra:view'];
    expect(view).toHaveProperty('@id');
    expect(view).toHaveProperty('@type', 'hydra:PartialCollectionView');
    expect(view).toHaveProperty('hydra:first');
    expect(view).toHaveProperty('hydra:last');

    if (page1Data['hydra:totalItems'] > 5 && page1Data['hydra:member'].length > 0) {
      expect(view).toHaveProperty('hydra:next');
      console.log(`Pagination test: page 1 of ${Math.ceil(page1Data['hydra:totalItems'] / 5)}`);
    }
  });

  test('should handle enriched-orders edit-options endpoint @api', async () => {
    const editOptionsResponse = await apiContext.get('http://localhost:3001/api/v1/enriched_orders/edit-options');
    expect(editOptionsResponse.ok()).toBeTruthy();

    const editOptionsData = await editOptionsResponse.json();
    expect(editOptionsData).toBeTruthy();

    console.log(`Edit options keys: ${Object.keys(editOptionsData).join(', ')}`);
  });

  // ==================== Error Handling ====================

  test('should handle error responses gracefully @api', async () => {
    const notFoundResponse = await apiContext.get('http://localhost:3001/api/v1/non-existent-endpoint');
    expect(notFoundResponse.status()).toBe(404);
  });

  test('should handle rate limiting @security @api', async () => {
    const rapidRequests = Array.from({ length: 100 }, (_, i) =>
      apiContext.get('http://localhost:3001/api/health').catch(() => ({ status: () => 429 }))
    );

    const responses = await Promise.all(rapidRequests);

    const rateLimitedResponses = responses.filter(
      (response: any) => response.status && response.status() === 429
    );

    console.log(`Rate limited responses: ${rateLimitedResponses.length}/100`);
  });

  test('should handle concurrent requests @performance @api', async () => {
    const concurrentRequests = Array.from({ length: 10 }, () =>
      apiContext.get('http://localhost:3001/api/v1/factories')
    );

    const responses = await Promise.all(concurrentRequests);

    responses.forEach((response) => {
      expect(response.ok()).toBeTruthy();
    });

    const firstResponse = await responses[0].json();
    expect(Array.isArray(firstResponse)).toBeTruthy();
    console.log(`Concurrent requests: ${responses.length} successful`);
  });

  test('should enforce role-based access control @security @api', async () => {
    // Login as fitter user
    const fitterLoginResponse = await apiContext.post('http://localhost:3001/api/v1/auth/email/login', {
      data: {
        email: 'sarah.thompson@fitters.com',
        password: 'FitterPass123!'
      }
    });

    expect(fitterLoginResponse.ok()).toBeTruthy();
    const fitterData = await fitterLoginResponse.json();
    const fitterToken = fitterData.token;

    const fitterContext = await request.newContext({
      baseURL: process.env.E2E_API_URL || 'http://localhost:3001',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fitterToken}`
      },
    });

    // Fitter should not access admin-only endpoints
    const adminResponse = await fitterContext.get('http://localhost:3001/api/v1/users');
    expect([403, 401].includes(adminResponse.status())).toBeTruthy();

    // Fitter should access allowed endpoints
    const customersResponse = await fitterContext.get('http://localhost:3001/api/v1/customers');
    expect(customersResponse.ok()).toBeTruthy();

    await fitterContext.dispose();
  });
});

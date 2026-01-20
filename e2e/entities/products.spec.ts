import { test, expect, request } from '@playwright/test';

/**
 * 📦 Product Entities E2E Tests
 * 🎯 Testing all product-related entities (Brands, Models, Leathertypes, Options, Extras, Presets, Products)
 * 🚀 NestJS backend API validation
 */

test.describe('Product Entities API @products @critical', () => {
  let apiContext: any;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context
    apiContext = await playwright.request.newContext({
      baseURL: process.env.E2E_API_URL || 'http://localhost:3001/api',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'OMS-E2E-Tests/1.0.0'
      },
      ignoreHTTPSErrors: true,
    });
  });

  test.beforeEach(async () => {
    // Authenticate and get token for protected endpoints
    const loginResponse = await apiContext.post('/auth/email/login', {
      data: {
        email: 'admin@example.com',
        password: 'secret'
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;

    // Set authorization header for subsequent requests
    apiContext = await request.newContext({
      baseURL: process.env.E2E_API_URL || 'http://localhost:3001/api',
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

  test('should CRUD brands via API @brands @critical', async () => {
    // CREATE: Create new brand
    const createBrandResponse = await apiContext.post('/brands', {
      data: {
        name: 'E2E Test Brand',
        description: 'A test brand for E2E testing'
      }
    });

    expect(createBrandResponse.ok()).toBeTruthy();
    const createdBrand = await createBrandResponse.json();
    expect(createdBrand).toHaveProperty('id');
    expect(createdBrand.name).toBe('E2E Test Brand');
    expect(createdBrand.description).toBe('A test brand for E2E testing');

    const brandId = createdBrand.id;

    // READ: Get brand by ID
    const getBrandResponse = await apiContext.get(`/brands/${brandId}`);
    expect(getBrandResponse.ok()).toBeTruthy();
    const retrievedBrand = await getBrandResponse.json();
    expect(retrievedBrand.id).toBe(brandId);
    expect(retrievedBrand.name).toBe('E2E Test Brand');

    // UPDATE: Update brand
    const updateBrandResponse = await apiContext.patch(`/brands/${brandId}`, {
      data: {
        name: 'Updated E2E Test Brand',
        description: 'Updated description for E2E testing'
      }
    });

    expect(updateBrandResponse.ok()).toBeTruthy();
    const updatedBrand = await updateBrandResponse.json();
    expect(updatedBrand.name).toBe('Updated E2E Test Brand');
    expect(updatedBrand.description).toBe('Updated description for E2E testing');

    // DELETE: Delete brand
    const deleteBrandResponse = await apiContext.delete(`/brands/${brandId}`);
    expect(deleteBrandResponse.ok()).toBeTruthy();

    // Verify deletion
    const getDeletedBrandResponse = await apiContext.get(`/brands/${brandId}`);
    expect(getDeletedBrandResponse.status()).toBe(404);
  });

  test('should CRUD models via API @models @critical', async () => {
    // First create a brand to associate with the model
    const createBrandResponse = await apiContext.post('/brands', {
      data: {
        name: 'Test Brand for Model',
        description: 'Brand for model testing'
      }
    });
    const brand = await createBrandResponse.json();

    // CREATE: Create new model
    const createModelResponse = await apiContext.post('/models', {
      data: {
        name: 'E2E Test Model',
        brandId: brand.id,
        description: 'A test model for E2E testing'
      }
    });

    expect(createModelResponse.ok()).toBeTruthy();
    const createdModel = await createModelResponse.json();
    expect(createdModel).toHaveProperty('id');
    expect(createdModel.name).toBe('E2E Test Model');
    expect(createdModel.brandId).toBe(brand.id);

    const modelId = createdModel.id;

    // READ: Get model by ID
    const getModelResponse = await apiContext.get(`/models/${modelId}`);
    expect(getModelResponse.ok()).toBeTruthy();
    const retrievedModel = await getModelResponse.json();
    expect(retrievedModel.id).toBe(modelId);
    expect(retrievedModel.name).toBe('E2E Test Model');
    expect(retrievedModel.brandId).toBe(brand.id);

    // UPDATE: Update model
    const updateModelResponse = await apiContext.patch(`/models/${modelId}`, {
      data: {
        name: 'Updated E2E Test Model',
        description: 'Updated model description'
      }
    });

    expect(updateModelResponse.ok()).toBeTruthy();
    const updatedModel = await updateModelResponse.json();
    expect(updatedModel.name).toBe('Updated E2E Test Model');

    // DELETE: Delete model
    const deleteModelResponse = await apiContext.delete(`/models/${modelId}`);
    expect(deleteModelResponse.ok()).toBeTruthy();

    // Clean up brand
    await apiContext.delete(`/brands/${brand.id}`);
  });

  test('should CRUD leathertypes via API @leathertypes @critical', async () => {
    // CREATE: Create new leathertype
    const createLeathertypeResponse = await apiContext.post('/leathertypes', {
      data: {
        name: 'E2E Test Leather',
        description: 'A test leather type for E2E testing'
      }
    });

    expect(createLeathertypeResponse.ok()).toBeTruthy();
    const createdLeathertype = await createLeathertypeResponse.json();
    expect(createdLeathertype).toHaveProperty('id');
    expect(createdLeathertype.name).toBe('E2E Test Leather');

    const leathertypeId = createdLeathertype.id;

    // READ: Get leathertype by ID
    const getLeathertypeResponse = await apiContext.get(`/leathertypes/${leathertypeId}`);
    expect(getLeathertypeResponse.ok()).toBeTruthy();
    const retrievedLeathertype = await getLeathertypeResponse.json();
    expect(retrievedLeathertype.id).toBe(leathertypeId);
    expect(retrievedLeathertype.name).toBe('E2E Test Leather');

    // UPDATE: Update leathertype
    const updateLeathertypeResponse = await apiContext.patch(`/leathertypes/${leathertypeId}`, {
      data: {
        name: 'Updated E2E Test Leather',
        description: 'Updated leather description'
      }
    });

    expect(updateLeathertypeResponse.ok()).toBeTruthy();
    const updatedLeathertype = await updateLeathertypeResponse.json();
    expect(updatedLeathertype.name).toBe('Updated E2E Test Leather');

    // DELETE: Delete leathertype
    const deleteLeathertypeResponse = await apiContext.delete(`/leathertypes/${leathertypeId}`);
    expect(deleteLeathertypeResponse.ok()).toBeTruthy();
  });

  test('should CRUD options via API @options @critical', async () => {
    // CREATE: Create new option
    const createOptionResponse = await apiContext.post('/options', {
      data: {
        name: 'E2E Test Option',
        description: 'A test option for E2E testing',
        optionType: 'stirrups'
      }
    });

    expect(createOptionResponse.ok()).toBeTruthy();
    const createdOption = await createOptionResponse.json();
    expect(createdOption).toHaveProperty('id');
    expect(createdOption.name).toBe('E2E Test Option');
    expect(createdOption.optionType).toBe('stirrups');

    const optionId = createdOption.id;

    // READ: Get option by ID
    const getOptionResponse = await apiContext.get(`/options/${optionId}`);
    expect(getOptionResponse.ok()).toBeTruthy();
    const retrievedOption = await getOptionResponse.json();
    expect(retrievedOption.id).toBe(optionId);
    expect(retrievedOption.name).toBe('E2E Test Option');

    // UPDATE: Update option
    const updateOptionResponse = await apiContext.patch(`/options/${optionId}`, {
      data: {
        name: 'Updated E2E Test Option',
        optionType: 'flaps'
      }
    });

    expect(updateOptionResponse.ok()).toBeTruthy();
    const updatedOption = await updateOptionResponse.json();
    expect(updatedOption.name).toBe('Updated E2E Test Option');
    expect(updatedOption.optionType).toBe('flaps');

    // DELETE: Delete option
    const deleteOptionResponse = await apiContext.delete(`/options/${optionId}`);
    expect(deleteOptionResponse.ok()).toBeTruthy();
  });

  test('should CRUD extras via API @extras @critical', async () => {
    // CREATE: Create new extra
    const createExtraResponse = await apiContext.post('/extras', {
      data: {
        name: 'E2E Test Extra',
        description: 'A test extra for E2E testing',
        price: 99.99
      }
    });

    expect(createExtraResponse.ok()).toBeTruthy();
    const createdExtra = await createExtraResponse.json();
    expect(createdExtra).toHaveProperty('id');
    expect(createdExtra.name).toBe('E2E Test Extra');
    expect(createdExtra.price).toBe(99.99);

    const extraId = createdExtra.id;

    // READ: Get extra by ID
    const getExtraResponse = await apiContext.get(`/extras/${extraId}`);
    expect(getExtraResponse.ok()).toBeTruthy();
    const retrievedExtra = await getExtraResponse.json();
    expect(retrievedExtra.id).toBe(extraId);
    expect(retrievedExtra.name).toBe('E2E Test Extra');

    // UPDATE: Update extra
    const updateExtraResponse = await apiContext.patch(`/extras/${extraId}`, {
      data: {
        name: 'Updated E2E Test Extra',
        price: 149.99
      }
    });

    expect(updateExtraResponse.ok()).toBeTruthy();
    const updatedExtra = await updateExtraResponse.json();
    expect(updatedExtra.name).toBe('Updated E2E Test Extra');
    expect(updatedExtra.price).toBe(149.99);

    // DELETE: Delete extra
    const deleteExtraResponse = await apiContext.delete(`/extras/${extraId}`);
    expect(deleteExtraResponse.ok()).toBeTruthy();
  });

  test('should CRUD presets via API @presets @critical', async () => {
    // CREATE: Create new preset
    const createPresetResponse = await apiContext.post('/presets', {
      data: {
        name: 'E2E Test Preset',
        description: 'A test preset for E2E testing',
        configuration: { seatSize: 17.5, leather: 'calfskin' }
      }
    });

    expect(createPresetResponse.ok()).toBeTruthy();
    const createdPreset = await createPresetResponse.json();
    expect(createdPreset).toHaveProperty('id');
    expect(createdPreset.name).toBe('E2E Test Preset');
    expect(createdPreset.configuration).toEqual({ seatSize: 17.5, leather: 'calfskin' });

    const presetId = createdPreset.id;

    // READ: Get preset by ID
    const getPresetResponse = await apiContext.get(`/presets/${presetId}`);
    expect(getPresetResponse.ok()).toBeTruthy();
    const retrievedPreset = await getPresetResponse.json();
    expect(retrievedPreset.id).toBe(presetId);
    expect(retrievedPreset.name).toBe('E2E Test Preset');

    // UPDATE: Update preset
    const updatePresetResponse = await apiContext.patch(`/presets/${presetId}`, {
      data: {
        name: 'Updated E2E Test Preset',
        configuration: { seatSize: 18.0, leather: 'buffalo' }
      }
    });

    expect(updatePresetResponse.ok()).toBeTruthy();
    const updatedPreset = await updatePresetResponse.json();
    expect(updatedPreset.name).toBe('Updated E2E Test Preset');
    expect(updatedPreset.configuration).toEqual({ seatSize: 18.0, leather: 'buffalo' });

    // DELETE: Delete preset
    const deletePresetResponse = await apiContext.delete(`/presets/${presetId}`);
    expect(deletePresetResponse.ok()).toBeTruthy();
  });

  test('should handle product entity pagination @pagination @api', async () => {
    // Test brands pagination
    const brandsResponse = await apiContext.get('/brands?page=1&limit=10');
    expect(brandsResponse.ok()).toBeTruthy();

    const brandsData = await brandsResponse.json();
    expect(brandsData).toHaveProperty('data');
    expect(brandsData).toHaveProperty('meta');
    expect(brandsData.meta).toHaveProperty('page');
    expect(brandsData.meta).toHaveProperty('limit');
    expect(brandsData.meta).toHaveProperty('total');
    expect(Array.isArray(brandsData.data)).toBeTruthy();
    expect(brandsData.data.length).toBeLessThanOrEqual(10);
  });

  test('should handle product entity filtering @filtering @api', async () => {
    // Test model filtering by brand
    const modelsResponse = await apiContext.get('/models?brandId=1');
    expect(modelsResponse.ok()).toBeTruthy();

    const modelsData = await modelsResponse.json();
    expect(Array.isArray(modelsData.data)).toBeTruthy();

    // Verify all models belong to the specified brand
    if (modelsData.data.length > 0) {
      modelsData.data.forEach((model: any) => {
        expect(model.brandId).toBe(1);
      });
    }
  });

  test('should handle product entity search @search @api', async () => {
    // Test brand search
    const searchResponse = await apiContext.get('/brands?search=test');
    expect(searchResponse.ok()).toBeTruthy();

    const searchData = await searchResponse.json();
    expect(Array.isArray(searchData.data)).toBeTruthy();
  });

  test('should validate product entity relationships @relationships @api', async () => {
    // Create brand and model to test relationship
    const brandResponse = await apiContext.post('/brands', {
      data: {
        name: 'Relationship Test Brand',
        description: 'For testing relationships'
      }
    });
    const brand = await brandResponse.json();

    const modelResponse = await apiContext.post('/models', {
      data: {
        name: 'Relationship Test Model',
        brandId: brand.id,
        description: 'For testing relationships'
      }
    });
    const model = await modelResponse.json();

    // Verify model includes brand relationship
    const modelWithBrandResponse = await apiContext.get(`/models/${model.id}?include=brand`);
    expect(modelWithBrandResponse.ok()).toBeTruthy();
    const modelWithBrand = await modelWithBrandResponse.json();
    expect(modelWithBrand).toHaveProperty('brand');
    expect(modelWithBrand.brand.id).toBe(brand.id);

    // Clean up
    await apiContext.delete(`/models/${model.id}`);
    await apiContext.delete(`/brands/${brand.id}`);
  });
});
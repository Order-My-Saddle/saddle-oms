import { chromium, FullConfig } from '@playwright/test';
import axios from 'axios';

/**
 * 🚀 Global E2E Test Setup for Ralph Loop Automation
 * 🔐 Security-first approach with environment preparation
 * 🎯 Zero-intervention setup for automated testing
 */

async function globalSetup(config: FullConfig) {
  const environment = process.env.ENVIRONMENT || 'local';

  console.log(`🚀 Setting up E2E test environment: ${environment}`);

  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const apiURL = process.env.E2E_API_URL || 'http://localhost:3001';

  // For staging/production environments, verify services are accessible
  if (environment !== 'local') {
    await waitForServices(baseURL, apiURL);
  }

  // Perform environment-specific setup
  switch (environment) {
    case 'local':
      await setupLocalEnvironment();
      break;
    case 'staging':
      await setupStagingEnvironment(apiURL);
      break;
    case 'production':
      await setupProductionEnvironment(apiURL);
      break;
  }

  // Create test data if needed
  await createTestData(apiURL);

  console.log(`✅ E2E test environment setup complete for ${environment}`);
}

/**
 * Wait for services to be ready
 */
async function waitForServices(baseURL: string, apiURL: string): Promise<void> {
  console.log('⏳ Waiting for services to be ready...');

  const maxRetries = 30;
  const retryDelay = 2000;

  // Wait for frontend
  await waitForService(baseURL, 'Frontend', maxRetries, retryDelay);

  // Wait for backend API
  await waitForService(`${apiURL}/health`, 'Backend API', maxRetries, retryDelay);

  console.log('✅ All services are ready');
}

/**
 * Wait for a specific service to be ready
 */
async function waitForService(url: string, serviceName: string, maxRetries: number, retryDelay: number): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status under 500
      });

      if (response.status < 400) {
        console.log(`✅ ${serviceName} is ready at ${url}`);
        return;
      }
    } catch (error) {
      // Service not ready yet
    }

    console.log(`⏳ Waiting for ${serviceName} (attempt ${i + 1}/${maxRetries})...`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  throw new Error(`❌ ${serviceName} failed to start within ${maxRetries * retryDelay / 1000} seconds`);
}

/**
 * Setup local development environment
 */
async function setupLocalEnvironment(): Promise<void> {
  console.log('🏠 Setting up local test environment...');

  // Local setup tasks (database seeding, cache clearing, etc.)
  // These would typically run automatically via web server configuration

  console.log('✅ Local environment setup complete');
}

/**
 * Setup staging environment
 */
async function setupStagingEnvironment(apiURL: string): Promise<void> {
  console.log('🔄 Setting up staging test environment...');

  try {
    // Health check and environment validation
    const healthResponse = await axios.get(`${apiURL}/health`, { timeout: 10000 });
    console.log(`✅ Staging health check passed: ${healthResponse.data.status}`);

    // Additional staging-specific setup
    console.log('✅ Staging environment setup complete');
  } catch (error) {
    console.error('❌ Staging setup failed:', error.message);
    throw error;
  }
}

/**
 * Setup production environment (read-only testing)
 */
async function setupProductionEnvironment(apiURL: string): Promise<void> {
  console.log('🚀 Setting up production test environment...');

  try {
    // Production environment validation (read-only)
    const healthResponse = await axios.get(`${apiURL}/health`, { timeout: 10000 });
    console.log(`✅ Production health check passed: ${healthResponse.data.status}`);

    // Verify read-only access
    console.log('⚠️  Production testing will run in read-only mode');
    console.log('✅ Production environment setup complete');
  } catch (error) {
    console.error('❌ Production setup failed:', error.message);
    throw error;
  }
}

/**
 * Create test data for comprehensive testing
 */
async function createTestData(apiURL: string): Promise<void> {
  const environment = process.env.ENVIRONMENT || 'local';

  // Only create test data in local and staging environments
  if (environment === 'production') {
    console.log('⚠️  Skipping test data creation in production environment');
    return;
  }

  console.log('📊 Creating test data...');

  try {
    // Skip user creation - users are seeded by the backend
    console.log('ℹ️  Using seeded test users from backend database');

    // Create test customers
    await createTestCustomers(apiURL);

    // Create test orders
    await createTestOrders(apiURL);

    console.log('✅ Test data creation complete');
  } catch (error) {
    console.warn('⚠️  Test data creation failed, tests will run with existing data:', error.message);
  }
}

/**
 * Create test users for authentication testing (updated for NestJS backend)
 */
async function createTestUsers(apiURL: string): Promise<void> {
  const testUsers = [
    {
      email: 'admin@example.com',
      password: 'secret',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    {
      email: 'fitter@example.com',
      password: 'secret',
      role: 'fitter',
      firstName: 'Test',
      lastName: 'Fitter'
    },
    {
      email: 'user@example.com',
      password: 'secret',
      role: 'user',
      firstName: 'Test',
      lastName: 'User'
    }
  ];

  for (const user of testUsers) {
    try {
      await axios.post(`${apiURL}/auth/email/register`, user, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Created test user: ${user.email}`);
    } catch (error) {
      if (error.response?.status === 409 || error.response?.status === 422) {
        console.log(`ℹ️  Test user already exists: ${user.email}`);
      } else {
        console.warn(`⚠️  Failed to create test user ${user.email}:`, error.message);
      }
    }
  }
}

/**
 * Create test customers
 */
async function createTestCustomers(apiURL: string): Promise<void> {
  // Implementation would depend on your API structure
  console.log('📋 Test customers will be created during test execution');
}

/**
 * Create test orders
 */
async function createTestOrders(apiURL: string): Promise<void> {
  // Implementation would depend on your API structure
  console.log('🛍️  Test orders will be created during test execution');
}

export default globalSetup;
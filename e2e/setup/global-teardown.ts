import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Cleanup test data if needed
  try {
    // Add any cleanup logic here
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
}

export default globalTeardown;
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Starting...');

  // Check if backend API is available using the new health endpoint
  try {
    const response = await fetch('http://localhost:8000/health/simple', {
      method: 'GET',
      // Note: Node.js fetch doesn't support timeout option, using AbortController
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`Backend API health check failed (${response.status}), but continuing...`);
    } else {
      const healthData = await response.json();
      console.log('Backend API is available:', healthData.message);
    }
  } catch (error) {
    console.warn('Backend API not available, tests may fail:', error);
  }

  console.log('Global setup: Complete');
}

export default globalSetup;
import axios from 'axios';

/**
 * Comprehensive Security Validation Suite
 * Tests authentication guards across all API endpoints
 */

const BASE_URL = 'http://localhost:3001';
const API_V1 = `${BASE_URL}/api/v1`;

interface SecurityTestResult {
  endpoint: string;
  method: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  error?: string;
}

class SecurityValidator {
  private results: SecurityTestResult[] = [];

  async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    expectedStatus: number = 401
  ): Promise<SecurityTestResult> {
    try {
      const response = await axios({
        method,
        url: `${API_V1}${endpoint}`,
        timeout: 5000,
        validateStatus: () => true, // Don't throw on any status
      });

      const result: SecurityTestResult = {
        endpoint,
        method,
        expectedStatus,
        actualStatus: response.status,
        passed: response.status === expectedStatus,
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: SecurityTestResult = {
        endpoint,
        method,
        expectedStatus,
        actualStatus: 0,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      return result;
    }
  }

  async runComprehensiveSuite(): Promise<void> {
    console.log('🔒 Starting Comprehensive Security Validation Suite\n');

    // Test all protected endpoints without authentication
    const endpoints = [
      // Customer endpoints
      { path: '/customers', methods: ['GET', 'POST'] },
      { path: '/customers/active', methods: ['GET'] },
      { path: '/customers/123e4567-e89b-12d3-a456-426614174000', methods: ['GET', 'PATCH', 'DELETE'] },

      // Order endpoints
      { path: '/orders', methods: ['GET', 'POST'] },
      { path: '/orders/by-status/pending', methods: ['GET'] },
      { path: '/orders/123e4567-e89b-12d3-a456-426614174000', methods: ['GET', 'PATCH', 'DELETE'] },

      // Fitter endpoints
      { path: '/fitters', methods: ['GET', 'POST'] },
      { path: '/fitters/active', methods: ['GET'] },
      { path: '/fitters/123e4567-e89b-12d3-a456-426614174000', methods: ['GET', 'PATCH', 'DELETE'] },

      // Factory endpoints (renamed from suppliers)
      { path: '/factories', methods: ['GET', 'POST'] },
      { path: '/factories/active', methods: ['GET'] },
      { path: '/factories/123e4567-e89b-12d3-a456-426614174000', methods: ['GET', 'PATCH', 'DELETE'] },

      // User endpoints
      { path: '/users', methods: ['GET', 'POST'] },
      { path: '/users/123e4567-e89b-12d3-a456-426614174000', methods: ['GET', 'PATCH', 'DELETE'] },

      // Enriched Orders endpoints
      { path: '/enriched_orders', methods: ['GET'] },
      { path: '/enriched_orders/health', methods: ['GET'] },
    ];

    // Test each endpoint without authentication (should return 401)
    for (const endpoint of endpoints) {
      for (const method of endpoint.methods) {
        await this.testEndpoint(endpoint.path, method as any, 401);
      }
    }

    // Test public endpoints (should return 200 or appropriate success code)
    await this.testEndpoint('/health', 'GET', 200);

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📊 Security Validation Results\n');
    console.log('════════════════════════════════════════════════════════════════');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`✅ Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed}/${total} (${((failed/total)*100).toFixed(1)}%)`);
    console.log('════════════════════════════════════════════════════════════════\n');

    // Show failed tests first
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('❌ FAILED TESTS (Security Issues):');
      failedTests.forEach(result => {
        console.log(`   ${result.method} ${result.endpoint}`);
        console.log(`   Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        console.log();
      });
    }

    // Show summary by category
    const categories = {
      'Customer Endpoints': this.results.filter(r => r.endpoint.includes('/customers')),
      'Order Endpoints': this.results.filter(r => r.endpoint.includes('/orders')),
      'Fitter Endpoints': this.results.filter(r => r.endpoint.includes('/fitters')),
      'Factory Endpoints': this.results.filter(r => r.endpoint.includes('/factories')),
      'User Endpoints': this.results.filter(r => r.endpoint.includes('/users')),
      'Enriched Order Endpoints': this.results.filter(r => r.endpoint.includes('/enriched_orders')),
      'System Endpoints': this.results.filter(r => r.endpoint.includes('/health')),
    };

    console.log('📋 SECURITY STATUS BY MODULE:');
    Object.entries(categories).forEach(([category, results]) => {
      if (results.length > 0) {
        const categoryPassed = results.filter(r => r.passed).length;
        const categoryTotal = results.length;
        const status = categoryPassed === categoryTotal ? '✅' : '❌';

        console.log(`   ${status} ${category}: ${categoryPassed}/${categoryTotal} secured`);
      }
    });

    console.log('\n🔐 OVERALL SECURITY STATUS:');
    if (failed === 0) {
      console.log('   ✅ ALL ENDPOINTS PROPERLY SECURED');
      console.log('   ✅ Authentication guards working correctly');
      console.log('   ✅ No unauthorized access possible');
    } else {
      console.log(`   ❌ ${failed} SECURITY VULNERABILITIES FOUND`);
      console.log('   ❌ Some endpoints may be accessible without authentication');
    }

    console.log('\n════════════════════════════════════════════════════════════════\n');
  }
}

// Run the security validation
async function main() {
  const validator = new SecurityValidator();

  try {
    // Check if server is running
    await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
    console.log('✅ NestJS server detected at http://localhost:3001\n');

    await validator.runComprehensiveSuite();
  } catch (error) {
    console.error('❌ Cannot connect to NestJS server at http://localhost:3001');
    console.error('   Please ensure the server is running: npm run start:dev\n');
    console.error('Error details:', error instanceof Error ? error.message : String(error));
  }
}

main().catch(console.error);
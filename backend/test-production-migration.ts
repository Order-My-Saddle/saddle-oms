#!/usr/bin/env ts-node
/**
 * Simplified Production Migration Test
 *
 * Tests the production data import infrastructure without full NestJS setup.
 * Validates that the dual ID system and migration scripts are ready.
 */

import { createConnection, DataSource } from 'typeorm';

interface ProductionMigrationTest {
  testName: string;
  passed: boolean;
  details: string[];
  errors: string[];
}

interface ProductionRecord {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

class ProductionMigrationTestSuite {
  private dataSource: DataSource;

  async run(): Promise<void> {
    console.log('🚀 Starting Production Migration Infrastructure Test...\n');

    try {
      // Connect to database
      await this.connectToDatabase();
      console.log('✅ Database connection established\n');

      const tests: ProductionMigrationTest[] = [];

      // Test 1: Database Schema Validation
      tests.push(await this.testDatabaseSchema());

      // Test 2: Dual ID Infrastructure
      tests.push(await this.testDualIdInfrastructure());

      // Test 3: Migration Support Tables
      tests.push(await this.testMigrationSupportTables());

      // Test 4: Sample Data Import Simulation
      tests.push(await this.testSampleDataImport());

      // Test 5: Production Script Availability
      tests.push(await this.testProductionScriptAvailability());

      this.generateReport(tests);

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    } finally {
      if (this.dataSource) {
        await this.dataSource.destroy();
        console.log('Database connection closed.');
      }
    }
  }

  private async connectToDatabase(): Promise<void> {
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'oms_nest',
      synchronize: false,
      logging: false,
    });

    await this.dataSource.initialize();
  }

  private async testDatabaseSchema(): Promise<ProductionMigrationTest> {
    const test: ProductionMigrationTest = {
      testName: 'Database Schema Validation',
      passed: true,
      details: [],
      errors: []
    };

    try {
      // Check essential tables exist
      const requiredTables = ['customer', 'orders', 'factories', 'user', 'audit_log'];

      for (const table of requiredTables) {
        const exists = await this.dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [table]);

        if (exists[0].exists) {
          test.details.push(`✓ Table '${table}' exists`);
        } else {
          test.passed = false;
          test.errors.push(`✗ Table '${table}' missing`);
        }
      }

      // Check for legacy_id columns
      const tablesWithLegacyId = ['customer', 'orders', 'user'];
      for (const table of tablesWithLegacyId) {
        const hasLegacyId = await this.dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = $1
            AND column_name = 'legacy_id'
          )
        `, [table]);

        if (hasLegacyId[0].exists) {
          test.details.push(`✓ Table '${table}' has legacy_id column`);
        } else {
          test.passed = false;
          test.errors.push(`✗ Table '${table}' missing legacy_id column`);
        }
      }

    } catch (error) {
      test.passed = false;
      test.errors.push(`Database query error: ${error.message}`);
    }

    return test;
  }

  private async testDualIdInfrastructure(): Promise<ProductionMigrationTest> {
    const test: ProductionMigrationTest = {
      testName: 'Dual ID Infrastructure',
      passed: true,
      details: [],
      errors: []
    };

    try {
      // Test UUID generation
      const uuidResult = await this.dataSource.query('SELECT uuid_generate_v4() as uuid');
      if (uuidResult[0].uuid) {
        test.details.push('✓ UUID generation working');
      } else {
        test.passed = false;
        test.errors.push('✗ UUID generation failed');
      }

      // Test legacy ID indexes
      const indexQuery = `
        SELECT indexname FROM pg_indexes
        WHERE tablename IN ('customer', 'orders', 'user')
        AND indexname LIKE '%legacy_id%'
      `;
      const indexes = await this.dataSource.query(indexQuery);

      if (indexes.length > 0) {
        test.details.push(`✓ Found ${indexes.length} legacy_id indexes`);
      } else {
        test.details.push('⚠ No legacy_id indexes found (may affect performance)');
      }

    } catch (error) {
      test.passed = false;
      test.errors.push(`Dual ID test error: ${error.message}`);
    }

    return test;
  }

  private async testMigrationSupportTables(): Promise<ProductionMigrationTest> {
    const test: ProductionMigrationTest = {
      testName: 'Migration Support Tables',
      passed: true,
      details: [],
      errors: []
    };

    try {
      // Check audit_log table
      const auditExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'audit_log'
        )
      `);

      if (auditExists[0].exists) {
        test.details.push('✓ audit_log table exists');
      } else {
        test.passed = false;
        test.errors.push('✗ audit_log table missing');
      }

      // Check factories table (renamed from suppliers)
      const factoriesExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'factories'
        )
      `);

      if (factoriesExists[0].exists) {
        test.details.push('✓ factories table exists');
      } else {
        test.passed = false;
        test.errors.push('✗ factories table missing');
      }

    } catch (error) {
      test.passed = false;
      test.errors.push(`Support tables test error: ${error.message}`);
    }

    return test;
  }

  private async testSampleDataImport(): Promise<ProductionMigrationTest> {
    const test: ProductionMigrationTest = {
      testName: 'Sample Data Import Simulation',
      passed: true,
      details: [],
      errors: []
    };

    try {
      // Simulate importing a production customer record
      const sampleProductionRecord = {
        id: 99999, // High number to avoid conflicts
        name: 'Test Production Customer',
        email: 'test.production@example.com',
        address: '123 Production St',
        city: 'Test City',
        country: 'Test Country',
        status: 'active',
        legacy_id: 99999,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Try to insert with legacy_id
      const insertQuery = `
        INSERT INTO customer (
          id, name, email, address, city, country, status, legacy_id,
          created_at, updated_at
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING id, legacy_id
      `;

      const result = await this.dataSource.query(insertQuery, [
        sampleProductionRecord.name,
        sampleProductionRecord.email,
        sampleProductionRecord.address,
        sampleProductionRecord.city,
        sampleProductionRecord.country,
        sampleProductionRecord.status,
        sampleProductionRecord.legacy_id,
        sampleProductionRecord.created_at,
        sampleProductionRecord.updated_at
      ]);

      if (result[0]?.id && result[0]?.legacy_id) {
        test.details.push('✓ Successfully imported sample production record');
        test.details.push(`✓ Generated UUID: ${result[0].id}`);
        test.details.push(`✓ Preserved legacy_id: ${result[0].legacy_id}`);

        // Clean up test data
        await this.dataSource.query('DELETE FROM customer WHERE legacy_id = $1', [99999]);
        test.details.push('✓ Cleaned up test data');

      } else {
        test.passed = false;
        test.errors.push('✗ Failed to import sample production record');
      }

    } catch (error) {
      test.passed = false;
      test.errors.push(`Sample import error: ${error.message}`);

      // Cleanup on error
      try {
        await this.dataSource.query('DELETE FROM customer WHERE legacy_id = $1', [99999]);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    return test;
  }

  private testProductionScriptAvailability(): ProductionMigrationTest {
    const test: ProductionMigrationTest = {
      testName: 'Production Script Availability',
      passed: true,
      details: [],
      errors: []
    };

    const fs = require('fs');
    const path = require('path');

    try {
      // Check production migration script
      const productionScriptPath = path.join(__dirname, 'src/scripts/production-migration.ts');
      if (fs.existsSync(productionScriptPath)) {
        test.details.push('✓ Production migration script found');
      } else {
        test.passed = false;
        test.errors.push('✗ Production migration script missing');
      }

      // Check dual ID utilities
      const dualIdPath = path.join(__dirname, 'src/utils/dual-id');
      if (fs.existsSync(dualIdPath)) {
        test.details.push('✓ Dual ID utilities directory found');

        const dualIdFiles = fs.readdirSync(dualIdPath);
        test.details.push(`✓ Found ${dualIdFiles.length} dual ID utility files`);
      } else {
        test.passed = false;
        test.errors.push('✗ Dual ID utilities directory missing');
      }

      // Check customer dual ID service
      const customerDualIdPath = path.join(__dirname, 'src/customers/customer-dual-id.service.ts');
      if (fs.existsSync(customerDualIdPath)) {
        test.details.push('✓ Customer dual ID service found');
      } else {
        test.passed = false;
        test.errors.push('✗ Customer dual ID service missing');
      }

    } catch (error) {
      test.passed = false;
      test.errors.push(`Script availability check error: ${error.message}`);
    }

    return test;
  }

  private generateReport(tests: ProductionMigrationTest[]): void {
    console.log('\n📊 PRODUCTION MIGRATION READINESS REPORT');
    console.log('='.repeat(50));

    let totalPassed = 0;
    let totalTests = tests.length;

    tests.forEach((test, index) => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${index + 1}. ${status} ${test.testName}`);

      if (test.passed) {
        totalPassed++;
        test.details.forEach(detail => console.log(`   ${detail}`));
      } else {
        test.errors.forEach(error => console.log(`   ${error}`));
      }
    });

    console.log('\n📈 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tests passed: ${totalPassed}/${totalTests}`);
    console.log(`Success rate: ${Math.round((totalPassed / totalTests) * 100)}%`);

    if (totalPassed === totalTests) {
      console.log('\n🎉 Production migration infrastructure is ready!');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. Set up production database connection');
      console.log('   2. Export production data in compatible format');
      console.log('   3. Run migration in dry-run mode first');
      console.log('   4. Execute full production migration');
      console.log('   5. Validate migrated data integrity');
    } else {
      console.log('\n⚠️  Issues found. Please address them before production migration.');
      process.exit(1);
    }
  }
}

// Load environment variables
require('dotenv').config();

// Run tests if script is executed directly
if (require.main === module) {
  const testSuite = new ProductionMigrationTestSuite();
  testSuite.run().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { ProductionMigrationTestSuite };
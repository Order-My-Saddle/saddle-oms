# Production Data Migration Analysis & Implementation Plan

## Overview

This document provides a comprehensive analysis of the production database (`ordermys_new.sql`) and outlines the migration strategy to integrate production data into the current NestJS backend system.

## Production Database Analysis

### Database Characteristics
- **Source**: MySQL/MariaDB production database
- **File**: `ordermys_new.sql` (355MB compressed dump)
- **Data Volume**: ~7,570 INSERT statements across 21 tables
- **Date Range**: Production data dating back to 2012
- **Character Set**: utf8mb4 with timezone support

### Production Tables Structure

#### Core Business Tables
1. **Orders** - Central order management (main entity)
2. **Customers** - Customer information
3. **Fitters** - Professional fitters/installers
4. **Brands** - Saddle manufacturers (Custom, Icon, Wolfgang)
5. **Saddles** - Product catalog with factory assignments
6. **LeatherTypes** - Material options
7. **Options** - Product configuration choices
8. **OptionsItems** - Specific option values
9. **Presets** - Saved product configurations
10. **PresetsItems** - Individual preset components

#### Supporting Tables
11. **Factories** - Manufacturing facilities by region
12. **FactoryEmployees** - Factory staff management
13. **OrdersInfo** - Detailed order line items
14. **SaddleLeathers** - Saddle-leather combinations
15. **SaddleOptionsItems** - Product-option relationships
16. **Statuses** - Order status definitions
17. **UserTypes** - User role definitions

#### System Tables
18. **Credentials** - User authentication (legacy)
19. **ClientConfirmation** - Customer confirmations
20. **DBlog** - Database operation logs
21. **Log** - Application activity logs

## Schema Comparison: Production vs Current Backend

### Major Structural Differences

| Aspect | Production (MySQL) | Current (PostgreSQL) | Migration Strategy |
|--------|-------------------|---------------------|-------------------|
| **Database** | MySQL/MariaDB | PostgreSQL | Convert syntax and data types |
| **ID Strategy** | Auto-increment integers | UUIDs | **Dual ID System**: Keep legacy_id + generate UUID |
| **Naming Convention** | PascalCase (`CustomerID`) | snake_case (`customer_id`) | Transform field names |
| **Authentication** | Separate `Credentials` table | Integrated `User` entity | Merge into existing User system |
| **Relationships** | Integer foreign keys | UUID foreign keys | Map relationships with dual reference |

### Current Backend Entities Status

#### ✅ Implemented Entities
- **Users** - Modern authentication with roles
- **Customers** - Enhanced with UUID and audit fields
- **Orders** - Advanced order management with JSON specifications
- **Fitters** - Professional fitter profiles
- **Suppliers** - Supplier management (maps to Factories)

#### ⚠️ Missing Product Entities (High Priority)
- **Brands** - Saddle brand management
- **Models** - Product model catalog (maps to Saddles)
- **LeatherTypes** - Material type definitions
- **Options** - Product configuration options
- **Extras** - Additional product features
- **Presets** - Saved product configurations
- **Products** - Master product entity (enhanced Saddles)

## Migration Strategy: Dual ID System

### Core Principle
**Preserve Legacy + Enable Modern**: Maintain full backward compatibility while enabling modern UUID-based architecture.

### Implementation Approach

#### 1. Schema Enhancement
Add `legacy_id` fields to all existing entities:

```sql
-- Example: Enhanced Order entity
ALTER TABLE orders ADD COLUMN legacy_id INTEGER;
ALTER TABLE orders ADD INDEX idx_orders_legacy_id (legacy_id);
```

#### 2. Relationship Mapping
Maintain both legacy integer references and new UUID relationships:

```sql
-- Example: Order-Customer relationship
orders.customer_id (UUID) -> customers.id (UUID)
orders.legacy_customer_id (INTEGER) -> production.Customers.ID (INTEGER)
```

#### 3. Data Transformation Process
1. **Import with Legacy ID**: Insert data preserving original integer IDs
2. **Generate UUIDs**: Create new primary keys for all records
3. **Rebuild Relationships**: Map foreign keys using UUID references
4. **Validate Integrity**: Ensure both ID systems maintain consistency

## Detailed Schema Mappings

### Orders Table Mapping

| Production Field | Type | Current Field | Type | Notes |
|------------------|------|---------------|------|-------|
| `ID` | INT | `legacy_id` | INTEGER | Preserve original ID |
| - | - | `id` | UUID | New primary key |
| `CustomerID` | INT | `legacy_customer_id` | INTEGER | Reference preservation |
| - | - | `customer_id` | UUID | New foreign key |
| `FitterID` | INT | `legacy_fitter_id` | INTEGER | Reference preservation |
| - | - | `fitter_id` | UUID | New foreign key |
| `SaddleID` | INT | `legacy_saddle_id` | INTEGER | Maps to Models entity |
| `OrderTime` | UNIX timestamp | `created_at` | TIMESTAMP | Convert format |
| `OrderData` | TEXT | `saddle_specifications` | JSON | Parse and structure |
| `SpecialNotes` | TEXT | `special_instructions` | TEXT | Direct mapping |
| `PriceSaddle` | DECIMAL | `total_amount` | DECIMAL | Price calculation |

### Customers Table Mapping

| Production Field | Type | Current Field | Type | Notes |
|------------------|------|---------------|------|-------|
| `ID` | INT | `legacy_id` | INTEGER | Preserve original ID |
| - | - | `id` | UUID | New primary key |
| `Name` | VARCHAR(255) | `name` | VARCHAR(255) | Direct mapping |
| `Email` | VARCHAR(300) | `email` | VARCHAR(255) | Direct mapping |
| `Address` | VARCHAR(255) | `address` | TEXT | Enhanced field |
| `City` | VARCHAR(255) | `city` | VARCHAR(100) | Direct mapping |
| `Country` | VARCHAR(255) | `country` | VARCHAR(100) | Direct mapping |
| `FitterID` | INT | `legacy_fitter_id` | INTEGER | Reference preservation |
| - | - | `fitter_id` | UUID | New foreign key |
| `Deleted` | TINYINT | `deleted_at` | TIMESTAMP | Convert boolean to timestamp |

### Fitters Table Mapping

| Production Field | Type | Current Field | Type | Notes |
|------------------|------|---------------|------|-------|
| `ID` | INT | `legacy_id` | INTEGER | Preserve original ID |
| - | - | `id` | UUID | New primary key |
| `UserID` | INT | `legacy_user_id` | INTEGER | Reference preservation |
| - | - | `user_id` | UUID | New foreign key |
| - | - | `specializations` | JSON | New enhanced field |
| - | - | `certifications` | JSON | New enhanced field |
| - | - | `region` | VARCHAR(100) | Extract from address |

## Missing Entity Implementation Plan

### Priority 1: Product Catalog Entities

#### 1. Brands Module
```typescript
// Based on production Brands table
export class BrandEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', unique: true })
  legacyId: number;

  @Column({ name: 'brand_name', type: 'varchar', length: 200 })
  brandName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### 2. Models Module (Maps to Saddles)
```typescript
// Based on production Saddles table
export class ModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', unique: true })
  legacyId: number;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId: string;

  @Column({ name: 'legacy_brand_id', type: 'integer' })
  legacyBrandId: number;

  @Column({ name: 'model_name', type: 'varchar', length: 255 })
  modelName: string;

  @Column({ name: 'presets', type: 'json' })
  presets: Record<string, any>;

  @Column({ name: 'factory_assignments', type: 'json' })
  factoryAssignments: Record<string, number>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
```

## Migration Implementation

### Phase 1: Schema Preparation

#### Step 1.1: Enhance Existing Entities
Add legacy_id fields to all existing entities:

```sql
-- Add legacy ID fields to existing tables
ALTER TABLE customers ADD COLUMN legacy_id INTEGER UNIQUE;
ALTER TABLE orders ADD COLUMN legacy_id INTEGER UNIQUE;
ALTER TABLE fitters ADD COLUMN legacy_id INTEGER UNIQUE;
ALTER TABLE users ADD COLUMN legacy_id INTEGER UNIQUE;

-- Add legacy reference fields
ALTER TABLE orders ADD COLUMN legacy_customer_id INTEGER;
ALTER TABLE orders ADD COLUMN legacy_fitter_id INTEGER;
ALTER TABLE orders ADD COLUMN legacy_saddle_id INTEGER;

-- Add indexes for performance
CREATE INDEX idx_customers_legacy_id ON customers(legacy_id);
CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);
CREATE INDEX idx_fitters_legacy_id ON fitters(legacy_id);
```

#### Step 1.2: Create Missing Entity Modules
Generate the 7 missing product modules using the NestJS boilerplate pattern:

```bash
# Generate missing modules
cd backend
npm run generate:resource:relational # For each: brands, models, leathertypes, options, extras, presets, products
```

### Phase 2: Data Transformation Script

#### MySQL to PostgreSQL Conversion Script

```typescript
// scripts/migrate-production-data.ts
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

interface MigrationOptions {
  dryRun: boolean;
  batchSize: number;
  sqlDumpPath: string;
  table?: string;
  verbose: boolean;
}

class ProductionMigrator {
  constructor() {
    this.pgPool = new Pool({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    });

    this.idMappings = new Map(); // legacyId -> UUID mappings
  }

  async migrateCustomers() {
    console.log('Migrating customers...');

    // Read from SQL dump (you'll parse the INSERT statements)
    const productionCustomers = await this.parseCustomersFromDump();

    for (const customer of productionCustomers) {
      const uuid = uuidv4();

      // Store mapping for relationship rebuilding
      this.idMappings.set(`customer_${customer.ID}`, uuid);

      await this.pgPool.query(`
        INSERT INTO customers (
          id, legacy_id, email, name, address, city, country,
          legacy_fitter_id, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        uuid,
        customer.ID,
        customer.Email || '',
        customer.Name || '',
        customer.Address || '',
        customer.City || '',
        customer.Country || '',
        customer.FitterID || null,
        customer.Deleted ? 'inactive' : 'active',
        new Date(),
        new Date()
      ]);
    }

    console.log(`Migrated ${productionCustomers.length} customers`);
  }

  async migrateFitters() {
    console.log('Migrating fitters...');
    // Similar implementation for fitters
  }

  async migrateOrders() {
    console.log('Migrating orders...');

    const productionOrders = await this.parseOrdersFromDump();

    for (const order of productionOrders) {
      const uuid = uuidv4();

      // Map relationships using stored UUIDs
      const customerUuid = this.idMappings.get(`customer_${order.CustomerID}`);
      const fitterUuid = this.idMappings.get(`fitter_${order.FitterID}`);

      await this.pgPool.query(`
        INSERT INTO orders (
          id, legacy_id, customer_id, legacy_customer_id,
          fitter_id, legacy_fitter_id, legacy_saddle_id,
          order_number, status, total_amount, deposit_paid,
          special_instructions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        uuid,
        order.ID,
        customerUuid,
        order.CustomerID,
        fitterUuid,
        order.FitterID,
        order.SaddleID,
        this.generateOrderNumber(order.ID),
        this.mapOrderStatus(order.OrderStatus),
        order.PriceSaddle || 0,
        order.PriceDeposit || 0,
        order.SpecialNotes || null,
        this.convertUnixTimestamp(order.OrderTime),
        new Date()
      ]);
    }
  }

  generateOrderNumber(legacyId) {
    return `OMS-${String(legacyId).padStart(6, '0')}`;
  }

  mapOrderStatus(legacyStatus) {
    const statusMap = {
      1: 'pending',
      7: 'completed',
      9: 'cancelled',
      11: 'processing'
    };
    return statusMap[legacyStatus] || 'pending';
  }

  convertUnixTimestamp(unixTime) {
    return new Date(unixTime * 1000);
  }
}

// Usage
async function runMigration() {
  const migrator = new ProductionMigrator();

  try {
    await migrator.migrateCustomers();
    await migrator.migrateFitters();
    await migrator.migrateOrders();
    // ... migrate other entities

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
```

### Phase 3: Local Database Setup

#### Step 3.1: Prepare Local Environment
```bash
# Backup current development database
pg_dump -h localhost -U your_user your_db > backup_before_migration.sql

# Create fresh database for migration testing
createdb oms_migration_test

# Run current migrations to set up base schema
cd backend
npm run migration:run
```

#### Step 3.2: Execute Migration
```bash
# Parse SQL dump and run migration
cd backend
npm run migration:production

# Verify data integrity
npm run test:migration
```

### Phase 4: Staging Database Deployment

#### Step 4.1: Digital Ocean PostgreSQL Setup
```bash
# Create managed PostgreSQL cluster
doctl databases create oms-staging --engine pg --version 15 --size db-s-1vcpu-1gb --region nyc3

# Get connection details
doctl databases connection oms-staging --format ConnectionURI

# Set environment variables for staging
export DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

#### Step 4.2: Deploy Schema and Data
```bash
# Run migrations on staging database
DATABASE_URL=$STAGING_DB_URL npm run migration:run

# Execute production data migration on staging
DATABASE_URL=$STAGING_DB_URL npx ts-node -r tsconfig-paths/register scripts/migrate-production-data.ts

# Verify deployment
DATABASE_URL=$STAGING_DB_URL npm run test:migration
```

## Data Validation & Testing

### Validation Test Suite

#### Test 1: Data Integrity Verification
```typescript
// tests/migration/data-integrity.test.ts
describe('Production Data Migration Validation', () => {
  test('should preserve all customer records with legacy IDs', async () => {
    const customers = await customerRepository.find();
    const legacyIds = customers.map(c => c.legacyId);

    expect(legacyIds).toHaveLength(expectedCustomerCount);
    expect(legacyIds.every(id => id !== null)).toBe(true);
    expect(new Set(legacyIds).size).toBe(legacyIds.length); // No duplicates
  });

  test('should maintain order-customer relationships correctly', async () => {
    const orders = await orderRepository.find({ relations: ['customer'] });

    for (const order of orders) {
      if (order.legacyCustomerId) {
        const customer = await customerRepository.findOne({
          where: { legacyId: order.legacyCustomerId }
        });

        expect(customer).toBeTruthy();
        expect(order.customerId).toBe(customer.id);
      }
    }
  });

  test('should convert timestamps correctly', async () => {
    const orders = await orderRepository.find();

    for (const order of orders) {
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.createdAt.getTime()).toBeGreaterThan(new Date('2012-01-01').getTime());
      expect(order.createdAt.getTime()).toBeLessThan(new Date().getTime());
    }
  });
});
```

#### Test 2: Performance Validation
```typescript
// tests/migration/performance.test.ts
describe('Migration Performance Validation', () => {
  test('should query customers by legacy ID efficiently', async () => {
    const start = performance.now();

    const customer = await customerRepository.findOne({
      where: { legacyId: 1 }
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should be under 100ms
    expect(customer).toBeTruthy();
  });

  test('should handle large order queries efficiently', async () => {
    const start = performance.now();

    const orders = await orderRepository.find({
      relations: ['customer', 'fitter'],
      take: 100
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500); // Should be under 500ms
    expect(orders).toHaveLength(100);
  });
});
```

#### Test 3: Business Logic Validation
```typescript
// tests/migration/business-logic.test.ts
describe('Business Logic Validation', () => {
  test('should calculate order totals correctly from legacy data', async () => {
    const orders = await orderRepository.find();

    for (const order of orders) {
      expect(order.totalAmount).toBeGreaterThanOrEqual(0);
      expect(order.depositPaid).toBeGreaterThanOrEqual(0);
      expect(order.balanceOwing).toBe(order.totalAmount - order.depositPaid);
    }
  });

  test('should maintain customer-fitter associations', async () => {
    const customers = await customerRepository.find({
      relations: ['fitter']
    });

    const customersWithFitters = customers.filter(c => c.fitterId);

    for (const customer of customersWithFitters) {
      expect(customer.fitter).toBeTruthy();
      expect(customer.fitter.id).toBe(customer.fitterId);
    }
  });
});
```

## Deployment Procedures

### Local Development Deployment

#### Prerequisites
- PostgreSQL 15+ installed and running
- Node.js 18+ with npm
- Access to production SQL dump file

#### Step-by-Step Deployment

1. **Backup Current Database**
   ```bash
   pg_dump oms_nest_dev > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Reset Development Database**
   ```bash
   dropdb oms_nest_dev && createdb oms_nest_dev
   ```

3. **Run Current Migrations**
   ```bash
   cd backend
   npm run migration:run
   ```

4. **Execute Production Migration**
   ```bash
   # Place ordermys_new.sql in scripts/data/
   node scripts/migrate-production-data.js
   ```

5. **Validate Migration**
   ```bash
   npm run test:migration
   ```

6. **Start Development Server**
   ```bash
   npm run start:dev
   ```

### Staging Environment Deployment

#### Prerequisites
- Digital Ocean managed PostgreSQL cluster
- Environment variables configured
- CI/CD pipeline access

#### Step-by-Step Deployment

1. **Create Staging Database**
   ```bash
   doctl databases create oms-staging-v2 \
     --engine pg \
     --version 15 \
     --size db-s-2vcpu-4gb \
     --region nyc1
   ```

2. **Configure Environment**
   ```bash
   # Set in staging environment
   export DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
   export NODE_ENV="staging"
   export REDIS_URL="redis://staging-redis:6379"
   ```

3. **Deploy Schema**
   ```bash
   # Through CI/CD or manual deployment
   npm run build
   npm run migration:run
   ```

4. **Execute Production Data Migration**
   ```bash
   # Secure upload of production SQL dump
   scp ordermys_new.sql staging-server:/tmp/

   # Run migration on staging
   ssh staging-server 'cd /app && node scripts/migrate-production-data.js'
   ```

5. **Validation and Testing**
   ```bash
   npm run test:e2e:staging
   npm run test:migration:validate
   ```

6. **Performance Optimization**
   ```bash
   # Run database optimization
   npm run db:optimize:indexes
   npm run db:analyze:performance
   ```

## Risk Assessment & Mitigation

### High-Risk Areas

1. **Data Loss During Migration**
   - **Risk**: Accidental data corruption or loss
   - **Mitigation**: Full database backups before each step, rollback procedures

2. **Relationship Mapping Errors**
   - **Risk**: Broken foreign key relationships between entities
   - **Mitigation**: Comprehensive validation tests, dual ID system verification

3. **Performance Degradation**
   - **Risk**: Slow queries due to large dataset
   - **Mitigation**: Proper indexing, query optimization, pagination

4. **Character Encoding Issues**
   - **Risk**: Data corruption during MySQL→PostgreSQL conversion
   - **Mitigation**: UTF-8 validation, character encoding tests

### Low-Risk Areas

1. **Timestamp Conversion**
   - **Risk**: Minor timezone discrepancies
   - **Mitigation**: UTC standardization, timestamp validation

2. **Price Calculation Differences**
   - **Risk**: Floating point precision variations
   - **Mitigation**: Decimal type usage, financial calculation tests

## Success Criteria

### Migration Success Metrics

1. **Data Completeness**: 100% of production records migrated successfully
2. **Relationship Integrity**: All foreign key relationships maintained
3. **Performance**: API response times <100ms for standard queries
4. **Backward Compatibility**: Legacy ID references functional
5. **Test Coverage**: >95% validation test coverage

### Acceptance Testing

- [ ] All production customers migrated with UUIDs and legacy IDs
- [ ] All production orders migrated with correct relationships
- [ ] All production fitters mapped to user accounts
- [ ] New product entities created for brands, models, etc.
- [ ] API endpoints functional with production data
- [ ] Performance benchmarks met for large datasets
- [ ] Rollback procedures tested and verified

## Timeline & Resources

### Estimated Timeline: 5-7 Days

**Day 1-2: Schema Preparation**
- Add legacy_id fields to existing entities
- Create missing product entity modules
- Set up migration infrastructure

**Day 3-4: Data Migration Implementation**
- Develop MySQL→PostgreSQL conversion script
- Test migration on sample data
- Implement validation test suite

**Day 5-6: Local and Staging Deployment**
- Execute full local migration
- Deploy to staging environment
- Performance optimization and testing

**Day 7: Validation and Documentation**
- Comprehensive validation testing
- Documentation finalization
- Rollback procedure verification

### Required Resources

- **Database Administrator**: PostgreSQL optimization and monitoring
- **Backend Developer**: NestJS entity creation and API testing
- **DevOps Engineer**: Staging environment setup and CI/CD integration
- **QA Engineer**: Validation testing and acceptance criteria verification

## Conclusion

This migration plan provides a comprehensive, low-risk approach to integrating production data into the current NestJS backend system. The dual ID strategy ensures zero data loss while enabling modern UUID-based architecture. With proper execution of the outlined phases, the migration will preserve all historical data while positioning the system for scalable future growth.

The plan prioritizes data integrity, performance, and backward compatibility while providing clear rollback procedures for risk mitigation. Upon completion, the system will have full production data available in a modern, maintainable architecture ready for continued development.
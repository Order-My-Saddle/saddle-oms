# PostgreSQL Data Migration Plan

## Goal
Migrate production data from MySQL legacy system to DigitalOcean PostgreSQL staging database with local Docker validation.

## Overview

**Source**: MySQL legacy data in `/backend/src/database/seeds/relational/production-data/mysql-legacy/`
**Target**: DigitalOcean PostgreSQL (`db-postgresql-ams3-15342-do-user-16166643-0.l.db.ondigitalocean.com`)
**Database**: `oms_staging`

**Data Volumes**:
| Entity | Records |
|--------|---------|
| Users | 361 |
| Fitters | 282 |
| Customers | 27,279 |
| Orders | 48,142 |
| Brands | 3 |
| Saddles/Models | 109 |
| Leather Types | 85 |
| Options | 52 |
| Statuses | 16 |
| Factories | 7 |
| **Total** | ~76,000+ |

---

## Current Database State (DISCOVERED)

**Existing container**: `backend-postgres-1` running on port 5432

**Migrations status** (from `npm run typeorm migration:show`):
| Status | Migration | Purpose |
|--------|-----------|---------|
| [X] RUN | `UpdatedMigration1767881919175` | Core schema |
| [X] RUN | `EnableRLSSecurityPolicies1767882102681` | RLS policies |
| [X] RUN | `EnhanceFitterEntityWithProductionFields1767964694108` | Fitter fields |
| [X] RUN | `SimpleProductionMigration1767981946290` | Production fields |
| [X] RUN | `SimplifyBrandsEntity1767988092278` | Brands refinements |
| [ ] PENDING | `CreateCommentTable1736600000000` | Comment table |
| [ ] PENDING | `CreateCountryManagerTable1736611200000` | Country manager |
| [ ] PENDING | `AddMissingEntities1768162207868` | **Creates: saddles, leather_types, presets, extras** |

**Data already imported**:
| Entity | Total | With legacy_id | Notes |
|--------|-------|----------------|-------|
| Users | 365 | 340 | 25 seed + 340 MySQL |
| Customers | 27,081 | 27,060 | MySQL import done |
| Orders | 48,242 | 48,142 | MySQL import done |
| Fitters | 269 | 269 | MySQL import done |

**PROBLEM**: Tables `saddles`, `leather_types`, `presets`, `extras` DO NOT EXIST because `AddMissingEntities` migration hasn't run!

---

## Phase 1: Run Pending Migrations (REQUIRED FIRST)

### 1.1 Check Pending Migration Conflicts

Tables `comment` and `country_manager` already exist but their migrations haven't run. Need to handle carefully.

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Check current status
npm run typeorm -- migration:show -d src/database/data-source.ts
```

### 1.2 Run Pending Migrations (CHOSEN APPROACH)

Since `comment` and `country_manager` tables already exist, we need to handle conflicts:

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Step 1: Try running migrations
npm run migration:run

# If CreateCommentTable or CreateCountryManagerTable fail with "table already exists":
# Drop the conflicting tables first, then re-run migrations
docker exec backend-postgres-1 psql -U postgres -d oms_nest -c "DROP TABLE IF EXISTS comment CASCADE;"
docker exec backend-postgres-1 psql -U postgres -d oms_nest -c "DROP TABLE IF EXISTS country_manager CASCADE;"

# Re-run migrations
npm run migration:run
```

### 1.3 Verify Migrations Created Required Tables

```bash
# Check that new tables exist
docker exec backend-postgres-1 psql -U postgres -d oms_nest -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('saddles', 'leather_types', 'presets', 'preset_items', 'extras', 'comment', 'country_manager');"

# Expected output: 7 tables
```

### 1.4 Configure Local Environment

Ensure `backend/.env` file has local PostgreSQL settings:
```
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=oms_nest
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
```

### 1.3 Run Database Migrations FIRST (Creates Schema)

**CRITICAL**: Migrations MUST run BEFORE data import - they create all table structures.

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Run all pending migrations to create schema
npm run migration:run
```

**Migration files location**: `src/database/migrations/` (8 migration files)

| Migration | Purpose |
|-----------|---------|
| `1767881919175-UpdatedMigration` | Core schema (users, orders, customers, fitters, factories, brands, models, options, status) |
| `1767882102681-EnableRLSSecurityPolicies` | Row Level Security policies |
| `1767964694108-EnhanceFitterEntityWithProductionFields` | Fitter entity production fields |
| `1767981946290-SimpleProductionMigration` | Additional production fields |
| `1767988092278-SimplifyBrandsEntity` | Brands table refinements |
| `1768162207868-AddMissingEntities` | Creates: `saddles`, `leather_types`, `presets`, `preset_items`, `extras`, `warehouse`, `order_line`, `order_product_saddle`, `comment`, `country_manager`, `access_filter_group` |
| `1736600000000-CreateCommentTable` | Comment table |
| `1736611200000-CreateCountryManagerTable` | Country manager table |

**Tables created by migrations**:
- Core: `user`, `role`, `orders`, `customer`, `fitter`, `factory`, `factory_employee`
- Products: `brands`, `models`, `options`, `status`, `saddles`, `leather_types`, `extras`, `presets`, `preset_items`
- Order details: `order_line`, `order_product_saddle`, `comment`
- System: `warehouse`, `country_manager`, `access_filter_group`

---

## Phase 2: Import Remaining Data (After Migrations)

**Already imported** (skip these unless re-importing):
- Users: 340 records with legacy_id
- Customers: 27,060 records with legacy_id
- Orders: 48,142 records with legacy_id
- Fitters: 269 records with legacy_id

**Need to import** (tables just created by migrations):
- Leather types → `leather_types` table
- Options → `options` table (may need update)
- Saddles → `saddles` table
- Presets → `presets` table
- Extras → `extras` table
- Factory employees → `factory_employees` table

### 2.0 Dry-Run First (Validate Without Executing)

Run scripts with `--dry-run` flag for entities that need importing:

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Dry-run for entities that still need importing
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=leather-types --dry-run
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=saddles --dry-run
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=factory-employees --dry-run

# Optional: Re-run these if data is incomplete
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=options --dry-run
```

### 2.1 Import Execution Order (for remaining entities)

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Import entities into newly created tables (after migrations run)

# Step 1: Leather Types → leather_types table
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=leather-types

# Step 2: Saddles → saddles table (depends on brands which already exist)
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=saddles

# Step 3: Factory Employees → factory_employees table
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=factory-employees

# Step 4: (Optional) Update options if data is incomplete
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=options
```

### 2.2 Full Re-Import (If Starting Fresh)

If you need to re-import ALL data (after clean database):

```bash
# Step 1: Users (no dependencies)
npx ts-node -r tsconfig-paths/register scripts/import-production-users.ts

# Step 2: Statuses (no dependencies)
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=statuses

# Step 3: Fitters (depends on users)
npx ts-node -r tsconfig-paths/register scripts/import-production-data.ts --entity=fitters

# Step 4: Customers (depends on fitters)
npx ts-node -r tsconfig-paths/register scripts/import-production-data.ts --entity=customers

# Step 5: Brands (no dependencies)
npx ts-node -r tsconfig-paths/register scripts/import-production-data.ts --entity=brands

# Step 6: Orders (depends on customers, fitters)
npx ts-node -r tsconfig-paths/register scripts/import-production-data.ts --entity=orders

# Step 7: Leather Types
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=leather-types

# Step 8: Options
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=options

# Step 9: Saddles (depends on brands)
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=saddles

# Step 10: Factories
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=factories

# Step 11: Factory Employees (depends on factories)
npx ts-node -r tsconfig-paths/register scripts/import-remaining-data.ts --entity=factory-employees
```

---

## Phase 3: Validation

### 3.1 Run Comprehensive Validation Script

```bash
npx ts-node -r tsconfig-paths/register scripts/validate-comprehensive-migration.ts
```

### 3.2 Manual Validation Queries

Connect to local PostgreSQL and verify counts:

```sql
-- Via Adminer at http://localhost:8080 or psql

-- User counts
SELECT COUNT(*) FROM "user";  -- Expected: 361

-- Fitter counts
SELECT COUNT(*) FROM fitter;  -- Expected: 282

-- Customer counts
SELECT COUNT(*) FROM customer;  -- Expected: 27,279

-- Order counts
SELECT COUNT(*) FROM orders;  -- Expected: 48,142

-- Brand counts
SELECT COUNT(*) FROM brands;  -- Expected: 3

-- Model/Saddle counts
SELECT COUNT(*) FROM models;  -- Expected: 109

-- Status counts
SELECT COUNT(*) FROM status;  -- Expected: 16

-- Leather type counts
SELECT COUNT(*) FROM leather_type;  -- Expected: 85

-- Options counts
SELECT COUNT(*) FROM options;  -- Expected: 52
```

### 3.3 Verify Foreign Key Relationships

```sql
-- Verify fitter-user linkage
SELECT COUNT(*) FROM fitter WHERE user_id IS NOT NULL;

-- Verify customer-fitter linkage
SELECT COUNT(*) FROM customer WHERE fitter_id IS NOT NULL;

-- Verify order-customer linkage
SELECT COUNT(*) FROM orders WHERE customer_id IS NOT NULL;

-- Check for orphaned records
SELECT COUNT(*) FROM orders WHERE customer_id NOT IN (SELECT id FROM customer);
```

### 3.4 Compare Against MySQL Legacy Data

Cross-reference counts with MySQL legacy data files:
- `/mysql-legacy/data/core-business/customers.sql`
- `/mysql-legacy/data/core-business/orders.sql`
- `/mysql-legacy/data/product-catalog/*.sql`

---

## Phase 4: Export PostgreSQL Seeds

### 4.1 Export Current Data

After successful validation, export for future use:

```bash
npx ts-node -r tsconfig-paths/register scripts/export-postgres-seeds.ts
```

Output will be written to: `/backend/src/database/seeds/relational/production-data/postgres/`

---

## Phase 5: Deploy to DigitalOcean Staging

### 5.1 Configure Staging Environment

Update environment to use DigitalOcean credentials from `.env.staging`:
```bash
export DATABASE_TYPE=postgres
export DATABASE_HOST=db-postgresql-ams3-15342-do-user-16166643-0.l.db.ondigitalocean.com
export DATABASE_PORT=25060  # DigitalOcean managed PostgreSQL SSL port
export DATABASE_NAME=oms_staging
export DATABASE_USERNAME=doadmin
export DATABASE_PASSWORD=<YOUR_STAGING_PASSWORD>
export DATABASE_SSL_ENABLED=true
export DATABASE_REJECT_UNAUTHORIZED=false  # Allow DigitalOcean managed cert
```

**Note**: No backup required - staging can be reset if needed.

### 5.2 Run Migrations on Staging

```bash
cd /Users/in615bac/Library/CloudStorage/ProtonDrive-elky.bachtiar@protonmail.com-folder/OMS_NEXT/oms_nest/backend

# Run migrations on staging
npm run migration:run
```

### 5.3 Execute Production Data Import

Repeat Phase 2 migration steps against staging database (with environment variables set for staging).

### 5.4 Final Staging Validation

Run validation against staging:
```bash
npx ts-node -r tsconfig-paths/register scripts/validate-comprehensive-migration.ts
```

---

## Critical Files

| File | Purpose |
|------|---------|
| `backend/scripts/import-production-users.ts` | User credentials migration |
| `backend/scripts/import-production-data.ts` | Core entities (fitters, customers, brands, orders) |
| `backend/scripts/import-remaining-data.ts` | Product catalog (statuses, leather, options, saddles, factories) |
| `backend/scripts/validate-comprehensive-migration.ts` | Migration validation |
| `backend/scripts/export-postgres-seeds.ts` | Export data to seed files |
| `backend/docker-compose.yaml` | Local Docker services |
| `.env.staging` | DigitalOcean credentials |

---

## Verification Checklist

### Local Docker Test
- [ ] Docker PostgreSQL container running
- [ ] Migrations executed successfully
- [ ] All dry-runs completed without errors
- [ ] All import scripts completed without errors
- [ ] Record counts match expected values
- [ ] Foreign key relationships verified
- [ ] Validation script passes

### DigitalOcean Staging
- [ ] SSL connection to DigitalOcean verified
- [ ] Migrations executed on staging
- [ ] All import scripts completed on staging
- [ ] Record counts match local test
- [ ] Application can connect and query data
- [ ] API endpoints return correct data

---

## Rollback Plan

If migration fails:
1. Local Docker: `docker compose down -v && docker volume rm oms_db-fresh`
2. Staging: Run `migration:revert` or restore from backup

---

## Known Issues & Mitigations

1. **Volume external requirement**: Docker compose expects `oms_db-fresh` volume to exist
   - Solution: `docker volume create oms_db-fresh` before starting

2. **Large dataset memory**: Orders (48K) and Customers (27K) use batch processing
   - Already handled: Scripts process in 500-record batches

3. **SSL for DigitalOcean**: Managed PostgreSQL requires SSL
   - Solution: Set `DATABASE_SSL_ENABLED=true` and `DATABASE_REJECT_UNAUTHORIZED=false`

4. **Dual ID System**: All entities maintain `legacy_id` for traceability
   - Already implemented in migration scripts

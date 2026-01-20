# E2E API Tests

End-to-end API tests for the OMS NestJS backend with focus on migrated production data validation.

## Overview

These tests verify:
- **Data Counts**: Validate that migrated production data is correctly loaded
- **API Endpoints**: Test all main API endpoints with authentication
- **Data Integrity**: Verify relationships and constraints in migrated data
- **API Response Structure**: Validate response formats and data structures

## Quick Start

### Full Test Run (Recommended)

```bash
# From backend directory
npm run test:e2e-api:full
```

This will:
1. Stop any existing E2E containers
2. Start fresh PostgreSQL, Redis, and MailDev containers
3. Run TypeORM migrations
4. Seed the database with test data
5. Import production data (if available)
6. Run all E2E API tests

### Step-by-Step Setup

```bash
# 1. Setup the E2E environment
npm run test:e2e-api:setup

# 2. Run the tests
npm run test:e2e-api

# 3. Teardown when done
npm run test:e2e-api:teardown
```

### Watch Mode

```bash
# First setup the environment
npm run test:e2e-api:setup

# Run tests in watch mode
npm run test:e2e-api:watch
```

## Test Files

| File | Description |
|------|-------------|
| `data-counts.e2e-spec.ts` | Validates data counts in database tables |
| `api-endpoints.e2e-spec.ts` | Tests all API endpoints with authentication |
| `migrated-data-api.e2e-spec.ts` | Verifies migrated data through API |

## Environment Configuration

### Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| PostgreSQL | oms_postgres_e2e | 5434 | Test database |
| Redis | oms_redis_e2e | 6380 | Test cache |
| MailDev | oms_maildev_e2e | 1081/1026 | Test mail server |

### Database Connection

```
Host: 127.0.0.1
Port: 5434
Database: oms_e2e_test
Username: oms_e2e_user
Password: oms_e2e_password
```

### Connect via psql

```bash
psql -h 127.0.0.1 -p 5434 -U oms_e2e_user -d oms_e2e_test
```

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/setup-e2e.sh` | Setup fresh E2E environment |
| `scripts/run-e2e-tests.sh` | Run tests with environment check |
| `scripts/teardown-e2e.sh` | Clean up E2E containers |

### Script Options

```bash
# Setup options
./scripts/setup-e2e.sh              # Full setup with seed data
./scripts/setup-e2e.sh --clean      # Cleanup only
./scripts/setup-e2e.sh --skip-seed  # Setup without seed data

# Test runner options
./scripts/run-e2e-tests.sh              # Run all tests
./scripts/run-e2e-tests.sh --setup      # Setup and run
./scripts/run-e2e-tests.sh --watch      # Watch mode
./scripts/run-e2e-tests.sh data-counts  # Run specific test
```

## Test Credentials

The tests use the following credentials for authentication:

```javascript
{
  email: "adamwhitehouse",
  password: "welcomeAdam!@"
}
```

These credentials are from the NestJS seed data.

## Expected Data Counts

After running migrations and seeds, the database should contain:

| Table | Minimum Count |
|-------|---------------|
| users | 1+ |
| roles | 1+ |
| statuses | 1+ |
| orders | 1+ |
| customers | 1+ |
| fitters | 1+ |
| factories | 1+ |
| brands | 1+ |
| options | 1+ |
| leather_types | 1+ |

With production data imported:

| Table | Expected Count |
|-------|----------------|
| orders | ~48,000 |
| customers | ~27,000 |
| fitters | ~280 |
| factories | ~7 |
| brands | ~3 |

## Troubleshooting

### Docker Not Running

```bash
# Check if containers are running
docker ps | grep oms_.*_e2e

# Restart containers
npm run test:e2e-api:setup
```

### Database Connection Issues

```bash
# Check PostgreSQL is ready
docker exec oms_postgres_e2e pg_isready -U oms_e2e_user -d oms_e2e_test

# View PostgreSQL logs
docker logs oms_postgres_e2e
```

### Authentication Failures

```bash
# Verify users exist
docker exec -i oms_postgres_e2e psql -U oms_e2e_user -d oms_e2e_test -c "SELECT username, email FROM \"user\""
```

### Port Conflicts

If ports 5434, 6380, or 1081 are in use:

```bash
# Find process using port
lsof -i :5434

# Stop conflicting containers
docker stop $(docker ps -q --filter "publish=5434")
```

## CI/CD Integration

For CI pipelines, use:

```bash
npm run test:e2e-api:full
```

This handles the entire setup, test, and teardown process in one command.

## Coverage

The E2E API tests focus on integration testing and do not collect code coverage. For coverage metrics, use the unit tests:

```bash
npm run test:unit:cov
```

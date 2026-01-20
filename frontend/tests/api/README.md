# API Testing Framework

This directory contains comprehensive API tests that test the OrderMySaddle backend exactly as the UI uses it, but without browser dependencies.

## Structure

```
tests/api/
├── auth/                    # Authentication and authorization tests
│   ├── login.test.ts       # Login endpoint testing
│   ├── jwt-validation.test.ts # JWT token validation
│   └── permissions.test.ts  # Role-based permissions
├── entities/               # Entity CRUD operations
│   ├── customers.test.ts   # Customer management API
│   ├── orders.test.ts      # Order management API
│   ├── users.test.ts       # User management API
│   └── ...                 # Other entity tests
├── business-logic/         # Complex business rules
├── shared/                 # Utilities and helpers
│   ├── api-client.ts      # HTTP client with authentication
│   ├── test-data.ts       # Test users and data
│   └── helpers.ts         # Validation and utility functions
└── setup/                  # Test configuration
    └── jest.setup.ts      # Global test setup
```

## Running Tests

```bash
# Run all API tests
npm run test:api

# Run tests in watch mode
npm run test:api:watch

# Run tests with coverage
npm run test:api:coverage

# Run specific test file
npm run test:api auth/login.test.ts
```

## Key Features

### 🔐 Authentication Testing
- Direct login endpoint validation
- JWT token structure and validation
- Role-based permissions testing
- Security vulnerability scanning

### 📊 Entity Management
- CRUD operations on all entities
- OData filtering and pagination
- Data validation and constraints
- Relationship handling

### 🛡️ Security Testing
- SQL injection prevention
- XSS attack prevention
- Authorization boundary testing
- Input validation

### ⚡ Performance Testing
- Response time validation
- Concurrent request handling
- Pagination efficiency

## Test Philosophy

These tests focus on:

1. **API Contract Validation** - Ensuring the API behaves as the UI expects
2. **Security Testing** - Verifying proper authentication and input validation
3. **Data Integrity** - Testing business rules and constraints
4. **Performance** - Ensuring reasonable response times
5. **Error Handling** - Validating proper error responses

## Configuration

- **API Base URL**: `http://localhost:8000` (configurable via `TEST_API_URL` env var)
- **Timeout**: 30 seconds for API calls
- **Test Environment**: Node.js (no browser required)

## Important Notes

⚠️ **Authentication**: Most tests are designed to work without valid credentials, testing the authentication infrastructure itself.

🔧 **Test Data**: Tests use generated test data to avoid conflicts with real data.

🧹 **Cleanup**: Tests include cleanup mechanisms to prevent data pollution.

📈 **Coverage**: Focuses on API behavior rather than UI interaction.

## Adding New Tests

1. Create test file in appropriate directory
2. Import shared utilities:
   ```typescript
   import { ApiClient } from '../shared/api-client';
   import { ENTITY_CONFIGS } from '../shared/test-data';
   import { ApiValidators, HTTP_STATUS } from '../shared/helpers';
   ```
3. Follow existing patterns for authentication and validation
4. Include cleanup in `afterEach` hooks
5. Test both success and error scenarios
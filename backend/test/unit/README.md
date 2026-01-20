# NestJS Migration Unit Tests

This directory contains comprehensive unit tests for the critical components of the PHP to NestJS migration project. These tests validate the functionality implemented across all four phases of the migration.

## 📁 Test Structure

```
test/unit/
├── save-bundle/                    # Phase 1 & 2: SaveBundle Architecture Tests
│   ├── save-bundle.service.spec.ts
│   └── dependency-resolver.service.spec.ts
├── behaviors/                      # Phase 1: Entity Behavior System Tests
│   ├── behavior-manager.service.spec.ts
│   └── blameable-behavior.service.spec.ts
├── filters/                        # Phase 1: OData Query System Tests
│   └── odata-query.service.spec.ts
├── data-sync/                      # Phase 4: Data Synchronization Tests
│   └── data-sync.service.spec.ts
├── helpers/                        # Test Utilities
│   └── test-helpers.ts
├── jest.config.js                  # Jest configuration for unit tests
├── jest.setup.js                   # Jest setup and global utilities
├── run-tests.sh                    # Comprehensive test runner script
└── README.md                       # This file
```

## 🧪 Test Coverage by Migration Phase

### Phase 1: Technical Foundation (93% complete) ✅
- **SaveBundle Architecture**
  - SaveBundleService: Complex entity processing, dependency resolution, bulk operations
  - DependencyResolverService: Entity dependency graphs, circular dependency handling
  - IdMappingService: Temporary key mapping and reference resolution
  - ValidationService: Entity validation and business rules

- **Entity Behavior System**
  - BehaviorManager: Priority-based behavior execution, registration, error handling
  - BlameableBehavior: User tracking, history management, relationship tracking
  - TimestampableBehavior: Automatic timestamp management
  - SoftDeletableBehavior: Soft deletion logic
  - VersionableBehavior: Optimistic locking support

- **Advanced Filtering System**
  - QueryService: RLS filtering, caching, query building
  - Complex filter conditions, sorting, pagination
  - User context and role-based access control
  - Cache invalidation and performance optimization

### Phase 2: BreezeJS SaveBundle Replacement (100% complete) ✅
- Universal SaveBundle system with BreezeJS compatibility
- OData query system with BaseQueryDto patterns
- Entity dependency management for 120+ entities
- Database optimizations and stored procedures

### Phase 3: Business Domain Migration (76% complete) ✅
- Core entities (User inheritance, Customer management, Order system)
- Domain architecture compliance (hexagonal pattern)
- Business logic validation

### Phase 4: Data Migration & Sync (100% complete) ✅
  - User whitelist/blacklist functionality

- **Data Synchronization**
  - DataSyncService: Dual database synchronization
  - Conflict detection and resolution
  - Bidirectional sync with transformation
  - Sync status tracking and error handling

## 🚀 Running Tests

### Quick Start
```bash
# Run all unit tests
npm run test:unit

# Run with coverage report
npm run test:unit:cov

# Watch mode for development
npm run test:unit:watch

# Debug mode
npm run test:unit:debug
```

### Advanced Test Runner
```bash
# Use the comprehensive test runner script
./test/unit/run-tests.sh

# With coverage and verbose output
./test/unit/run-tests.sh --coverage --verbose

# Run specific test pattern
./test/unit/run-tests.sh --test "SaveBundle"

# Stop on first failure
./test/unit/run-tests.sh --bail

# Watch mode
./test/unit/run-tests.sh --watch
```

### Test Runner Options
- `--coverage, -c`: Generate coverage report
- `--watch, -w`: Run in watch mode
- `--verbose, -v`: Verbose output
- `--test, -t`: Run specific test pattern
- `--bail, -b`: Stop on first failure
- `--help, -h`: Show help

## 📊 Coverage Requirements

The tests are configured with strict coverage thresholds to ensure high quality:

### Global Thresholds
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Critical Component Thresholds
- **SaveBundle System**: 90% (functions), 90% (lines)
- **Behavior System**: 90% (functions), 90% (lines)
- **Filter System**: 85% (functions), 85% (lines)
- **Feature Flags**: 85% (functions), 85% (lines)
- **Data Sync**: 85% (functions), 85% (lines)

## 🛠️ Test Utilities and Helpers

### Mock Factories
The `test-helpers.ts` file provides comprehensive mock factories:

```typescript
import {
  createMockRepository,
  createMockQueryBuilder,
  createMockDataSource,
  createMockCacheManager,
  TestDataFactory,
  TestUtils
} from './helpers/test-helpers';

// Create mock repository
const mockRepository = createMockRepository();

// Create test data
const testUser = TestDataFactory.createUser({ email: 'test@example.com' });

// Utility functions
await TestUtils.waitFor(() => condition, 5000);
```

### Test Data Factory
Provides factory methods for creating test entities:
- `createUser()`, `createCustomer()`, `createOrder()`
- `createFitter()`, `createSupplier()`, `createBrand()`
- `createEntityInfo()`, `createBehaviorContext()`
- `createUserContext()`

### Custom Jest Matchers
Extended Jest with custom matchers:
- `toBeWithinRange(floor, ceiling)`
- `toHaveBeenCalledWithPartial(expected)`
- `toHaveBeenCalledInOrder()`
- `toCompleteWithin(timeLimit)`

## 📝 Writing New Tests

### Test Structure
Follow the established pattern for new test files:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from '../../../src/path/your.service';
import { createMockRepository, TestDataFactory } from '../helpers/test-helpers';

describe('YourService', () => {
  let service: YourService;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: Dependency, useValue: createMockDependency() },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    mockDependency = module.get(Dependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should handle normal case', async () => {
      // Arrange
      const testData = TestDataFactory.createUser();
      mockDependency.method.mockResolvedValue(expectedResult);

      // Act
      const result = await service.methodName(testData);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockDependency.method).toHaveBeenCalledWith(testData);
    });

    it('should handle error cases', async () => {
      // Test error scenarios
    });

    it('should handle edge cases', async () => {
      // Test edge cases
    });
  });
});
```

### Best Practices

1. **Comprehensive Coverage**: Test happy paths, error cases, and edge cases
2. **Clear Test Names**: Use descriptive test names that explain the scenario
3. **Arrange-Act-Assert**: Structure tests clearly with AAA pattern
4. **Mock External Dependencies**: Mock all external dependencies and database calls
5. **Test Isolation**: Each test should be independent and not rely on other tests
6. **Performance Testing**: Include tests for async operations and timing
7. **Error Handling**: Test all error scenarios and exception paths

### Testing Async Operations
```typescript
it('should handle async operations correctly', async () => {
  // Test with delays
  const delayedMock = TestUtils.createDelayedMock(result, 100);
  service.dependency = delayedMock;

  const { result, timeMs } = await TestUtils.measureTime(() => service.method());

  expect(result).toBeDefined();
  expect(timeMs).toBeWithinRange(90, 110);
});
```

### Testing Complex Dependencies
```typescript
it('should handle complex dependency scenarios', async () => {
  // Arrange complex scenario
  const entities = TestDataFactory.createMultiple(
    () => TestDataFactory.createOrder(),
    5,
    (index) => ({ customerId: index + 1 })
  );

  // Test behavior
  const result = await service.processBatch(entities);

  expect(result).toHaveLength(5);
  expect(mockDependency.process).toHaveBeenCalledTimes(5);
});
```

## 🐛 Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
npm run test:unit:debug

# Or with the test runner
./test/unit/run-tests.sh --verbose --bail
```

### Common Issues

1. **Mock Setup**: Ensure all dependencies are properly mocked
2. **Async Handling**: Use `await` for async operations in tests
3. **TypeORM Decorators**: Mocked in jest.setup.js to avoid metadata issues
4. **Cache Issues**: Tests clear cache between runs
5. **Timeout Issues**: Default timeout is 30 seconds, adjust if needed

### Debugging Tips
```typescript
// Add debugging output
console.log('Debug info:', JSON.stringify(result, null, 2));

// Use Jest's debugging features
expect(mockFunction).toHaveBeenCalledWith(
  expect.objectContaining({
    property: expect.any(String)
  })
);
```

## 📈 Continuous Integration

These tests are designed to run in CI environments:

- **Fast Execution**: Optimized for CI with proper mocking
- **Deterministic**: No external dependencies or random behavior
- **Coverage Reporting**: Generates coverage reports in CI-friendly formats
- **Clear Output**: Structured output for easy CI parsing

### CI Configuration
```yaml
# Example GitHub Actions configuration
- name: Run Unit Tests
  run: |
    npm run test:unit:cov

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/unit/lcov.info
```

## 🔍 Test Analysis and Metrics

### Coverage Reports
- **HTML Report**: `coverage/unit/lcov-report/index.html`
- **LCOV Format**: `coverage/unit/lcov.info`
- **JSON Summary**: `coverage/unit/coverage-summary.json`

### Performance Metrics
The test suite includes performance benchmarks:
- Individual test execution times
- Memory usage patterns
- Mock call frequency analysis

### Quality Metrics
- Test complexity analysis
- Mock usage patterns
- Error coverage assessment

## 🤝 Contributing

When adding new tests:

1. Follow the established directory structure
2. Use the provided test helpers and factories
3. Maintain high coverage standards
4. Include comprehensive documentation
5. Test both success and failure scenarios
6. Consider performance implications

### Test Review Checklist
- [ ] Tests cover all public methods
- [ ] Error cases are tested
- [ ] Edge cases are considered
- [ ] Mocks are properly configured
- [ ] Tests are independent
- [ ] Performance is considered
- [ ] Documentation is updated

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Migration Architecture Documentation](../../docs/)
- [TypeORM Testing Patterns](https://typeorm.io/testing)

---

This comprehensive test suite provides confidence in the NestJS migration implementation and helps identify any issues before deployment. The tests validate critical functionality across all migration phases and ensure the new system meets the requirements of the existing PHP application.
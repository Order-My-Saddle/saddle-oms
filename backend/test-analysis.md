# Backend Test Analysis Report

## Summary

| Metric | Count |
|--------|-------|
| Test Suites Failed | 9 |
| Test Suites Passed | 4 |
| Tests Passed | 88 |
| Tests Failed | 0 |
| Total Time | 34.788s |

**Note**: All 9 failed test suites failed to **compile** (TypeScript errors), not runtime test failures. All 88 tests that did compile passed successfully.

## Failed Test Files

1. `test/unit/rls/rls.service.spec.ts`
2. `test/unit/orders/order.controller.spec.ts`
3. `test/unit/enriched-orders/enriched-orders.service.spec.ts`
4. `test/unit/auth/auth.controller.spec.ts`
5. `test/unit/customers/customer.controller.spec.ts`
6. `test/unit/options/option.service.spec.ts`
7. `test/unit/orders/order.service.spec.ts`
8. `test/unit/brands/brand.service.spec.ts`
9. `test/unit/customers/customer.service.spec.ts`

## Passed Test Files

1. `test/unit/behaviors/behavior-manager.service.spec.ts`
2. `test/unit/simple-validation.spec.ts`
3. `test/unit/behaviors/blameable-behavior.service.spec.ts`
4. `test/unit/auth/auth.service.spec.ts`

## Error Categories

### 1. Type Mismatch: String vs Number (TS2322/TS2345)

The most common issue. Test files use UUID strings for IDs, but DTOs/services expect numbers.

**Affected Properties:**
- `id` - expected `number`, got UUID string
- `customerId` - expected `number`, got UUID string  
- `fitterId` - expected `number`, got UUID string
- `factoryId` - expected `number`, got UUID string
- `brandId` - expected `number`, got UUID string

**Files with this issue:**
- `order.controller.spec.ts`
- `order.service.spec.ts`
- `customer.controller.spec.ts`
- `customer.service.spec.ts`
- `enriched-orders.service.spec.ts`
- `auth.controller.spec.ts`
- `brands.service.spec.ts`
- `options.service.spec.ts`

**Fix**: Change mock data from UUID strings to numeric IDs:
```typescript
// Before (incorrect)
const mockOrder: OrderDto = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  customerId: "123e4567-e89b-12d3-a456-426614174000",
};

// After (correct)
const mockOrder: OrderDto = {
  id: 1,
  customerId: 123,
};
```

### 2. Missing Methods on Service/Repository (TS2339)

Tests reference methods that don't exist on the service or repository interface.

**Missing Methods:**
- `findByLegacyId` - on `CustomerService`, `OrderService`, and their repositories
- `findProductionCustomers` - on `CustomerService` and repository
- `findProductionOrders` - on `OrderService`
- `bulkCreate` - on `OrderService`
- `findWithCustomerAndFitter` - on `IOrderRepository`

**Fix Options:**
1. Implement the missing methods in the services/repositories
2. Remove tests for non-existent functionality
3. Mark tests as `.todo()` or `.skip()` for future implementation

### 3. Variable Used Before Assignment (TS2454)

**File:** `rls.service.spec.ts:9`
```typescript
void _dataSource; // Reserved for direct DataSource testing
```

**Fix**: Initialize the variable or remove the unused declaration.

### 4. Missing Properties in Mock Objects (TS2741)

Mock objects are missing required properties from their type definitions.

**Example from enriched-orders.service.spec.ts:**
- `statusLabel` missing from Order type
- Various optional vs required property mismatches

**Fix**: Add all required properties to mock objects or use `Partial<Type>` where appropriate.

## Recommended Fix Priority

1. **High Priority** - Type mismatches (quick fix, change strings to numbers)
2. **High Priority** - Missing properties in mocks (add required fields)
3. **Medium Priority** - Variable initialization issue (simple fix)
4. **Low Priority** - Missing methods (decide if methods needed or remove tests)

## Quick Fix Commands

To fix the UUID string to number issues in all test files:
```bash
# These need manual review as the context varies
```

## Action Items

- [ ] Update mock data in tests to use numeric IDs instead of UUID strings
- [ ] Initialize `_dataSource` variable in rls.service.spec.ts
- [ ] Add missing required properties to mock objects
- [ ] Decide on `findByLegacyId` and `findProductionCustomers` methods
- [ ] Re-run tests after fixes

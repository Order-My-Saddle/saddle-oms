# Frontend Test Failures Report

**Generated**: 2026-01-14
**Test Summary**: 190 failed, 471 passed, 661 total (23 suites failed, 21 passed)

---

## Categories of Failures

### 1. TEST SUITES THAT FAILED TO RUN (3 suites)
These have import/setup errors preventing them from running at all:
- `__tests__/pages/route-protection/AccountManagementRoutes.test.tsx`
- `__tests__/integration/multiRole.test.tsx`
- `__tests__/security/roleSecurityTests.test.ts`

### 2. PERMISSION/ROLE SYSTEM TESTS (Major - ~60 failures)
These tests expect specific permission configurations that don't match actual implementation.

#### 2.1 Permission Matrix (`__tests__/integration/PermissionMatrix.test.tsx`)
- Missing permission: `screen_saddle_modeling`
- ADMIN role permission expectations don't match
- SUPERVISOR permission expectations don't match

#### 2.2 Account Management Permissions (`__tests__/permissions/accountManagementPermissions.test.ts`)
All 20 tests fail - SUPERVISOR-only permissions expectations:
- ACCOUNT_MANAGEMENT, USER_MANAGEMENT, WAREHOUSE_MANAGEMENT
- USER_PERMISSIONS_VIEW, USER_CREATE, USER_EDIT, USER_DELETE, USER_VIEW
- WAREHOUSE_CREATE, WAREHOUSE_EDIT, WAREHOUSE_DELETE, WAREHOUSE_VIEW
- Security validation tests

#### 2.3 Role Permissions (`__tests__/permissions/rolePermissions.test.ts`)
- `getRoleDisplayName` returns incorrect display names

#### 2.4 useUserRole Hook (`__tests__/permissions/useUserRole.test.ts`)
- Multiple role checks failing for ADMIN and SUPERVISOR

#### 2.5 Screen Access Control (`__tests__/components/role-access/ScreenAccess.test.tsx`)
All role access tests fail:
- User Role Access (2 tests)
- Fitter Role Access (2 tests)
- Supplier Role Access (2 tests)
- Admin Role Access (1 test)
- Supervisor Role Access (1 test)
- Universal Access Screens (1 test)
- Admin-Only Screens (2 tests)

#### 2.6 Navigation Access (`__tests__/components/role-access/NavigationAccess.test.tsx`)
9 tests fail:
- Sidebar logo display
- Saddle modelling section visibility/toggle
- Permission checking integration
- Responsive behavior
- Navigation consistency

#### 2.7 Updated Navigation Structure (`__tests__/components/role-access/UpdatedNavigationStructure.test.tsx`)
6 tests fail:
- Main navigation structure
- SUPERVISOR, ADMIN, USER role access
- Navigation hierarchy consistency

#### 2.8 Role Protected Component (`__tests__/components/role-access/RoleProtectedComponent.test.tsx`)
2 tests fail:
- Order action buttons based on role
- Navigation menu filtering

#### 2.9 Account Management Sidebar (`__tests__/components/role-access/AccountManagementSidebar.test.tsx`)
1 test fails:
- Does not render for admin role

#### 2.10 User Permissions Component (`__tests__/components/role-access/UserPermissions.test.tsx`)
2 tests fail:
- Renders permissions table
- Respects user role context

### 3. SERVICE LAYER TESTS (~35 failures)

#### 3.1 Users Service (`__tests__/services/users.test.ts`)
All 16 tests fail:
- fetchUsers (3 tests)
- createUser (3 tests)
- updateUser (3 tests)
- deleteUser (3 tests)
- Error Handling (2 tests)
- Data Validation (2 tests)

#### 3.2 Warehouses Service (`__tests__/services/warehouses.test.ts`)
All 19 tests fail:
- fetchWarehouses (2 tests)
- createWarehouse (4 tests)
- updateWarehouse (4 tests)
- deleteWarehouse (3 tests)
- Data Validation (3 tests)
- Error Handling (2 tests)
- Filtering and Sorting (3 tests)

#### 3.3 Enriched Orders Service (`__tests__/services/enrichedOrders.test.ts`)
9 tests fail:
- Fitter-Specific Order Filtering (4 tests)
- Multiple Role Scenarios (1 test)
- Filter Processing (2 tests)
- Security Considerations (2 tests)

### 4. COMPONENT TESTS (~80 failures)

#### 4.1 OrdersTable (`__tests__/components/shared/OrdersTable.test.tsx`)
32 tests fail:
- Basic Rendering (2 tests)
- Search Functionality (3 tests)
- Header Filters (2 tests)
- Date Range Filtering (2 tests)
- Action Buttons by Role (10 tests across Admin/Manager/Fitter/User)
- Button Tooltips (1 test)
- Status Rendering (1 test)
- Urgent Orders (1 test)
- Pagination (2 tests)
- Loading/Error States (2 tests)
- Empty States (2 tests)
- Data Transformation (2 tests)
- Filter Data Props (3 tests)

#### 4.2 DataTable (`__tests__/components/shared/DataTable.test.tsx`)
18 tests fail:
- Basic Rendering - maxWidth styles
- Empty States (2 tests)
- Search Functionality (4 tests)
- Pagination (9 tests)
- Table Structure (2 tests)
- Accessibility (1 test)

#### 4.3 TableHeaderFilter (`__tests__/components/shared/TableHeaderFilter.test.tsx`)
1 test fails:
- Handles invalid filter data gracefully

#### 4.4 Dashboard (`__tests__/components/Dashboard.test.tsx`)
7 tests fail:
- Search Functionality - clears search
- Status Card Filtering
- Header Filters - combines filters
- Modal Interactions - edit modal
- Error Handling - empty data
- Performance - debounce and re-renders (2 tests)

#### 4.5 Reports (`__tests__/components/Reports.test.tsx`)
27 tests fail (some duplicated due to test structure):
- Initial Rendering (2 tests)
- Status Filter (4 tests)
- Fitter Filter (2 tests)
- Customer Filter (2 tests)
- Supplier Filter (2 tests)
- Urgent Filter (4 tests)
- Search Functionality (2 tests)
- Combined Filters (4 tests)
- Export Functionality (1 test)
- Pagination (1 test)
- Filter Reset (1 test)
- Role-based Access (3 tests)
- Performance (1 test)

### 5. UTILITY TESTS

#### 5.1 Order Table Columns (`__tests__/utils/orderTableColumns.test.tsx`)
8 tests fail:
- Column Generation (2 tests)
- Seat Size Extraction (1 test)
- Entity Name Extraction (2 tests)
- Error Handling (2 tests)
- Column Width Configuration (1 test)

### 6. INTEGRATION/E2E STYLE TESTS

#### 6.1 Customer Update (`__tests__/customerUpdate.test.ts`)
3 tests fail:
- Successfully update a customer
- Handle cache-proxy errors gracefully
- Handle empty entities response

---

## Root Causes Analysis

### High Priority Issues

1. **Permission System Mismatch**: The tests expect a specific permission matrix structure that differs from the actual implementation. Key missing permission: `screen_saddle_modeling`.

2. **Services Not Implemented**: `users.test.ts` and `warehouses.test.ts` test services that may not exist or have different APIs.

3. **Component Structure Changes**: OrdersTable, DataTable tests expect specific DOM structure that has changed.

4. **Role System Changes**: Tests expect SUPERVISOR-only permissions that may have been changed or not implemented.

### Medium Priority Issues

1. **API Response Format Changes**: enrichedOrders service tests expect different response formats.

2. **Filter System Changes**: Tests expect specific filter implementations.

3. **Navigation Structure**: Tests expect different navigation hierarchy.

---

## Recommended Fix Order

1. **Fix test suite failures first** (3 suites can't even run)
2. **Fix permission system** (affects ~60 tests)
3. **Fix/update service mocks** (users, warehouses services)
4. **Fix component tests** (OrdersTable, DataTable structure)
5. **Fix integration tests** (Dashboard, Reports)

---

## Files to Investigate

### Permission System
- `utils/permissions.ts` or similar
- `hooks/useUserRole.ts`
- `types/user.ts` (Role definitions)

### Services
- `services/users.ts`
- `services/warehouses.ts`
- `services/enrichedOrders.ts`

### Components
- `components/shared/OrdersTable.tsx`
- `components/shared/DataTable.tsx`
- `components/Dashboard.tsx`
- `components/Reports.tsx`

---

## Detailed Error Messages

### Test Suite Failures (Can't Run)

#### 1. AccountManagementRoutes.test.tsx
```
Cannot find module '@/middleware' from '__tests__/pages/route-protection/AccountManagementRoutes.test.tsx'

jest.mock('@/middleware', () => ({
  redirectToUnauthorized: jest.fn()
}));
```
**Fix**: Create middleware file or update test mock path

#### 2. multiRole.test.tsx
```
Could not locate module @/utils/tokenManager mapped as:
frontend/utils/$1

jest.mock('@/utils/tokenManager');
```
**Fix**: Create `utils/tokenManager.ts` or update test mock

#### 3. roleSecurityTests.test.ts
```
ReferenceError: Cannot access 'mockMapRolesToPrimary' before initialization

jest.mock('@/context/AuthContext', () => ({
  mapRolesToPrimary: mockMapRolesToPrimary  // <-- used before defined
}));
```
**Fix**: Move mock variable declaration before jest.mock() call

### Key Function Errors

#### Reports.test.tsx
```
TypeError: (0 , _orderHydration.getSupplierName) is not a function
```
**Fix**: Export `getSupplierName` from orderHydration utility or update imports

---

## Quick Fix Commands

```bash
# Run single test file to debug
cd frontend && npm test -- __tests__/integration/PermissionMatrix.test.tsx

# Run with verbose output
cd frontend && npm test -- --verbose

# Run specific test by name
cd frontend && npm test -- -t "Permission Matrix"

# Update snapshots if needed
cd frontend && npm test -- -u
```

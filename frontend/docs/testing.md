# Testing

This guide covers the comprehensive testing strategy for the OMS frontend, including unit tests, integration tests, and end-to-end testing with Jest, React Testing Library, and Playwright.

## 🧪 Testing Strategy

The OMS frontend follows a multi-layered testing approach to ensure reliability and maintainability:

```
E2E Tests (Playwright)     → Full user workflows
Integration Tests (RTL)    → Component interactions
Unit Tests (Jest)          → Individual functions/components
Static Analysis (ESLint)   → Code quality
Type Checking (TypeScript) → Type safety
```

### Testing Pyramid

```
     /\     E2E Tests (Few, Slow, High Confidence)
    /  \
   /____\   Integration Tests (Some, Medium Speed)
  /      \
 /________\ Unit Tests (Many, Fast, Low-Level)
/__________\ Static Analysis & Types (Continuous)
```

## 🛠️ Testing Tools & Configuration

### Core Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing framework
- **MSW**: API mocking for integration tests
- **Testing Library User Events**: User interaction simulation

### Jest Configuration

Located in `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/store/(.*)$': '<rootDir>/store/$1',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Jest Setup

Located in `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from '@jest/globals'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Cleanup after each test
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})
```

## 🔬 Unit Testing

### Component Testing Patterns

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
```

### Service Testing

```typescript
// __tests__/services/customers.test.ts
import { fetchCustomers, createCustomer } from '@/services/customers'
import { ApiError } from '@/utils/errors'

// Mock fetch
global.fetch = jest.fn()

describe('Customer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchCustomers', () => {
    test('returns paginated customer data', async () => {
      const mockResponse = {
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const result = await fetchCustomers(1, 10, { name: 'John' })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    test('throws error on failed request', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(fetchCustomers()).rejects.toThrow(ApiError)
    })
  })

  describe('createCustomer', () => {
    test('creates customer successfully', async () => {
      const newCustomer = {
        name: 'New Customer',
        email: 'new@example.com',
      }

      const createdCustomer = {
        id: '3',
        ...newCustomer,
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdCustomer),
      })

      const result = await createCustomer(newCustomer)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customers'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newCustomer),
        })
      )
      expect(result).toEqual(createdCustomer)
    })
  })
})
```

### Hook Testing

```typescript
// __tests__/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'jotai'
import { useAuth } from '@/hooks/useAuth'
import * as authService from '@/services/auth'

// Mock auth service
jest.mock('@/services/auth')

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('handles login successfully', async () => {
    const mockAuthResponse = {
      token: 'mock-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
      },
    }

    ;(authService.login as jest.Mock).mockResolvedValueOnce(mockAuthResponse)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.login({
        username: 'testuser',
        password: 'password',
      })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockAuthResponse.user)
  })

  test('handles logout correctly', async () => {
    ;(authService.logout as jest.Mock).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  test('checks user roles correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })

    // Set user with ADMIN role
    act(() => {
      result.current.user = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
      }
    })

    expect(result.current.hasRole(['ADMIN'])).toBe(true)
    expect(result.current.hasRole(['USER'])).toBe(false)
  })
})
```

## 🔗 Integration Testing

### Component Integration Tests

```typescript
// __tests__/integration/OrderManagement.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import { OrderManagement } from '@/components/OrderManagement'
import { server } from '../mocks/server'

describe('OrderManagement Integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test('loads and displays orders', async () => {
    render(
      <Provider>
        <OrderManagement />
      </Provider>
    )

    // Loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('Order #12345')).toBeInTheDocument()
    })

    // Check order data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  test('filters orders by status', async () => {
    render(
      <Provider>
        <OrderManagement />
      </Provider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Order #12345')).toBeInTheDocument()
    })

    // Open status filter
    fireEvent.click(screen.getByLabelText('Filter by status'))

    // Select "Completed" status
    fireEvent.click(screen.getByText('Completed'))

    // Verify filter is applied
    await waitFor(() => {
      expect(screen.queryByText('Order #12345')).not.toBeInTheDocument()
      expect(screen.getByText('Order #67890')).toBeInTheDocument()
    })
  })

  test('creates new order', async () => {
    render(
      <Provider>
        <OrderManagement />
      </Provider>
    )

    // Click "New Order" button
    fireEvent.click(screen.getByText('New Order'))

    // Fill order form
    fireEvent.change(screen.getByLabelText('Customer'), {
      target: { value: 'Jane Smith' },
    })

    fireEvent.change(screen.getByLabelText('Product'), {
      target: { value: 'Custom Saddle' },
    })

    // Submit form
    fireEvent.click(screen.getByText('Create Order'))

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Order created successfully')).toBeInTheDocument()
    })

    // Verify new order appears in list
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })
})
```

### API Integration with MSW

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw'

const API_BASE_URL = 'http://localhost:3001'

export const handlers = [
  // Orders endpoints
  rest.get(`${API_BASE_URL}/orders`, (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1'
    const status = req.url.searchParams.get('filter[status]')

    let orders = [
      {
        id: '1',
        orderId: '12345',
        customer: 'John Doe',
        status: 'IN_PROGRESS',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        orderId: '67890',
        customer: 'Jane Smith',
        status: 'COMPLETED',
        createdAt: '2024-01-10',
      },
    ]

    // Apply status filter
    if (status) {
      orders = orders.filter(order => order.status === status)
    }

    return res(
      ctx.json({
        data: orders,
        total: orders.length,
        page: parseInt(page),
        limit: 10,
      })
    )
  }),

  rest.post(`${API_BASE_URL}/orders`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        orderId: '13579',
        ...req.body,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      })
    )
  }),

  // Authentication endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body as any

    if (username === 'testuser' && password === 'password') {
      return res(
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'USER',
            firstName: 'Test',
            lastName: 'User',
          },
        })
      )
    }

    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    )
  }),

  // Error simulation
  rest.get(`${API_BASE_URL}/customers`, (req, res, ctx) => {
    // Simulate network error for testing
    if (req.headers.get('x-test-error') === 'network') {
      return res.networkError('Network error')
    }

    // Simulate server error
    if (req.headers.get('x-test-error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json({ message: 'Internal server error' })
      )
    }

    return res(
      ctx.json({
        data: [
          { id: '1', name: 'Customer 1', email: 'customer1@example.com' },
          { id: '2', name: 'Customer 2', email: 'customer2@example.com' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      })
    )
  }),
]
```

```typescript
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

## 🎭 End-to-End Testing

### Playwright Configuration

Located in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('successful login flow', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('[placeholder="Username"]', 'testuser')
    await page.fill('[placeholder="Password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify user menu is visible
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('failed login shows error message', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.fill('[placeholder="Username"]', 'invaliduser')
    await page.fill('[placeholder="Password"]', 'wrongpassword')

    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')

    // Verify still on login page
    await expect(page).toHaveURL('/login')
  })

  test('logout redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[placeholder="Username"]', 'testuser')
    await page.fill('[placeholder="Password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')

    // Click logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Sign Out')

    // Verify redirect to login
    await expect(page).toHaveURL('/login')
  })
})
```

```typescript
// e2e/orders/order-management.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsUser } from '../utils/auth-helpers'

test.describe('Order Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'admin', 'admin123')
  })

  test('displays orders list', async ({ page }) => {
    await page.goto('/orders')

    // Wait for orders to load
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()

    // Verify table headers
    await expect(page.locator('th:has-text("Order ID")')).toBeVisible()
    await expect(page.locator('th:has-text("Customer")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()

    // Verify at least one order is displayed
    await expect(page.locator('[data-testid="order-row"]')).toBeVisible()
  })

  test('creates new order', async ({ page }) => {
    await page.goto('/orders')

    // Click "New Order" button
    await page.click('text=New Order')

    // Fill order form
    await page.selectOption('[name="customerId"]', 'customer-1')
    await page.selectOption('[name="productId"]', 'product-1')
    await page.fill('[name="specialInstructions"]', 'Rush order for competition')

    // Submit form
    await page.click('button:has-text("Create Order")')

    // Verify success message
    await expect(page.locator('.success-message')).toContainText('Order created successfully')

    // Verify new order appears in list
    await expect(page.locator('[data-testid="order-row"]').first()).toContainText('customer-1')
  })

  test('filters orders by status', async ({ page }) => {
    await page.goto('/orders')

    // Open status filter
    await page.click('[data-testid="status-filter"]')

    // Select "Completed" status
    await page.click('text=Completed')

    // Wait for filter to apply
    await page.waitForTimeout(1000)

    // Verify only completed orders are shown
    const statusCells = await page.locator('[data-testid="order-status"]').allTextContents()
    statusCells.forEach(status => {
      expect(status).toBe('Completed')
    })
  })

  test('searches orders by customer name', async ({ page }) => {
    await page.goto('/orders')

    // Enter search term
    await page.fill('[data-testid="customer-search"]', 'John Doe')

    // Wait for search results
    await page.waitForTimeout(1000)

    // Verify filtered results
    await expect(page.locator('[data-testid="order-row"]')).toContainText('John Doe')

    // Verify other customers are not shown
    await expect(page.locator('[data-testid="order-row"]')).not.toContainText('Jane Smith')
  })
})
```

### E2E Utilities

```typescript
// e2e/utils/auth-helpers.ts
import { Page, expect } from '@playwright/test'

export async function loginAsUser(page: Page, username: string, password: string) {
  await page.goto('/login')

  await page.fill('[placeholder="Username"]', username)
  await page.fill('[placeholder="Password"]', password)
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
}

export async function loginAsAdmin(page: Page) {
  return loginAsUser(page, 'admin', 'admin123')
}

export async function loginAsFitter(page: Page) {
  return loginAsUser(page, 'fitter', 'fitter123')
}
```

## 📊 Test Coverage & Reports

### Coverage Configuration

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:open": "jest --coverage && open coverage/lcov-report/index.html",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
}
```

### GitHub Actions Integration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start backend service
        run: |
          cd ../backend
          npm ci
          npm run start:dev &
          sleep 30

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🚀 Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
test('should handle order creation', async () => {
  // Arrange
  const orderData = {
    customerId: 'customer-1',
    productId: 'product-1',
  }
  const mockResponse = { id: 'order-1', ...orderData }

  ;(fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValueOnce(mockResponse),
  })

  // Act
  const result = await createOrder(orderData)

  // Assert
  expect(result).toEqual(mockResponse)
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/orders'),
    expect.objectContaining({ method: 'POST' })
  )
})
```

### 2. Test Data Management

```typescript
// __tests__/fixtures/index.ts
export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  firstName: 'Test',
  lastName: 'User',
}

export const mockOrder = {
  id: '1',
  orderId: '12345',
  customerId: 'customer-1',
  status: 'PENDING',
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockCustomer = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
}

// Factory functions for dynamic data
export const createMockOrder = (overrides = {}) => ({
  ...mockOrder,
  ...overrides,
  id: Math.random().toString(36).substr(2, 9),
})
```

### 3. Custom Testing Utilities

```typescript
// __tests__/utils/test-utils.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'jotai'
import { ThemeProvider } from '@/components/theme-provider'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </Provider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### 4. Async Testing Patterns

```typescript
// Testing async operations
test('handles async data loading', async () => {
  const { getByTestId } = render(<AsyncComponent />)

  // Wait for loading state
  expect(getByTestId('loading')).toBeInTheDocument()

  // Wait for data to load
  await waitFor(() => {
    expect(getByTestId('data-content')).toBeInTheDocument()
  })

  // Verify loading state is gone
  expect(queryByTestId('loading')).not.toBeInTheDocument()
})
```

### 5. Error Testing

```typescript
// Testing error states
test('displays error message on API failure', async () => {
  ;(fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  )

  render(<DataComponent />)

  await waitFor(() => {
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })
})
```

## 🔧 Testing Commands

### Development Workflow

```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test file
npm test -- Button.test.tsx

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (CI simulation)
npm run test:all

# Debug specific test
npm test -- --debug Button.test.tsx

# Update snapshots
npm test -- --updateSnapshot
```

### CI/CD Integration

```bash
# Production test pipeline
npm ci                    # Clean install
npm run lint             # Code quality
npm run type-check       # TypeScript validation
npm run test:coverage    # Unit/Integration tests
npm run build            # Build verification
npm run test:e2e         # End-to-end tests
```

## 📋 Testing Checklist

### Unit Tests ✅
- [ ] Component rendering
- [ ] Props handling
- [ ] Event handlers
- [ ] Conditional rendering
- [ ] State changes
- [ ] Hook behavior

### Integration Tests ✅
- [ ] Component interactions
- [ ] API integration
- [ ] Form submissions
- [ ] Navigation flows
- [ ] Error handling
- [ ] Loading states

### E2E Tests ✅
- [ ] Authentication flows
- [ ] Complete user workflows
- [ ] Multi-page navigation
- [ ] Form validations
- [ ] Error scenarios
- [ ] Mobile responsiveness

### Performance Tests ✅
- [ ] Bundle size analysis
- [ ] Rendering performance
- [ ] Memory leaks
- [ ] Network request optimization

## ⚡ Next Steps

For testing specific areas:

- **[Components](./components.md)** - Component testing patterns
- **[API Integration](./api-integration.md)** - Service and API testing
- **[Authentication](./auth.md)** - Auth flow testing
- **[Performance](./performance.md)** - Performance testing strategies
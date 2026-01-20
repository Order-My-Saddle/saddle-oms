# Architecture

This document provides a comprehensive overview of the OMS frontend architecture, including project structure, design patterns, and architectural decisions.

## 🏗️ High-Level Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Authentication│    │   Redis Cache   │
│   (CDN/Local)   │    │   (JWT/Passport)│    │   (Sessions)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Core Framework**
- **Next.js 15**: React framework with App Router
- **React 19**: Component library with concurrent features
- **TypeScript**: Static type checking and development experience

**Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI
- **Lucide React**: Icon library

**State Management**
- **Jotai**: Atomic state management
- **React Hook Form**: Form state management
- **Local Storage**: Persistent client-side storage

## 📁 Project Structure

### Directory Organization

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page (redirects to dashboard)
│   ├── globals.css            # Global styles
│   ├── login/                 # Authentication pages
│   ├── dashboard/             # Main dashboard
│   ├── orders/                # Order management
│   ├── customers/             # Customer management
│   ├── fitters/              # Fitter management
│   ├── suppliers/            # Supplier management
│   ├── users/                # User management
│   └── saddle-modeling/      # Product configuration
├── components/                # React components
│   ├── ui/                   # Base UI components (shadcn/ui)
│   ├── shared/               # Reusable business components
│   ├── forms/                # Form components
│   └── layout/               # Layout components
├── services/                 # API service layer
│   ├── api.ts               # Base API configuration
│   ├── auth.ts              # Authentication services
│   ├── customers.ts         # Customer API calls
│   ├── orders.ts            # Order API calls
│   └── [entity].ts          # Entity-specific services
├── store/                   # Global state management (Jotai)
│   ├── auth.ts             # Authentication atoms
│   ├── ui.ts               # UI state atoms
│   └── [entity].ts         # Entity-specific atoms
├── types/                   # TypeScript type definitions
│   ├── api.ts              # API response types
│   ├── entities.ts         # Business entity types
│   └── ui.ts               # UI component types
├── utils/                   # Utility functions
│   ├── cn.ts               # Class name utility
│   ├── formatting.ts       # Data formatting
│   └── validation.ts       # Input validation
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useEntities.ts      # Generic entity hook
│   └── usePagination.ts    # Pagination hook
├── middleware.ts            # Next.js middleware (auth)
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Design Patterns

### 1. Component Architecture

**Atomic Design Principles**
```
Atoms (ui/)        → Basic UI elements (Button, Input, Badge)
Molecules (shared/) → Reusable combinations (TableHeaderFilter)
Organisms (forms/) → Complex components (EntityTable, OrderForm)
Templates (app/)   → Page layouts and structure
Pages (app/)       → Complete pages with data
```

**Component Hierarchy Example**
```
OrderManagementPage
├── EntityTable
│   ├── TableHeader
│   │   ├── TableHeaderFilter
│   │   └── SortButton
│   ├── TableBody
│   │   ├── TableRow
│   │   └── TableCell
│   └── Pagination
└── OrderModal
    ├── OrderForm
    │   ├── FormField
    │   └── FormButton
    └── Modal (from ui/)
```

### 2. Service Layer Pattern

**Centralized API Management**
```typescript
// Service layer structure
interface EntityService<T> {
  fetch: (page: number, filters: any) => Promise<PaginatedResponse<T>>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

// Generic service implementation
export class BaseEntityService<T> implements EntityService<T> {
  constructor(private endpoint: string) {}

  async fetch(page: number, filters: any = {}) {
    return apiRequest<PaginatedResponse<T>>(`${this.endpoint}`, {
      method: 'GET',
      params: { page, ...buildFilterString(filters) },
    });
  }
}
```

### 3. State Management Architecture

**Jotai Atomic State**
```typescript
// Atom hierarchy
Global Atoms (store/)
├── authAtom         → User authentication state
├── themeAtom        → UI theme preference
└── navigationAtom   → Navigation state

Entity Atoms (store/[entity])
├── entityListAtom   → Entity collection
├── entityFiltersAtom → Current filters
├── entityLoadingAtom → Loading state
└── entityErrorAtom  → Error state

Derived Atoms
├── filteredEntitiesAtom → Computed filtered list
├── entityStatsAtom     → Computed statistics
└── userPermissionsAtom → User-based permissions
```

## 🔄 Data Flow Architecture

### Request/Response Flow

```
1. User Interaction
        ↓
2. Component Event Handler
        ↓
3. Service Function Call
        ↓
4. HTTP Request (fetch)
        ↓
5. Backend API Processing
        ↓
6. Database Query
        ↓
7. Response Back Through Stack
        ↓
8. State Update (Jotai atoms)
        ↓
9. Component Re-render
        ↓
10. UI Update
```

### State Update Flow

```typescript
// Example: Order creation flow
const createOrder = async (orderData: CreateOrderDto) => {
  // 1. Update loading state
  set(orderLoadingAtom, true);
  set(orderErrorAtom, null);

  try {
    // 2. API call
    const newOrder = await orderService.create(orderData);

    // 3. Update entity list
    set(orderListAtom, prev => [...prev, newOrder]);

    // 4. Clear form state
    set(orderFormAtom, initialFormState);

    // 5. Show success notification
    toast.success('Order created successfully');
  } catch (error) {
    // 6. Handle error state
    set(orderErrorAtom, error.message);
    toast.error('Failed to create order');
  } finally {
    // 7. Clear loading state
    set(orderLoadingAtom, false);
  }
};
```

## 🎨 UI Architecture

### Design System Structure

**Theme Configuration**
```typescript
// tailwind.config.js theme structure
const theme = {
  colors: {
    primary: { 50: '#...', 500: '#...', 900: '#...' },
    secondary: { 50: '#...', 500: '#...', 900: '#...' },
    success: { 50: '#...', 500: '#...', 900: '#...' },
    warning: { 50: '#...', 500: '#...', 900: '#...' },
    error: { 50: '#...', 500: '#...', 900: '#...' },
  },
  spacing: {
    // Custom spacing scale
  },
  typography: {
    // Custom typography scale
  },
};
```

**Component Variants**
```typescript
// Using class-variance-authority (cva)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Layout Architecture

**App Layout Structure**
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Client layout with navigation
const ClientLayoutWrapper = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <Header user={user} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
```

## 🔒 Security Architecture

### Authentication Flow

```
1. User Login Request
        ↓
2. Credentials Validation (Backend)
        ↓
3. JWT Token Generation
        ↓
4. Token Storage (localStorage)
        ↓
5. Automatic Header Injection
        ↓
6. Route Protection (Middleware)
        ↓
7. Component-Level Guards
```

### Authorization Patterns

```typescript
// Role-based access control
export const useRoleGuard = (requiredRoles: UserRole[]) => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user, requiredRoles]);
};

// Component protection
export const AdminOnlyComponent = ({ children }) => {
  const canAccess = useRoleGuard(['ADMIN', 'SUPERVISOR']);

  if (!canAccess) {
    return <UnauthorizedMessage />;
  }

  return <>{children}</>;
};
```

### Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith('/login') || pathname === '/') {
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection
  const userRole = decodeToken(token)?.role;
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
```

## 📱 Responsive Architecture

### Breakpoint System

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    },
  },
};

// Usage patterns
const ResponsiveComponent = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
  </div>
);
```

### Mobile-First Design

```typescript
// Component adaptation patterns
export const EntityTable = ({ entities }) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <EntityCardList entities={entities} />;
  }

  return <EntityDataTable entities={entities} />;
};
```

## 🚀 Performance Architecture

### Code Splitting Strategy

```typescript
// Route-based code splitting (automatic with App Router)
const LazyOrderPage = lazy(() => import('./orders/page'));
const LazyCustomerPage = lazy(() => import('./customers/page'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

// Service-based code splitting
const adminServices = () => import('@/services/admin');
```

### Optimization Patterns

```typescript
// Memoization strategies
export const EntityTable = memo(({ entities, onUpdate }) => {
  // Memoize expensive calculations
  const sortedEntities = useMemo(() => {
    return entities.sort((a, b) => a.name.localeCompare(b.name));
  }, [entities]);

  // Memoize callbacks
  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <Table>
      {sortedEntities.map(entity => (
        <TableRow key={entity.id} onUpdate={handleUpdate} />
      ))}
    </Table>
  );
});

// Virtual scrolling for large lists
export const VirtualizedEntityList = ({ entities }) => {
  const { virtualItems, totalSize } = useVirtual({
    size: entities.length,
    estimateSize: useCallback(() => 60, []),
  });

  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: totalSize }}>
        {virtualItems.map(virtualItem => (
          <div key={virtualItem.index} style={{
            position: 'absolute',
            top: virtualItem.start,
            left: 0,
            width: '100%',
            height: virtualItem.size,
          }}>
            <EntityRow entity={entities[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🧩 Integration Architecture

### Backend API Integration

**Multi-Backend Support**
```typescript
// Abstract API adapter
interface ApiAdapter {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete(endpoint: string): Promise<void>;
}

// NestJS adapter
class NestJSAdapter implements ApiAdapter {
  private baseUrl = process.env.NEXT_PUBLIC_NESTJS_URL;

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }
}

// PHP adapter (legacy)
class PHPAdapter implements ApiAdapter {
  private baseUrl = process.env.NEXT_PUBLIC_PHP_URL;

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }
}

// Factory pattern
export const createApiAdapter = (): ApiAdapter => {
  const backendType = process.env.NEXT_PUBLIC_BACKEND_TYPE;

  switch (backendType) {
    case 'nestjs':
      return new NestJSAdapter();
    case 'php':
      return new PHPAdapter();
    default:
      throw new Error(`Unknown backend type: ${backendType}`);
  }
};
```

## 🔄 Migration Architecture

### Gradual Migration Strategy

```typescript
// Feature flag system
export const useFeatureFlag = (flagName: string) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkFlag = async () => {
      try {
        const flags = await apiRequest<FeatureFlags>('/feature-flags');
        setEnabled(flags[flagName] || false);
      } catch (error) {
        setEnabled(false); // Fallback to disabled
      }
    };

    checkFlag();
  }, [flagName]);

  return enabled;
};

// Progressive component migration
export const EntityManager = () => {
  const useNewEntityTable = useFeatureFlag('new-entity-table');

  if (useNewEntityTable) {
    return <NewEntityTable />;
  }

  return <LegacyEntityTable />;
};
```

## 📊 Monitoring Architecture

### Error Tracking

```typescript
// Error boundary with monitoring
export class MonitoredErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to monitoring service
    monitor.captureException(error, {
      tags: {
        component: this.props.componentName,
      },
      extra: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Performance Monitoring

```typescript
// Performance tracking
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Track render performance
      analytics.track('component_render', {
        component: componentName,
        renderTime,
      });
    };
  }, [componentName]);
};
```

## 📋 Architectural Decisions

### 1. Next.js App Router vs Pages Router
**Decision**: App Router
**Rationale**:
- Server components for better performance
- Improved routing with layouts
- Future-ready architecture

### 2. Jotai vs Redux/Context
**Decision**: Jotai
**Rationale**:
- Atomic state management reduces re-renders
- Less boilerplate than Redux
- Better TypeScript integration

### 3. Tailwind CSS vs CSS Modules
**Decision**: Tailwind CSS + Shadcn/ui
**Rationale**:
- Rapid development with utility classes
- Consistent design system
- Excellent component library ecosystem

### 4. TypeScript Strict Mode
**Decision**: Full strict mode
**Rationale**:
- Catch errors at compile time
- Better IDE support
- Improved code maintainability

## ⚡ Next Steps

To understand specific architectural components:

- **[Components](./components.md)** - Component system and patterns
- **[State Management](./state-management.md)** - Jotai atoms and state flow
- **[API Integration](./api-integration.md)** - Service layer patterns
- **[Performance](./performance.md)** - Optimization strategies
- **[Testing](./testing.md)** - Testing architecture and patterns
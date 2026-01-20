# System Architecture

This document provides a comprehensive overview of the OMS system architecture, including high-level design, component interactions, data flow, and architectural decisions.

## 🏗️ High-Level Architecture

### System Overview

The OMS follows a modern, microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser  │  Mobile App   │  API Clients  │  Admin Tools    │
│  (Next.js)    │  (Future)     │  (Postman)    │  (K8s Dashboard)│
└─────────────┬───────────────┬─────────────────┬─────────────────┘
              │               │                 │
              ▼               ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│          Nginx Ingress Controller / Load Balancer              │
│     ├── SSL Termination  ├── Rate Limiting  ├── CORS          │
│     ├── Authentication   ├── Compression    ├── Monitoring     │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Frontend      │    │   Backend API   │                    │
│  │   (Next.js)     │    │   (NestJS)      │                    │
│  │   - SSR/SSG     │◄──►│   - REST APIs   │                    │
│  │   - CSR Pages   │    │   - GraphQL     │                    │
│  │   - Static      │    │   - WebSockets  │                    │
│  │   Port: 3000    │    │   Port: 3001    │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────┬───────────────┬───────────────────────────────────┘
              │               │
              ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Orders    │ │ Customers   │ │  Products   │ │   Users   │ │
│  │   Service   │ │   Service   │ │   Service   │ │  Service  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  Fitters    │ │ Suppliers   │ │    Auth     │ │   Mail    │ │
│  │   Service   │ │   Service   │ │   Service   │ │  Service  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ PostgreSQL  │ │   Redis     │ │   Object    │ │   Logs    │ │
│  │  (Primary)  │ │  (Cache)    │ │  Storage    │ │  (Files)  │ │
│  │             │ │             │ │  (Future)   │ │           │ │
│  │ Port: 5432  │ │ Port: 6379  │ │             │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Stack**
```
Next.js 15 (App Router)
├── React 19 (UI Components)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── Shadcn/ui (Component Library)
├── Jotai (State Management)
├── React Hook Form (Forms)
├── Zod (Validation)
└── Playwright (E2E Testing)
```

**Backend Stack**
```
NestJS (Node.js Framework)
├── TypeScript (Language)
├── TypeORM (Database ORM)
├── PostgreSQL (Primary Database)
├── Redis (Cache & Sessions)
├── Passport.js (Authentication)
├── JWT (Token Management)
├── Class Validator (Input Validation)
├── Swagger/OpenAPI (Documentation)
├── Jest (Testing)
└── Docker (Containerization)
```

**Infrastructure Stack**
```
Kubernetes (Orchestration)
├── Docker (Containerization)
├── Nginx Ingress (Load Balancing)
├── Let's Encrypt (SSL Certificates)
├── GitHub Actions (CI/CD)
├── DigitalOcean (Cloud Provider)
├── Prometheus (Monitoring)
├── Grafana (Dashboards)
└── ELK Stack (Logging)
```

## 🏛️ Architectural Patterns

### 1. Domain-Driven Design (DDD)

The system is organized around business domains:

```
Domain Models:
├── Order Management
│   ├── Orders (Aggregate Root)
│   ├── OrderItems
│   └── OrderStatus
├── Customer Management
│   ├── Customers
│   ├── CustomerProfiles
│   └── CustomerPreferences
├── Product Catalog
│   ├── Products (Aggregate Root)
│   ├── Brands
│   ├── Models
│   ├── Leathertypes
│   ├── Options
│   ├── Extras
│   └── Presets
├── User Management
│   ├── Users
│   ├── Roles
│   └── Permissions
├── Manufacturing
│   ├── Fitters
│   ├── Suppliers
│   └── WorkflowSteps
└── System
    ├── Configuration
    ├── FeatureFlags
    └── AuditLogs
```

### 2. Layered Architecture

Each domain follows a consistent layered approach:

```
Presentation Layer (Controllers)
       ↓
Application Layer (Services)
       ↓
Domain Layer (Entities/Models)
       ↓
Infrastructure Layer (Repositories/Database)
```

**Layer Responsibilities:**

- **Presentation Layer**: HTTP handling, validation, serialization
- **Application Layer**: Business workflows, coordination
- **Domain Layer**: Business rules, entity behavior
- **Infrastructure Layer**: Data persistence, external integrations

### 3. Event-Driven Architecture

Key business events trigger side effects:

```
Order Created → Email Notification + Audit Log
Order Approved → Manufacturing Workflow + Customer Notification
Payment Received → Order Processing + Inventory Update
Shipment Created → Tracking Notification + Delivery Schedule
```

## 🔄 Data Flow Architecture

### Request Flow

```
1. Client Request
   ├── Authentication Middleware
   ├── Validation Middleware
   ├── Rate Limiting
   └── CORS Headers
           ↓
2. Controller Layer
   ├── Input Validation (DTOs)
   ├── Authorization Guards
   ├── Request Parsing
   └── Response Formatting
           ↓
3. Service Layer
   ├── Business Logic
   ├── Domain Rules
   ├── Transaction Management
   └── Error Handling
           ↓
4. Repository Layer
   ├── Database Queries
   ├── Entity Mapping
   ├── Cache Management
   └── Connection Pooling
           ↓
5. Database Layer
   ├── Query Execution
   ├── Index Usage
   ├── Transaction Management
   └── Data Persistence
```

### State Management Flow

**Frontend State Management (Jotai)**
```
User Action → Component Event → Atom Update → Derived State → UI Re-render
     ↓              ↓               ↓             ↓            ↓
Form Submit → API Call → Success/Error → State Update → Notification
```

**Backend State Management**
```
HTTP Request → Controller → Service → Repository → Database
     ↓             ↓          ↓          ↓           ↓
Validation → Business → Entity → Query → Persistence
             Logic     Update   Builder
```

## 🗄️ Database Architecture

### Entity Relationship Design

```
Users ──┐
        ├── Orders ──┐
        │            ├── OrderItems
        │            └── OrderStatus
        └── Customers

Products ──┐
          ├── ProductVariants
          ├── ProductOptions
          └── ProductCategories

Orders ────┤
          ├── Fitters
          ├── Suppliers
          └── Workflows

System ────┤
          ├── AuditLogs
          ├── FeatureFlags
          └── Configuration
```

### Database Schema Strategy

**Core Principles:**
- **Normalization**: 3NF for transactional data
- **Denormalization**: Strategic for read-heavy operations
- **Indexing**: Optimized for query patterns
- **Partitioning**: By date for audit logs
- **Archiving**: Automated for old data

**Performance Optimizations:**
```sql
-- Strategic indexes for common queries
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
CREATE INDEX idx_orders_customer_urgent ON orders(customer_id, urgent) WHERE status != 'completed';
CREATE INDEX idx_audit_logs_entity_date ON audit_logs(entity_type, created_at)
  WHERE created_at > CURRENT_DATE - INTERVAL '90 days';

-- Partial indexes for active records
CREATE INDEX idx_active_orders ON orders(id, created_at) WHERE status IN ('pending', 'in_progress');

-- Composite indexes for complex queries
CREATE INDEX idx_order_search ON orders(customer_id, status, urgent, created_at);
```

### Data Access Patterns

**Repository Pattern Implementation:**
```typescript
@Injectable()
export class OrderRepository {
  // Basic CRUD operations
  async findById(id: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'fitter', 'product'],
    });
  }

  // Complex queries with caching
  @CachedQuery({ ttl: 300 })
  async findActiveOrders(filters: OrderFilters): Promise<PaginatedResult<Order>> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.fitter', 'fitter')
      .where('order.status IN (:...statuses)', {
        statuses: ['pending', 'in_progress']
      });

    return this.applyFiltersAndPagination(queryBuilder, filters);
  }

  // Optimized bulk operations
  async updateOrderStatuses(updates: OrderStatusUpdate[]): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const promises = updates.map(update =>
        manager.update(Order, update.id, { status: update.status })
      );
      await Promise.all(promises);
    });
  }
}
```

## 🔐 Security Architecture

### Authentication & Authorization

```
Authentication Flow:
Client Request → JWT Validation → User Resolution → Permission Check → Resource Access
      ↓              ↓                ↓                ↓                ↓
Login Endpoint → Token Generation → User Entity → Role/Permission → Authorized Response
```

**Security Layers:**
1. **Network Security**: HTTPS, CORS, Rate Limiting
2. **Application Security**: JWT validation, RBAC, Input validation
3. **Data Security**: SQL injection prevention, Encryption at rest
4. **Infrastructure Security**: Container scanning, Secret management

### Role-Based Access Control (RBAC)

```typescript
export enum UserRole {
  USER = 'USER',           // Customer permissions
  FITTER = 'FITTER',       // Measurement and validation
  SUPPLIER = 'SUPPLIER',   // Inventory and fulfillment
  SUPERVISOR = 'SUPERVISOR', // Approval and oversight
  ADMIN = 'ADMIN'          // System administration
}

// Permission matrix
const PERMISSIONS = {
  [UserRole.USER]: [
    'orders:read:own',
    'orders:create',
    'profile:update:own',
  ],
  [UserRole.FITTER]: [
    'orders:read:assigned',
    'orders:update:measurements',
    'customers:read',
  ],
  [UserRole.SUPPLIER]: [
    'orders:read:all',
    'orders:update:fulfillment',
    'inventory:manage',
  ],
  [UserRole.SUPERVISOR]: [
    'orders:read:all',
    'orders:approve',
    'reports:generate',
    'users:read',
  ],
  [UserRole.ADMIN]: ['*'] // All permissions
};
```

## 🚀 Performance Architecture

### Caching Strategy

**Multi-Level Caching:**
```
Browser Cache (304 responses)
       ↓
CDN Cache (Static assets)
       ↓
Application Cache (Redis)
       ↓
Database Query Cache
       ↓
Database Storage
```

**Cache Implementation:**
```typescript
// Service-level caching
@Injectable()
export class ProductService {
  @CachedQuery({ ttl: 3600, key: 'products:catalog' })
  async getProductCatalog(): Promise<Product[]> {
    return this.productRepository.find({
      where: { active: true },
      relations: ['brand', 'model', 'options'],
      order: { createdAt: 'DESC' },
    });
  }

  @InvalidateCache({ keys: ['products:*'] })
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return this.productRepository.save({ id, ...data });
  }
}

// Query result caching
@Injectable()
export class OrderService {
  async getOrderStats(): Promise<OrderStats> {
    const cacheKey = `order_stats:${new Date().toDateString()}`;

    return this.cacheManager.wrap(cacheKey, async () => {
      return this.orderRepository
        .createQueryBuilder('order')
        .select([
          'COUNT(*) as total',
          'COUNT(*) FILTER (WHERE status = "pending") as pending',
          'COUNT(*) FILTER (WHERE urgent = true) as urgent',
        ])
        .getRawOne();
    }, { ttl: 300 }); // 5 minutes
  }
}
```

### Database Performance

**Query Optimization Strategies:**
```sql
-- Example: Optimized order search
EXPLAIN ANALYZE
SELECT o.id, o.order_id, o.status, o.created_at,
       c.name as customer_name,
       f.name as fitter_name,
       p.name as product_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN fitters f ON o.fitter_id = f.id
LEFT JOIN products p ON o.product_id = p.id
WHERE o.status IN ('pending', 'in_progress')
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND (o.urgent = true OR f.region = 'priority_region')
ORDER BY o.urgent DESC, o.created_at ASC
LIMIT 50;
```

**Connection Pooling:**
```typescript
// TypeORM configuration
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',

  // Connection pooling
  extra: {
    connectionLimit: 20,
    acquireTimeout: 30000,
    timeout: 30000,
    reconnect: true,

    // Performance tuning
    statement_timeout: '30s',
    idle_in_transaction_session_timeout: '5min',
  },

  // Connection pool optimization
  maxQueryExecutionTime: 5000, // Log slow queries
};
```

## 🔧 Integration Architecture

### External System Integration

```
OMS Core System
       ↓
┌─────────────────────────────────────────┐
│           Integration Layer             │
├─────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐       │
│  │   Payment   │ │   Shipping  │       │
│  │  Processor  │ │   Provider  │       │
│  │  (Stripe)   │ │    (DHL)    │       │
│  └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐       │
│  │    Email    │ │   SMS/Push  │       │
│  │   Service   │ │    Service  │       │
│  │ (SendGrid)  │ │  (Twilio)   │       │
│  └─────────────┘ └─────────────┘       │
│  ┌─────────────┐ ┌─────────────┐       │
│  │  Analytics  │ │  Monitoring │       │
│  │  (Mixpanel) │ │ (DataDog)   │       │
│  │             │ │             │       │
│  └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────┘
```

### API Design Patterns

**RESTful API Design:**
```typescript
// Standard resource endpoints
@Controller('orders')
export class OrderController {
  @Get()           // GET /orders - List with pagination
  @Get(':id')      // GET /orders/:id - Get specific order
  @Post()          // POST /orders - Create new order
  @Put(':id')      // PUT /orders/:id - Update entire order
  @Patch(':id')    // PATCH /orders/:id - Partial update
  @Delete(':id')   // DELETE /orders/:id - Remove order

  // Custom actions
  @Post(':id/approve')    // POST /orders/:id/approve
  @Post(':id/cancel')     // POST /orders/:id/cancel
  @Get(':id/history')     // GET /orders/:id/history
}

// Filtering and pagination
@Get()
async findAll(
  @Query() query: OrderQueryDto,
  @Query('page') page = 1,
  @Query('limit') limit = 10
): Promise<PaginatedResponse<Order>> {
  return this.orderService.findAll({
    ...query,
    pagination: { page, limit }
  });
}
```

## 🏗️ Deployment Architecture

### Container Architecture

```dockerfile
# Multi-stage build example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Kubernetes Architecture

```yaml
# Deployment strategy
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oms-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  selector:
    matchLabels:
      app: oms-backend
  template:
    spec:
      containers:
      - name: api
        image: ordermysaddle/oms-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: oms-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📊 Monitoring Architecture

### Observability Stack

```
Application Metrics (Prometheus)
       ↓
System Metrics (Node Exporter)
       ↓
Log Aggregation (ELK Stack)
       ↓
Alerting (AlertManager)
       ↓
Visualization (Grafana)
```

**Monitoring Implementation:**
```typescript
// Health check endpoint
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly redisHealthIndicator: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.redisHealthIndicator.pingCheck('redis'),
    ]);
  }

  @Get('metrics')
  getMetrics() {
    // Prometheus metrics endpoint
    return this.metricsService.getMetrics();
  }
}

// Custom metrics
@Injectable()
export class MetricsService {
  private readonly orderCounter = new Counter({
    name: 'orders_total',
    help: 'Total number of orders created',
    labelNames: ['status', 'urgent'],
  });

  private readonly orderDuration = new Histogram({
    name: 'order_processing_duration_seconds',
    help: 'Time spent processing orders',
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  });

  recordOrderCreated(urgent: boolean) {
    this.orderCounter.inc({ status: 'created', urgent: urgent.toString() });
  }

  recordOrderProcessingTime(duration: number) {
    this.orderDuration.observe(duration);
  }
}
```

## 📋 Architectural Decisions

### 1. NestJS vs Express.js
**Decision**: NestJS
**Rationale**:
- Built-in TypeScript support
- Dependency injection and modular architecture
- Extensive ecosystem (Guards, Interceptors, Pipes)
- Enterprise-ready with testing utilities

### 2. TypeORM vs Prisma
**Decision**: TypeORM
**Rationale**:
- Active Record pattern familiarity
- Mature ecosystem with NestJS
- Complex query capabilities
- Migration system

### 3. Jotai vs Redux Toolkit
**Decision**: Jotai
**Rationale**:
- Atomic state management reduces re-renders
- Less boilerplate than Redux
- Excellent TypeScript support
- Better performance for complex state

### 4. Monorepo vs Multi-repo
**Decision**: Monorepo
**Rationale**:
- Shared types between frontend/backend
- Unified CI/CD pipeline
- Easier dependency management
- Atomic commits across services

### 5. Docker vs Native Deployment
**Decision**: Docker + Kubernetes
**Rationale**:
- Environment consistency
- Horizontal scaling capabilities
- Blue-green deployment support
- Infrastructure as code

## 🔮 Future Architecture Considerations

### Planned Improvements

**Microservices Evolution**
```
Current: Modular Monolith
       ↓
Phase 1: Extract Auth Service
       ↓
Phase 2: Extract Payment Service
       ↓
Phase 3: Extract Notification Service
       ↓
Future: Event-Driven Microservices
```

**Technology Upgrades**
- **GraphQL Federation**: For complex frontend queries
- **Event Sourcing**: For audit trails and replay capabilities
- **CQRS**: Command/Query separation for performance
- **Message Queue**: RabbitMQ/Apache Kafka for async processing

**Scalability Planning**
- **Read Replicas**: For query performance
- **Database Sharding**: By customer region
- **CDN Integration**: Global static asset delivery
- **Edge Computing**: Regional API deployment

### Migration Strategies

**Database Migration Path**
1. Current: Single PostgreSQL instance
2. Phase 1: Master-slave replication
3. Phase 2: Read/write splitting
4. Phase 3: Microservice-specific databases

**Frontend Architecture Evolution**
1. Current: Single Next.js application
2. Phase 1: Module federation for large teams
3. Phase 2: Micro-frontends for independent deployment
4. Phase 3: Progressive Web App capabilities

## ⚡ Next Steps

For deeper architectural understanding:

- **[API Reference](./api-reference.md)** - Detailed API documentation
- **[Database Design](./database.md)** - Schema and data modeling
- **[Security Guidelines](./security.md)** - Security implementation details
- **[Performance Guide](./performance.md)** - Optimization strategies
- **[Deployment Guide](./deployment.md)** - Infrastructure and deployment
- **[Frontend Architecture](../frontend/docs/architecture.md)** - Frontend-specific architecture
- **[Backend Architecture](../backend/docs/architecture.md)** - Backend-specific architecture
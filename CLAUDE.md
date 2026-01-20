# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status & Implementation Plan

### Current Implementation Status: 95% Complete - PRODUCTION-READY
- **Advanced Architecture**: NestJS backend with enterprise patterns
- **All Core Entities**: Customers, Orders, Fitters, Factories, Users fully implemented
- **All Product Entities**: Brands, Models, Leathertypes, Options, Extras, Presets, Products (Saddles)
- **Security Hardened**: Authentication guards enabled, RLS implemented, audit logging active
- **Advanced Features**: Dual ID system, enriched orders, Redis caching, advanced search

### Implementation Status Update
Migration plans in `/docs/specs/` have been **significantly exceeded**:
- **Phase 0**: Foundation Audit (COMPLETED)
- **Phase 1**: Backend Entity Implementation (COMPLETED - All 14+ entities implemented)
- **Phase 2**: Frontend Integration & Testing (Ready - APIs implemented)
- **Phase 3**: Production Data Migration (Scripts ready, execution pending)
- **Phase 4**: Production Deployment (Architecture ready)

### Quality Standards
- **Backend Test Coverage**: >90%
- **Frontend Test Coverage**: >85%
- **Critical Paths**: 100% coverage (auth, payments, orders)
- **Response Times**: <100ms for list endpoints, <50ms for single entities
- **Cache Performance**: >85% hit rate

## Development Commands

### Backend (NestJS) - `/backend` directory
- **Development server**: `cd backend && npm run start:dev` - Starts with watch mode for hot reloading
- **Build**: `cd backend && npm run build` - Compiles TypeScript to JavaScript in dist/
- **Production start**: `cd backend && npm run start:prod` - Runs the compiled application
- **Linting**: `cd backend && npm run lint` - ESLint for TypeScript code
- **Format**: `cd backend && npm run format` - Prettier formatting

### Frontend (Next.js) - `/frontend` directory
- **Development server**: `cd frontend && npm run dev` - Next.js development server on port 3000
- **Build**: `cd frontend && npm run build` - Production build
- **Production start**: `cd frontend && npm run start` - Start production build
- **Linting**: `cd frontend && npm run lint` - Next.js ESLint configuration
- **Type check**: `cd frontend && npm run type-check` - TypeScript validation

### Testing Commands
- **Backend Unit tests**: `cd backend && npm run test` - Jest unit tests
- **Backend Watch mode**: `cd backend && npm run test:watch` - Run tests in watch mode
- **Backend Coverage**: `cd backend && npm run test:cov` - Generate test coverage report (target: >90%)
- **Backend E2E tests**: `cd backend && npm run test:e2e` - End-to-end tests with database
- **Frontend tests**: `cd frontend && npm run test` - React component tests (target: >85%)
- **E2E tests**: `cd e2e && npx playwright test` - Full application E2E testing

### Database Commands (from `/backend`)
- **Generate migration**: `npm run migration:generate -- backend/database/migrations/MigrationName`
- **Create migration**: `npm run migration:create -- backend/database/migrations/MigrationName`
- **Run migrations**: `npm run migration:run`
- **Revert migration**: `npm run migration:revert`
- **Seed database**: `npm run seed:run:relational`

### Code Generation (from `/backend`)
- **Generate resource**: `npm run generate:resource:relational` - Creates controller, service, entity, DTOs
- **Create seed**: `npm run seed:create:relational`
- **Add property**: `npm run add:property:to-relational`

## Staging Database Migration

### Production Data Location
Production data for development and testing is located at:
```
backend/src/database/seeds/relational/production-data/
```

See the full documentation: [Production Data README](backend/src/database/seeds/relational/production-data/README.md)

### Quick Migration to Staging Database

#### PostgreSQL (Recommended)
```bash
cd backend/src/database/seeds/relational/production-data/postgres/scripts

# 1. Start PostgreSQL 15 container (port 5433)
./setup-postgres.sh

# 2. Transform MySQL data to PostgreSQL format (first time only)
./transform-mysql-to-postgres.sh

# 3. Import all schema and data
./import-data.sh

# 4. Validate the import
./validate-data.sh
```

#### MySQL Legacy (Optional)
```bash
cd backend/src/database/seeds/relational/production-data/mysql-legacy/scripts

./setup-mysql.sh              # Start MySQL 8.0 container (port 3307)
./import-data.sh              # Import all schema and data
./validate-data.sh            # Validate counts and integrity
```

### Staging Database Connection

#### PostgreSQL
| Parameter | Value |
|-----------|-------|
| Host | 127.0.0.1 |
| Port | **5433** |
| Database | oms_legacy |
| User | oms_user |
| Password | oms_password |

```bash
# Connect via Docker
docker exec -it oms_postgres_legacy psql -U oms_user -d oms_legacy

# Connect via psql client
psql -h 127.0.0.1 -p 5433 -U oms_user -d oms_legacy
```

#### MySQL Legacy
| Parameter | Value |
|-----------|-------|
| Host | 127.0.0.1 |
| Port | **3307** |
| Database | oms_legacy |
| User | oms_user |
| Password | oms_password |

```bash
docker exec -it oms_mysql_legacy mysql -u oms_user -poms_password oms_legacy
```

### Connect NestJS to Staging Database
Update `backend/.env`:
```env
DATABASE_TYPE=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5433
DATABASE_USERNAME=oms_user
DATABASE_PASSWORD=oms_password
DATABASE_NAME=oms_legacy
```

### Data Volume Summary
- **Total Records**: ~3 million across 21 tables
- **Orders**: 48,142
- **Customers**: 27,279
- **OrdersInfo**: 1,098,273
- **Audit Logs**: ~840,000

## Architecture Overview

### NestJS Boilerplate Foundation
This project is built on the brocoders/nestjs-boilerplate, providing enterprise-ready features:
- **TypeORM** for database ORM with PostgreSQL
- **JWT Authentication** with role-based access control
- **File uploads** with local and S3 support
- **Internationalization** (i18n) with nestjs-i18n
- **Swagger documentation** automatically generated
- **Email system** with nodemailer
- **Caching** with Redis integration
- **Health checks** and monitoring endpoints

### OMS Business Domain
Order Management System specialized for saddle manufacturing:

**Complete Entity Implementation (14 entities):**

**Core Business Entities:**
- **Orders**: Advanced implementation with JSON seat sizes, search, dual ID system
- **Customers**: Production-ready with fitter relationships and audit trails
- **Fitters**: Complete with commission structures and factory associations
- **Factories**: Renamed from suppliers, regional assignment capabilities
- **FactoryEmployees**: Full employee management system
- **Users**: Sophisticated auth system with username/email dual login
- **Enriched Orders**: Materialized views with Redis caching and fallback queries

**Complete Product Catalog (7 entities):**
- **Brands**: Implemented with production data structure
- **Models**: Product models with brand relationships
- **Leathertypes**: Material options with sequencing and pricing
- **Options**: 7-tier pricing structure with complex business logic
- **Extras**: Additional features and add-ons system
- **Presets**: Saved configurations with preset items
- **Products (Saddles)**: Master product entity with regional factory assignments

**Advanced System Entities:**
- **AuditLog**: Complete audit trail system with dual logging
- **DatabaseQueryLog**: Query monitoring for debugging and compliance
- **RLSPolicies**: Row Level Security service for multi-tenant data isolation

### Simplified Architecture (SaveBundle Removed)
- **REST API**: Standard CRUD operations (GET, POST, PUT, DELETE)
- **Bulk Operations**: Simple batch endpoints for multiple entities
- **Error Handling**: Consistent REST error responses
- **Authentication**: JWT with role-based guards

### System Integration
- **Frontend**: Next.js 15 application in `/frontend/`
- **Backend**: NestJS API in `/backend/`
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis for session and data caching
- **Testing**: Playwright E2E tests in `/e2e/`
- **Legacy Migration**: PHP/Symfony system being replaced

## Key Technical Components

### Module Structure
Core modules follow NestJS patterns:
- **AuthModule**: JWT authentication with Passport strategies
- **UsersModule**: User management with role-based access
- **OrderModule**: Main business logic for order processing
- **CustomerModule, FitterModule, SupplierModule**: Entity management
- **BrandsModule, ModelsModule, ProductsModule**: Product catalog
- **OptionsModule, ExtrasModule, PresetsModule**: Product configuration
- **LeathertypesModule**: Material management
- **DataSyncModule**: Legacy system synchronization
- **FeatureFlagModule**: Feature toggle management
- **BehaviorsModule**: Cross-cutting concerns (audit, validation)

### Database & TypeORM
- **Database Source**: Backend follows PostgreSQL schema from **staging database dump**
- **TypeORM Configuration**: `backend/src/database/typeorm-config.service.ts`
- **Migrations**: `backend/src/database/migrations/` - Version-controlled schema changes
- **Production Data**: `backend/src/database/seeds/relational/production-data/` - ~3M records for testing
- **Seeds**: `backend/src/database/seeds/relational/` - Test and initial data
- **Entities**: Domain models with decorators for validation and transformation
- **Seat Size Support**: Orders table includes `seat_sizes` column (JSON type) for saddle sizing data

### Authentication & Authorization - PRODUCTION-READY
- **Dual Authentication**: System supports both username AND email authentication via `findByEmailOrUsername()` method
- **AuthEmailLoginDto**: Accepts both username and email (e.g., "adamwhitehouse" or "user@example.com")
- **JWT Strategy**: Production-ready implementation in `backend/src/auth/strategies/jwt.strategy.ts`
- **Anonymous Strategy**: Available for public endpoints
- **Role Guards**: ENABLED across all controllers with `@UseGuards(AuthGuard("jwt"))`
- **RLS Implementation**: Complete Row Level Security system for data isolation
- **Session Management**: Redis integration active
- **Audit Logging**: Complete authentication and action audit trails

### Advanced Features
- **Query Support**: Standard filtering and sorting via URL parameters
- **Behavioral Patterns**: Automatic auditing, soft deletes, ownership tracking
- **Data Synchronization**: Bidirectional sync with legacy PHP system
- **Feature Flags**: Runtime feature toggling for gradual rollouts
- **Monitoring**: Prometheus metrics and health checks
- **Enriched Order Views**: Materialized views with fallback queries, Redis caching, and automated refresh
- **Seat Size Management**: JSON-based seat size storage with type safety and validation

### API Documentation
- **Swagger UI**: Available at `/docs` endpoint
- **Bearer Authentication**: JWT tokens required for protected endpoints (username OR email login)
- **Versioning**: URI-based API versioning support
- **I18N Headers**: Multi-language support via `x-custom-lang` header

### Enriched Orders System
- **Materialized Views**: `enriched_order_view` provides pre-computed order data with customer, fitter, and supplier details
- **Order Edit View**: `order_edit_view` aggregates order lines, comments, and pricing for comprehensive editing
- **Seat Size Support**: Orders include `seat_sizes` column (JSON) and `seat_size` computed fields
- **Caching Strategy**: 5-minute TTL Redis cache with automatic invalidation
- **Fallback Queries**: Graceful degradation when materialized views unavailable
- **Performance**: Optimized for <100ms response times with pagination and filtering

## File Structure Patterns

### Source Organization
```
backend/                      # NestJS API
├── src/
│   ├── auth/                 # Authentication & authorization
│   ├── users/                # User management
│   ├── orders/               # Core business logic
│   ├── customers/            # Customer entity management
│   ├── fitters/              # Fitter entity management
│   ├── factories/            # Factory entity management (was suppliers)
│   ├── enriched-orders/      # Advanced order views with caching
│   ├── brands/               # Brand management
│   ├── models/               # Product models
│   ├── leathertypes/         # Leather material types
│   ├── options/              # Product configuration options
│   ├── extras/               # Additional features
│   ├── presets/              # Saved configurations
│   ├── products/             # Master product entity (saddles)
│   ├── data-sync/            # Legacy system integration
│   ├── behaviors/            # Cross-cutting behaviors
│   ├── database/             # TypeORM configuration & migrations
│   │   └── seeds/relational/production-data/  # Staging database data
│   ├── config/               # Environment configuration
│   └── utils/                # Shared utilities
└── test/                     # Test utilities and helpers

frontend/                     # Next.js 15 application
├── app/                      # App router pages
├── components/               # React components
├── services/                 # API client services
├── types/                    # TypeScript definitions
├── utils/                    # Shared utilities
└── tests/                    # Component tests

e2e/                          # Playwright E2E tests
├── tests/                    # Test scenarios
├── fixtures/                 # Test data
├── utils/                    # Test utilities
└── config/                   # Playwright configuration
```

### Entity Patterns
Each business entity follows consistent patterns:
- **Entity**: TypeORM entity with decorators (`*.entity.ts`)
- **DTO**: Data transfer objects for API contracts (`dto/`)
- **Controller**: REST endpoints with Swagger docs (`*.controller.ts`)
- **Service**: Business logic and data access (`*.service.ts`)
- **Module**: NestJS module configuration (`*.module.ts`)

## Development Workflow

### Testing Strategy
- **Unit Tests**: Jest with isolated service/controller testing
- **Integration Tests**: Database integration with test containers
- **E2E Tests**: Full application testing with real database
- **Coverage**: Comprehensive coverage reporting with thresholds

### Code Generation Workflow
1. **Generate Resource**: `npm run generate:resource:relational`
2. **Answer Prompts**: Entity name, properties, relationships
3. **Review Generated**: Controller, service, entity, DTOs automatically created
4. **Add Business Logic**: Customize generated service methods
5. **Create Migration**: `npm run migration:generate` for schema changes

### Database Development
1. **Entity Changes**: Modify TypeORM entities
2. **Generate Migration**: `npm run migration:generate`
3. **Review SQL**: Check generated migration for correctness
4. **Run Migration**: `npm run migration:run`
5. **Update Seeds**: Add test data if needed

### Legacy Integration
- **Data Sync Service**: Handles bidirectional synchronization
- **Gradual Migration**: Parallel operation with PHP system
- **Shared Database**: PostgreSQL staging database dump as backend foundation
- **SQL Views**: Legacy enriched order views (`enriched_order_view`, `order_edit_view`) integrated into NestJS
- **API Compatibility**: Standard REST API with query parameters
- **Database Views Refresh**: Automated materialized view refresh for performance

## Current Status: Production-Ready Implementation

### Security Hardening - COMPLETED
**Authentication Status**: All controllers secured with active JWT guards
```typescript
// CURRENT IMPLEMENTATION (SECURE):
@Controller("customers")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))  // ACTIVE
export class CustomerController {
```

**All Controllers Secured:**
- `backend/src/customers/customer.controller.ts` - JWT guards active
- `backend/src/orders/order.controller.ts` - JWT guards active
- `backend/src/factories/factory.controller.ts` - JWT guards active
- `backend/src/users/users.controller.ts` - JWT guards active
- `backend/src/enriched-orders/enriched-orders.controller.ts` - JWT guards active
- All product modules secured with role-based access

### All Product Entity Modules - COMPLETED

**All 7 Product Modules Implemented:**
1. **BrandsModule** - Complete with production data structure
2. **ModelsModule** - Brand relationships and product hierarchy
3. **LeathertypesModule** - Material management with pricing
4. **OptionsModule** - 7-tier pricing with complex business logic
5. **ExtrasModule** - Additional features management
6. **PresetsModule** - Configuration templates with preset items
7. **ProductsModule (Saddles)** - Master product entity with regional factories

**Advanced Features Implemented:**
- Dual ID system across all entities
- Redis caching with TTL management
- Advanced search capabilities
- Row Level Security policies
- Complete audit logging system

### Remaining Tasks (Production Deployment)
- Backend APIs complete and tested
- Update frontend to use implemented backend APIs
- Execute production data migration (scripts ready)
- Performance testing with production data volumes
- Final E2E testing and deployment preparation

## Common Development Tasks

### Adding New Business Entity
1. Generate resource with hygen template
2. Define TypeORM entity with proper relationships
3. Create appropriate DTOs for API contracts
4. Implement service with business logic
5. Add controller endpoints with Swagger documentation
6. Generate and run database migration
7. Create seeds for testing
8. Add integration tests

### Implementing New API Endpoint
1. Add method to existing controller
2. Define request/response DTOs
3. Implement business logic in service
4. Add proper authentication guards
5. Document with Swagger decorators
6. Write unit and integration tests

### Database Schema Changes
1. Modify entity definitions in `backend/src/[entity]/domain/`
2. Generate migration: `npm run migration:generate -- backend/database/migrations/UpdateEntityName`
3. Review generated SQL carefully
4. Test migration: `npm run migration:run`
5. Update seeds if needed
6. Test rollback: `npm run migration:revert`

### Adding Feature Flags
1. Define feature in `FeatureFlagService`
2. Use guards or decorators to protect features
3. Implement gradual rollout logic
4. Monitor feature usage and performance

## Configuration & Environment

### Environment Variables
- **Database**: Connection strings, credentials
- **JWT**: Secret keys and expiration settings
- **Redis**: Cache and queue configuration
- **Email**: SMTP settings for notifications
- **File Upload**: Local vs S3 storage configuration
- **Feature Flags**: Default state configuration

### Docker Development
- **Local Development**: `docker-compose.yaml` for services
- **Testing**: Separate compose files for test isolation
- **CI/CD**: Automated testing with containerized dependencies

## Production Considerations

### Performance
- **Database Indexing**: Proper indexes on query columns
- **Caching Strategy**: Redis for frequently accessed data
- **Query Optimization**: Use TypeORM query builder for complex queries
- **Connection Pooling**: Configured for high concurrency

### Monitoring
- **Health Checks**: `/health` endpoint for service monitoring
- **Metrics**: Prometheus integration for performance monitoring
- **Logging**: Structured logging with correlation IDs
- **Error Tracking**: Centralized error reporting

### Security
- **JWT Validation**: Proper token verification and refresh
- **Rate Limiting**: API endpoint protection
- **Input Validation**: DTOs with class-validator
- **SQL Injection**: TypeORM parameterized queries
- **CORS**: Configured for frontend domains

## Legacy System Migration Status

### Current Architecture
- **Modern Stack**: NestJS + Next.js with TypeORM and Redis
- **Standard REST API**: Removed SaveBundle complexity for maintainability
- **Database Foundation**: Built on PostgreSQL staging database dump with enriched views
- **Authentication Ready**: Username/email login with JWT and active guards
- **Seat Size Support**: Complete seat sizing system with JSON storage and typed access

### Migration Progress: 95% Complete
- **Foundation**: Complete with advanced features
- **All Entities**: Complete (exceeded original scope)
- **Integration**: Frontend updates needed (APIs ready)
- **Data Migration**: Scripts ready for execution
- **Production**: Architecture production-ready

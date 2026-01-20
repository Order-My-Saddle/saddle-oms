# Ralph Loop Development Guide for OMS Backend

## Overview

This guide provides specific Ralph Loop commands and patterns for developing the OMS NestJS backend. It focuses on backend-specific tasks including entity implementation, authentication, testing, and performance optimization.

## Backend-Specific Ralph Commands 

### Entity Implementation

#### Single Entity Template
```bash
/ralph-wiggum:ralph-loop "Implement [EntityName]Module for OMS backend following the established pattern in backend/src/customers/.

REQUIREMENTS:
- TypeORM entity in domain/[entity].ts
- Repository interface in domain/[entity].repository.ts
- Service in [entity].service.ts with OData query integration
- Controller in [entity].controller.ts with @UseGuards(JwtAuthGuard)
- DTOs in dto/ directory (create, update, query)
- Mapper in infrastructure/persistence/relational/mappers/
- Complete module in [entity].module.ts
- Comprehensive tests (>90% coverage)

ENTITY STRUCTURE:
backend/[entity]/
├── domain/
│   ├── [entity].ts              # Domain model
│   └── [entity].repository.ts   # Repository interface
├── infrastructure/
│   ├── persistence/
│   │   ├── relational/
│   │   │   ├── entities/[entity].entity.ts
│   │   │   ├── repositories/[entity].repository.impl.ts
│   │   │   └── mappers/[entity].mapper.ts
├── [entity].service.ts          # Business logic
├── [entity].controller.ts       # REST endpoints
├── dto/
│   ├── create-[entity].dto.ts
│   ├── update-[entity].dto.ts
│   └── query-[entity].dto.ts
└── [entity].module.ts           # NestJS module

VERIFICATION: cd backend && npm run test [entity] && npm run lint

Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise> when module is fully implemented and tested." --max-iterations 25
```

#### Product Catalog Entities (Priority Implementation)
```bash
# Brands Module
/ralph-wiggum:ralph-loop "Implement BrandsModule for OMS product catalog following backend/src/customers/ pattern.

BRAND ENTITY REQUIREMENTS:
- Basic brand information (name, description, logo)
- Relationships to models and products
- Search and filtering capabilities
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test brands && npm run lint

Output <promise>BRANDS_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Models Module (depends on Brands)
/ralph-wiggum:ralph-loop "Implement ModelsModule for OMS with Brand relationship following backend/src/customers/ pattern.

MODEL ENTITY REQUIREMENTS:
- Model information with brand relationship
- ManyToOne relationship to Brand entity
- Product configuration capabilities
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test models && npm run lint

Output <promise>MODELS_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Leathertypes Module
/ralph-wiggum:ralph-loop "Implement LeathertypesModule for OMS saddle materials following backend/src/customers/ pattern.

LEATHERTYPE ENTITY REQUIREMENTS:
- Leather type information (name, description, properties)
- Pricing and availability data
- Color and texture options
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test leathertypes && npm run lint

Output <promise>LEATHERTYPES_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Options Module (Product Customization)
/ralph-wiggum:ralph-loop "Implement OptionsModule for OMS product customization following backend/src/customers/ pattern.

OPTIONS ENTITY REQUIREMENTS:
- Customization options for products
- Pricing modifiers
- Compatibility with specific models/brands
- Category organization
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test options && npm run lint

Output <promise>OPTIONS_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Extras Module
/ralph-wiggum:ralph-loop "Implement ExtrasModule for OMS additional product items following backend/src/customers/ pattern.

EXTRAS ENTITY REQUIREMENTS:
- Additional items and accessories
- Pricing information
- Inventory tracking
- Compatibility with main products
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test extras && npm run lint

Output <promise>EXTRAS_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Presets Module (Saved Configurations)
/ralph-wiggum:ralph-loop "Implement PresetsModule for OMS saved product configurations following backend/src/customers/ pattern.

PRESETS ENTITY REQUIREMENTS:
- Saved product configurations
- User-specific presets
- Preset sharing capabilities
- Configuration validation
- REST endpoints with authentication

VERIFICATION: cd backend && npm run test presets && npm run lint

Output <promise>PRESETS_MODULE_COMPLETE</promise> when complete." --max-iterations 20

# Products Module (Complex - Main Product Entity)
/ralph-wiggum:ralph-loop "Implement ProductsModule for OMS main product entity with relationships to all product catalog entities following backend/src/customers/ pattern.

PRODUCTS ENTITY REQUIREMENTS:
- Central product entity with complex relationships
- Relationships to brands, models, leathertypes, options, extras
- Product configuration management
- Pricing calculation logic
- Inventory management
- Advanced search and filtering
- REST endpoints with authentication

RELATIONSHIPS:
- ManyToOne with Brand
- ManyToOne with Model
- ManyToMany with Options, Extras, Leathertypes
- OneToMany with Orders

VERIFICATION: cd backend && npm run test products && npm run lint

Output <promise>PRODUCTS_MODULE_COMPLETE</promise> when complete." --max-iterations 30
```

### Authentication Security

#### Enable JWT Guards Across Backend
```bash
/ralph-wiggum:ralph-loop "Enable JWT authentication guards across ALL controllers in the OMS backend.

CONTROLLERS TO UPDATE:
- src/customers/customer.controller.ts
- src/orders/order.controller.ts
- src/fitters/fitter.controller.ts
- src/suppliers/supplier.controller.ts
- src/users/users.controller.ts
- src/enriched-orders/enriched-orders.controller.ts
- All new entity controllers (brands, models, etc.)

CHANGES REQUIRED:
1. Remove all TODO comments about auth guards
2. Uncomment @UseGuards(JwtAuthGuard) decorators
3. Ensure proper authentication is working
4. Test all endpoints require valid JWT tokens
5. Verify role-based access control

AUTHENTICATION TESTING:
- Test with valid JWT tokens
- Test with invalid/expired tokens
- Test role-based access for all 5 user roles
- Verify proper 401/403 error responses

VERIFICATION: cd backend && npm run test:e2e:auth && npm run test auth

Output <promise>AUTH_GUARDS_ENABLED</promise> when all endpoints are secured and tested." --max-iterations 15
```

#### Role-Based Access Control Implementation
```bash
/ralph-wiggum:ralph-loop "Implement comprehensive role-based access control (RBAC) for OMS backend.

USER ROLES:
1. USER - Basic customer access (read own data)
2. FITTER - Professional fitter access (customer management)
3. SUPPLIER - Manufacturing partner access (order fulfillment)
4. ADMIN - Administrative functions (user management)
5. SUPERVISOR - Full system access (all operations)

RBAC IMPLEMENTATION:
- Create role-based guards
- Implement permission decorators
- Add role checks to sensitive endpoints
- Test access control for each role
- Document role permissions

ENDPOINTS TO SECURE:
- Customer management (USER: own data, FITTER+: all)
- Order management (USER: own orders, FITTER+: assigned orders, ADMIN+: all)
- User management (ADMIN+ only)
- System configuration (SUPERVISOR only)

VERIFICATION: cd backend && npm run test:rbac && npm run test:e2e:roles

Output <promise>RBAC_IMPLEMENTED</promise> when role-based access control is fully functional." --max-iterations 25
```

### Performance Optimization

#### Database Query Optimization
```bash
/ralph-wiggum:ralph-loop "Optimize database queries and performance for OMS backend.

OPTIMIZATION AREAS:
- Review and optimize TypeORM queries
- Add proper database indexes
- Implement query result caching
- Optimize N+1 query issues
- Improve pagination performance
- Add query performance monitoring

DATABASE INDEXES TO ADD:
- Customer email, name indexes
- Order status, date indexes
- Product search indexes
- User role indexes

CACHING STRATEGY:
- Cache frequently accessed data
- Implement cache invalidation
- Use Redis for session and query caching
- Cache product catalog data

PERFORMANCE TARGETS:
- List endpoints: <100ms response time
- Single entity endpoints: <50ms response time
- Complex queries (enriched orders): <150ms response time
- Cache hit rate: >85%

VERIFICATION: cd backend && npm run test:performance && npm run benchmarks

Output <promise>PERFORMANCE_OPTIMIZED</promise> when all performance targets are met." --max-iterations 20
```

#### Redis Caching Implementation
```bash
/ralph-wiggum:ralph-loop "Implement comprehensive Redis caching for OMS backend performance optimization.

CACHING REQUIREMENTS:
- Cache frequently accessed entities
- Implement cache invalidation strategies
- Cache query results with TTL
- Cache user sessions and authentication data
- Cache product catalog data

CACHE STRATEGIES:
- Entity caching: Individual records with 1-hour TTL
- Query result caching: Search results with 15-minute TTL
- Session caching: User sessions with configurable TTL
- Static data caching: Product catalog with 4-hour TTL

CACHE INVALIDATION:
- Automatic invalidation on entity updates
- Manual cache clearing for critical updates
- Bulk invalidation for related entities

IMPLEMENTATION:
- Use @nestjs/cache-manager
- Integrate with existing Redis configuration
- Add cache decorators to services
- Implement cache monitoring

VERIFICATION: cd backend && npm run test:cache && npm run cache:performance

Output <promise>REDIS_CACHING_IMPLEMENTED</promise> when caching is fully operational." --max-iterations 20
```

### Testing and Quality Assurance

#### Comprehensive Test Suite
```bash
/ralph-wiggum:ralph-loop "Create comprehensive test suite for OMS backend with >90% coverage.

TEST TYPES TO IMPLEMENT:
1. Unit Tests - Service and utility testing
2. Integration Tests - Database and external service integration
3. E2E Tests - Full API endpoint testing
4. Performance Tests - Response time and load testing
5. Security Tests - Authentication and authorization testing

TEST COVERAGE REQUIREMENTS:
- Overall coverage: >90%
- Service layer coverage: >95%
- Controller layer coverage: >85%
- Critical path coverage: 100%

TEST SCENARIOS:
- All CRUD operations for each entity
- Authentication and authorization flows
- Error handling and validation
- Business logic and calculations
- Database relationships and constraints
- Performance under load

TESTING TOOLS:
- Jest for unit and integration tests
- Supertest for API testing
- Jest coverage reporting
- Performance benchmarking

VERIFICATION: cd backend && npm run test && npm run test:cov && npm run test:e2e

Output <promise>COMPREHENSIVE_TESTS_COMPLETE</promise> when all tests are implemented and passing." --max-iterations 25
```

#### API Documentation Generation
```bash
/ralph-wiggum:ralph-loop "Generate comprehensive API documentation for OMS backend using Swagger/OpenAPI.

DOCUMENTATION REQUIREMENTS:
- Complete Swagger/OpenAPI specification
- Document all endpoints with examples
- Include authentication requirements
- Document request/response schemas
- Add error response documentation

SWAGGER IMPLEMENTATION:
- Update all controllers with @ApiTags, @ApiOperation
- Add @ApiResponse decorators with schemas
- Document all DTOs with @ApiProperty
- Include authentication security schemes
- Add example requests and responses

DOCUMENTATION FEATURES:
- Interactive API explorer
- Request/response examples
- Authentication flow documentation
- Error code documentation
- Schema definitions

VERIFICATION: cd backend && npm run build && npm run start (check /api/docs)

Output <promise>API_DOCUMENTATION_COMPLETE</promise> when documentation is comprehensive and accessible." --max-iterations 15
```

### Database Management

#### Migration Management
```bash
/ralph-wiggum:ralph-loop "Create and manage TypeORM migrations for all OMS backend entities.

MIGRATION REQUIREMENTS:
- Generate migrations for all new entities
- Create proper relationships between entities
- Add database indexes for performance
- Include data seeding for development

ENTITIES TO MIGRATE:
- Brands, Models, Leathertypes, Options, Extras, Presets, Products
- Update existing entity relationships
- Add missing foreign keys and constraints

MIGRATION TASKS:
1. Generate migrations for new entities
2. Update existing entity relationships
3. Add performance indexes
4. Create seed data for testing

VERIFICATION:
cd backend && npm run migration:generate -- CreateProductEntities
cd backend && npm run migration:run
cd backend && npm run seed:run:relational

Output <promise>MIGRATIONS_COMPLETE</promise> when all migrations are created and applied." --max-iterations 20
```

#### Database Seeding
```bash
/ralph-wiggum:ralph-loop "Create comprehensive database seeding for OMS development and testing.

SEEDING REQUIREMENTS:
- Create realistic test data for all entities
- Maintain referential integrity
- Include data for all user roles
- Create interconnected test scenarios

SEED DATA TO CREATE:
- Users with all 5 role levels
- Brands and product models
- Leathertypes and options
- Sample customers and orders
- Product configurations and presets

SEED STRUCTURE:
- Basic reference data (brands, models, leathertypes)
- User accounts for testing
- Sample customer data
- Order scenarios covering different workflows
- Product configurations for testing

VERIFICATION: cd backend && npm run seed:run:relational && npm run test:seeded-data

Output <promise>DATABASE_SEEDING_COMPLETE</promise> when comprehensive seed data is created." --max-iterations 15
```

## Backend Development Patterns

### Entity Implementation Checklist

For each new entity module, ensure:
- [ ] Domain model with validation rules
- [ ] TypeORM entity with proper decorators
- [ ] Repository interface and implementation
- [ ] Service with CRUD operations and OData integration
- [ ] Controller with JWT authentication guards
- [ ] Complete DTO set (create, update, query)
- [ ] Entity mapper for DTO conversion
- [ ] NestJS module registration
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] API documentation

### Authentication Pattern
```typescript
@Controller('api/entity')
@ApiTags('Entity Management')
@UseGuards(JwtAuthGuard)
export class EntityController {
  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async findAll(@Query() query: QueryEntityDto) {
    return this.service.findAll(query);
  }
}
```

### Service Pattern with OData
```typescript
@Injectable()
export class EntityService {
  constructor(
    private readonly queryService: QueryService,
    private readonly entityRepository: EntityRepository,
  ) {}

  async findAll(query: QueryEntityDto) {
    return this.queryService.buildAndExecuteQuery({
      repository: this.entityRepository,
      query,
      searchFields: ['name', 'description'],
    });
  }
}
```

## Performance Monitoring

### Key Metrics to Track
- API response times (<100ms target)
- Database query performance
- Cache hit rates (>85% target)
- Memory usage and optimization
- Concurrent user handling

### Monitoring Implementation
```bash
# Add performance monitoring
/ralph-wiggum:ralph-loop "Add comprehensive performance monitoring to OMS backend.

MONITORING REQUIREMENTS:
- Response time tracking for all endpoints
- Database query performance monitoring
- Cache hit rate monitoring
- Memory and CPU usage tracking
- Error rate and availability monitoring

IMPLEMENTATION:
- Add performance interceptors
- Integrate with monitoring tools (Prometheus, Grafana)
- Create performance dashboards
- Set up alerting for performance issues

VERIFICATION: cd backend && npm run test:monitoring

Output <promise>MONITORING_IMPLEMENTED</promise> when monitoring is operational." --max-iterations 15
```

## Quick Commands Reference

### Essential Backend Commands
```bash
# Implement all 7 missing entities
./scripts/start-ralph.sh  # Option 2

# Enable authentication guards
./scripts/start-ralph.sh  # Option 3

# Individual entity (replace EntityName)
/ralph-wiggum:ralph-loop "Implement [EntityName]Module following backend/src/customers/ pattern. Include entity, service, controller with @UseGuards(JwtAuthGuard), DTOs, tests. Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise>." --max-iterations 20

# Performance optimization
/ralph-wiggum:ralph-loop "Optimize OMS backend performance: database queries, caching, response times. Output <promise>PERFORMANCE_OPTIMIZED</promise>." --max-iterations 15

# Comprehensive testing
/ralph-wiggum:ralph-loop "Create comprehensive test suite for OMS backend with >90% coverage. Output <promise>COMPREHENSIVE_TESTS_COMPLETE</promise>." --max-iterations 25
```

## Integration with Frontend

### API Format Compatibility
Ensure all backend responses match frontend expectations:
```typescript
// Standard response format
{
  'hydra:member': Entity[],
  'hydra:totalItems': number,
  'hydra:view': PaginationView,
  '@context': string,
  '@id': string,
  '@type': string
}
```

### CORS Configuration
```typescript
// backend/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

For complete integration guidance, see:
- `/docs/RALPH-LOOP-INTEGRATION.md`
- `/docs/PHASE-2-INTEGRATION-TESTING.md`
- `frontend/docs/api-integration.md`
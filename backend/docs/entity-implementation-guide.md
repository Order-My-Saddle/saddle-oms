# Entity Implementation Guide with Ralph Loop

## Overview

Step-by-step guide for implementing new entities in the OMS NestJS backend using Ralph Loop automation. This guide ensures consistency with existing patterns and comprehensive implementation.

## Entity Implementation Pattern

### Standard Entity Structure
```
backend/[entity]/
├── domain/
│   ├── [entity].ts                    # Domain model
│   └── [entity].repository.ts         # Repository interface
├── infrastructure/
│   ├── persistence/
│   │   ├── relational/
│   │   │   ├── entities/[entity].entity.ts        # TypeORM entity
│   │   │   ├── repositories/[entity].repository.impl.ts  # Repository implementation
│   │   │   └── mappers/[entity].mapper.ts         # DTO mapping
├── [entity].service.ts                # Business logic
├── [entity].controller.ts             # REST endpoints
├── dto/
│   ├── create-[entity].dto.ts         # Creation validation
│   ├── update-[entity].dto.ts         # Update validation
│   └── query-[entity].dto.ts          # Query parameters
├── [entity].module.ts                 # NestJS module
└── __tests__/                        # Test files
    ├── [entity].service.spec.ts
    ├── [entity].controller.spec.ts
    └── [entity].e2e.spec.ts
```

## Ralph Loop Implementation Commands

### 1. Quick Single Entity Implementation

```bash
# Template for any entity
/ralph-wiggum:ralph-loop "Implement [EntityName]Module for OMS backend following the exact pattern in backend/src/customers/.

ENTITY: [EntityName] (e.g., Brand, Model, Leathertype, Option, Extra, Preset, Product)

REQUIRED COMPONENTS:
1. Domain model: domain/[entity].ts
2. TypeORM entity: infrastructure/persistence/relational/entities/[entity].entity.ts
3. Repository interface: domain/[entity].repository.ts
4. Repository implementation: infrastructure/persistence/relational/repositories/[entity].repository.impl.ts
5. Service: [entity].service.ts with OData integration
6. Controller: [entity].controller.ts with @UseGuards(JwtAuthGuard)
7. DTOs: create, update, query DTOs
8. Mapper: infrastructure/persistence/relational/mappers/[entity].mapper.ts
9. Module: [entity].module.ts
10. Tests: Comprehensive test coverage (>90%)

AUTHENTICATION:
- Enable @UseGuards(JwtAuthGuard) on all endpoints
- NO TODO comments about authentication
- Test with all 5 user roles

VALIDATION:
- Use class-validator decorators in DTOs
- Implement proper error handling
- Add input sanitization

VERIFICATION: cd backend && npm run test [entity] && npm run lint

Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise> when module is fully implemented, tested, and authentication is working." --max-iterations 25
```

### 2. Product Catalog Entities (Recommended Order)

#### Step 1: Brands Module (Foundation)
```bash
/ralph-wiggum:ralph-loop "Implement BrandsModule for OMS product catalog following backend/src/customers/ pattern.

BRAND ENTITY SPECIFICATION:
- Basic brand information (id, name, description, logoUrl, website)
- Timestamps (createdAt, updatedAt)
- Soft delete capability (deletedAt)
- Search capabilities on name and description
- Unique constraint on name

RELATIONSHIPS:
- OneToMany with Models
- OneToMany with Products

BUSINESS LOGIC:
- Brand validation and normalization
- Search and filtering
- Pagination support

ENDPOINTS:
- GET /api/brands - List all brands with pagination
- GET /api/brands/:id - Get specific brand
- POST /api/brands - Create new brand (ADMIN+ only)
- PUT /api/brands/:id - Update brand (ADMIN+ only)
- DELETE /api/brands/:id - Soft delete brand (ADMIN+ only)

VERIFICATION: cd backend && npm run test brands && npm run lint

Output <promise>BRANDS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 20
```

#### Step 2: Models Module (Depends on Brands)
```bash
/ralph-wiggum:ralph-loop "Implement ModelsModule for OMS with Brand relationship following backend/src/customers/ pattern.

MODEL ENTITY SPECIFICATION:
- Model information (id, name, description, brandId, specifications)
- ManyToOne relationship to Brand entity
- Timestamps and soft delete
- Search capabilities
- Unique constraint on name within brand

RELATIONSHIPS:
- ManyToOne with Brand
- OneToMany with Products

BUSINESS LOGIC:
- Model validation with brand existence check
- Brand-specific model queries
- Search and filtering by brand

ENDPOINTS:
- GET /api/models - List all models with brand info
- GET /api/models/:id - Get specific model with brand
- GET /api/brands/:brandId/models - Get models for specific brand
- POST /api/models - Create new model (ADMIN+ only)
- PUT /api/models/:id - Update model (ADMIN+ only)
- DELETE /api/models/:id - Soft delete model (ADMIN+ only)

VERIFICATION: cd backend && npm run test models && npm run lint

Output <promise>MODELS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 20
```

#### Step 3: Leathertypes Module
```bash
/ralph-wiggum:ralph-loop "Implement LeathertypesModule for OMS saddle materials following backend/src/customers/ pattern.

LEATHERTYPE ENTITY SPECIFICATION:
- Leather information (id, name, description, color, texture, grade)
- Pricing information (basePrice, priceModifier)
- Availability status (available, discontinued)
- Timestamps and soft delete
- Search capabilities

RELATIONSHIPS:
- ManyToMany with Products
- OneToMany with OrderItems (through Products)

BUSINESS LOGIC:
- Leathertype categorization and filtering
- Price calculation with modifiers
- Availability checking

ENDPOINTS:
- GET /api/leathertypes - List all leathertypes with filters
- GET /api/leathertypes/:id - Get specific leathertype
- POST /api/leathertypes - Create new leathertype (ADMIN+ only)
- PUT /api/leathertypes/:id - Update leathertype (ADMIN+ only)
- DELETE /api/leathertypes/:id - Soft delete leathertype (ADMIN+ only)

VERIFICATION: cd backend && npm run test leathertypes && npm run lint

Output <promise>LEATHERTYPES_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 20
```

#### Step 4: Options Module
```bash
/ralph-wiggum:ralph-loop "Implement OptionsModule for OMS product customization following backend/src/customers/ pattern.

OPTION ENTITY SPECIFICATION:
- Option information (id, name, description, category, type)
- Pricing (basePrice, priceModifier, percentage)
- Compatibility rules (compatibleBrands, compatibleModels)
- Timestamps and soft delete

RELATIONSHIPS:
- ManyToMany with Products
- ManyToMany with Brands (compatibility)
- ManyToMany with Models (compatibility)

BUSINESS LOGIC:
- Option compatibility validation
- Price calculation with different modifier types
- Category-based filtering and grouping

ENDPOINTS:
- GET /api/options - List all options with category filters
- GET /api/options/:id - Get specific option
- GET /api/options/category/:category - Get options by category
- POST /api/options - Create new option (ADMIN+ only)
- PUT /api/options/:id - Update option (ADMIN+ only)
- DELETE /api/options/:id - Soft delete option (ADMIN+ only)

VERIFICATION: cd backend && npm run test options && npm run lint

Output <promise>OPTIONS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 20
```

#### Step 5: Extras Module
```bash
/ralph-wiggum:ralph-loop "Implement ExtrasModule for OMS additional product items following backend/src/customers/ pattern.

EXTRA ENTITY SPECIFICATION:
- Extra item information (id, name, description, sku, category)
- Pricing and inventory (price, stockLevel, lowStockThreshold)
- Compatibility with products
- Timestamps and soft delete

RELATIONSHIPS:
- ManyToMany with Products
- OneToMany with OrderItems

BUSINESS LOGIC:
- Inventory management and tracking
- Compatibility validation
- Price and stock level management

ENDPOINTS:
- GET /api/extras - List all extras with inventory info
- GET /api/extras/:id - Get specific extra
- GET /api/extras/category/:category - Get extras by category
- POST /api/extras - Create new extra (ADMIN+ only)
- PUT /api/extras/:id - Update extra (ADMIN+ only)
- DELETE /api/extras/:id - Soft delete extra (ADMIN+ only)

VERIFICATION: cd backend && npm run test extras && npm run lint

Output <promise>EXTRAS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 20
```

#### Step 6: Presets Module
```bash
/ralph-wiggum:ralph-loop "Implement PresetsModule for OMS saved product configurations following backend/src/customers/ pattern.

PRESET ENTITY SPECIFICATION:
- Preset information (id, name, description, userId, isPublic)
- Configuration data (brandId, modelId, selectedOptions, selectedExtras, leathertype)
- Sharing and visibility settings
- Timestamps and soft delete

RELATIONSHIPS:
- ManyToOne with User (creator)
- ManyToOne with Brand
- ManyToOne with Model
- ManyToMany with Options
- ManyToMany with Extras
- ManyToOne with Leathertype

BUSINESS LOGIC:
- Preset validation and configuration checking
- User-specific and public preset management
- Configuration compatibility validation

ENDPOINTS:
- GET /api/presets - List user's presets and public presets
- GET /api/presets/:id - Get specific preset with full configuration
- GET /api/presets/user/:userId - Get user's presets (own or public)
- POST /api/presets - Create new preset (USER+ only)
- PUT /api/presets/:id - Update preset (owner or ADMIN+ only)
- DELETE /api/presets/:id - Delete preset (owner or ADMIN+ only)

VERIFICATION: cd backend && npm run test presets && npm run lint

Output <promise>PRESETS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 25
```

#### Step 7: Products Module (Complex - Main Entity)
```bash
/ralph-wiggum:ralph-loop "Implement ProductsModule for OMS main product entity with comprehensive relationships following backend/src/customers/ pattern.

PRODUCT ENTITY SPECIFICATION:
- Core product info (id, name, description, sku, basePrice, status)
- Relationships to all product catalog entities
- Configuration and customization capabilities
- Inventory and pricing management
- Timestamps and soft delete

RELATIONSHIPS:
- ManyToOne with Brand (required)
- ManyToOne with Model (required)
- ManyToOne with Leathertype (default, can be overridden in orders)
- ManyToMany with Options (available customizations)
- ManyToMany with Extras (compatible additional items)
- OneToMany with OrderItems
- OneToMany with Reviews (if review system exists)

BUSINESS LOGIC:
- Complex price calculation with options and modifiers
- Configuration validation and compatibility checking
- Inventory management with variants
- Advanced search and filtering across all relationships
- Product recommendation logic

ENDPOINTS:
- GET /api/products - Advanced search with multiple filters
- GET /api/products/:id - Get product with full configuration options
- GET /api/products/brand/:brandId - Get products by brand
- GET /api/products/model/:modelId - Get products by model
- GET /api/products/search - Advanced search with multiple criteria
- POST /api/products - Create new product (ADMIN+ only)
- PUT /api/products/:id - Update product (ADMIN+ only)
- DELETE /api/products/:id - Soft delete product (ADMIN+ only)

ADVANCED FEATURES:
- Configuration validation endpoint
- Price calculation endpoint with full configuration
- Compatibility checking for options/extras combinations
- Product recommendation based on user preferences

VERIFICATION: cd backend && npm run test products && npm run lint

Output <promise>PRODUCTS_MODULE_COMPLETE</promise> when complete and tested." --max-iterations 30
```

### 3. All-In-One Implementation
```bash
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) for OMS following the exact patterns in backend/src/customers/.

IMPLEMENTATION ORDER:
1. Brands (foundation entity)
2. Models (depends on Brands)
3. Leathertypes (independent material entity)
4. Options (customization options)
5. Extras (additional items)
6. Presets (saved configurations, depends on all above)
7. Products (main entity, depends on all above)

EACH MODULE MUST INCLUDE:
- Complete domain model with validation
- TypeORM entity with proper relationships
- Repository interface and implementation
- Service with CRUD and OData integration
- Controller with @UseGuards(JwtAuthGuard) enabled
- Complete DTO set (create, update, query)
- Entity mapper for transformations
- NestJS module registration
- Comprehensive tests (>90% coverage)
- API documentation with Swagger

AUTHENTICATION & SECURITY:
- Enable JWT guards on ALL endpoints
- Implement role-based access control
- No TODO comments about authentication
- Test with all 5 user roles (USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR)

RELATIONSHIPS TO IMPLEMENT:
- Brand → Models (OneToMany)
- Brand → Products (OneToMany)
- Model → Products (OneToMany)
- Product → Options (ManyToMany)
- Product → Extras (ManyToMany)
- Product → Leathertype (ManyToOne)
- User → Presets (OneToMany)
- Preset → Brand/Model/Options/Extras/Leathertype (various relationships)

SUCCESS CRITERIA:
- All 7 modules compile without errors
- Authentication guards enabled and working
- Test coverage >90% for each module
- All existing tests still pass
- Backend starts successfully
- All CRUD operations functional
- Relationships working correctly
- Frontend pages can connect (brands, models, etc.)

VERIFICATION: cd backend && npm run test && npm run lint && npm run test:e2e

Output <promise>ALL_PRODUCT_ENTITIES_COMPLETE</promise> when all 7 modules are fully implemented, tested, and integrated." --max-iterations 50
```

## Entity Implementation Checklist

### Before Implementation
- [ ] Review existing customer/order modules for patterns
- [ ] Understand entity relationships and dependencies
- [ ] Plan implementation order (dependencies first)
- [ ] Prepare test data and scenarios

### During Implementation
- [ ] Follow exact directory structure
- [ ] Use consistent naming conventions
- [ ] Implement proper TypeScript types
- [ ] Add comprehensive validation
- [ ] Enable authentication guards
- [ ] Write tests as you go

### After Implementation
- [ ] Run tests and verify coverage
- [ ] Test authentication with different roles
- [ ] Verify frontend connectivity
- [ ] Check performance and optimization
- [ ] Update API documentation
- [ ] Create/update migrations if needed

## Common Implementation Issues and Solutions

### Authentication Issues
```bash
# If authentication guards aren't working
1. Check JWT configuration in auth module
2. Verify guard imports in controllers
3. Test with valid JWT tokens
4. Check role-based access control
```

### Relationship Issues
```bash
# If entity relationships fail
1. Verify TypeORM entity decorators
2. Check foreign key constraints
3. Test cascade operations
4. Verify mapper transformations
```

### Testing Issues
```bash
# If tests fail
1. Check test database setup
2. Verify mock configurations
3. Test individual components first
4. Check async operations
```

### Performance Issues
```bash
# If queries are slow
1. Add database indexes
2. Optimize query patterns
3. Implement caching
4. Check N+1 query issues
```

## Integration with Existing System

### Update App Module
After implementing entities, update `backend/src/app.module.ts`:
```typescript
// Add new modules to imports array
imports: [
  // ... existing modules
  BrandsModule,
  ModelsModule,
  LeathertypesModule,
  OptionsModule,
  ExtrasModule,
  PresetsModule,
  ProductsModule,
]
```

### Update Database Migrations
```bash
# Generate migrations for new entities
cd backend && npm run migration:generate -- CreateProductEntities
cd backend && npm run migration:run
```

### Update Seeds
```bash
# Add seed data for new entities
cd backend && npm run seed:run:relational
```

## Quick Reference Commands

```bash
# Individual entity (replace [Entity] with actual entity name)
/ralph-wiggum:ralph-loop "Implement [Entity]Module following backend/src/customers/ pattern. Include entity, service, controller with @UseGuards(JwtAuthGuard), DTOs, tests. Output <promise>[ENTITY]_MODULE_COMPLETE</promise>." --max-iterations 20

# All 7 entities at once
# Use the "All-In-One Implementation" command above

# Check implementation progress
cd backend && npm run test && npm run lint

# Test specific entity
cd backend && npm run test [entity-name]

# Start backend to test
cd backend && npm run start:dev
```

For detailed Ralph Loop usage, see:
- `docs/RALPH-LOOP-INTEGRATION.md`
- `docs/RALPH-QUICK-REFERENCE.md`
- `scripts/start-ralph.sh`
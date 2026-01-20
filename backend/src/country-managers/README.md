# Country Manager Module

Complete NestJS module for managing country managers who oversee specific countries or regions.

## Overview

Country managers are users who have responsibility for managing operations in specific countries or regions. This module provides full CRUD operations and advanced querying capabilities.

## Module Structure

```
country-managers/
├── dto/
│   ├── country-manager.dto.ts          # Response DTO
│   ├── create-country-manager.dto.ts   # Create request DTO
│   ├── update-country-manager.dto.ts   # Update request DTO
│   └── query-country-manager.dto.ts    # Query/filter DTO
├── infrastructure/
│   └── persistence/
│       └── relational/
│           ├── entities/
│           │   └── country-manager.entity.ts
│           ├── repositories/
│           │   └── country-manager.repository.ts
│           └── relational-persistence.module.ts
├── country-manager.controller.ts
├── country-manager.service.ts
└── country-manager.module.ts
```

## Database Schema

**Table**: `country_manager`

### Columns

- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to user table
- `country` (VARCHAR 100) - Country name (required)
- `region` (VARCHAR 100) - Optional region within country
- `is_active` (BOOLEAN) - Active status (default: true)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `deleted_at` (TIMESTAMP) - Soft delete timestamp
- `created_by` (UUID) - Creator user ID
- `updated_by` (UUID) - Last updater user ID

### Indexes

- `country_manager_user_index` on `user_id`
- `country_manager_country_index` on `country`
- `country_manager_region_index` on `region`
- `country_manager_active_index` on `is_active`

## API Endpoints

All endpoints require JWT authentication (`@UseGuards(AuthGuard("jwt"))`).

Base path: `/v1/country_managers`

### POST /v1/country_managers

Create a new country manager.

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "country": "United Kingdom",
  "region": "Scotland",
  "isActive": true
}
```

**Response**: `201 Created` with CountryManagerDto

### GET /v1/country_managers

Get all country managers with optional filtering.

**Query Parameters**:
- `filters` - JSON string with filter options
- `sort` - JSON string with sort options

**Example**:
```
GET /v1/country_managers?filters={"country":"United Kingdom","isActive":true}
```

**Response**: `200 OK` with array of CountryManagerDto

### GET /v1/country_managers/active

Get all active country managers.

**Response**: `200 OK` with array of CountryManagerDto

### GET /v1/country_managers/statistics/overview

Get country manager statistics.

**Response**:
```json
{
  "total": 50,
  "active": 45,
  "inactive": 5
}
```

### GET /v1/country_managers/country/:country

Get country managers by country name.

**Parameters**:
- `country` - Country name (e.g., "United Kingdom")

**Response**: `200 OK` with array of CountryManagerDto

### GET /v1/country_managers/region/:region

Get country managers by region.

**Parameters**:
- `region` - Region name (e.g., "Scotland")

**Response**: `200 OK` with array of CountryManagerDto

### GET /v1/country_managers/:id

Get country manager by UUID.

**Parameters**:
- `id` - Country manager UUID

**Response**: `200 OK` with CountryManagerDto or `404 Not Found`

### PATCH /v1/country_managers/:id

Update country manager.

**Parameters**:
- `id` - Country manager UUID

**Request Body**: Partial UpdateCountryManagerDto

**Response**: `200 OK` with updated CountryManagerDto

### DELETE /v1/country_managers/:id

Soft delete country manager (sets deletedAt timestamp).

**Parameters**:
- `id` - Country manager UUID

**Response**: `204 No Content`

## Service Methods

### CountryManagerService

- `create(dto)` - Create new country manager
- `findOne(id)` - Find by UUID
- `findAll(query)` - Find all with filters
- `update(id, dto)` - Update country manager
- `remove(id)` - Soft delete country manager
- `findByCountry(country)` - Find by country
- `findByRegion(region)` - Find by region
- `findActive()` - Find active managers
- `getCountryManagerStatistics()` - Get statistics

## Usage Examples

### Creating a Country Manager

```typescript
import { CountryManagerService } from './country-manager.service';

const countryManager = await countryManagerService.create({
  userId: 'user-uuid',
  country: 'United Kingdom',
  region: 'Scotland',
  isActive: true,
});
```

### Querying Country Managers

```typescript
// Find all country managers in UK
const ukManagers = await countryManagerService.findByCountry('United Kingdom');

// Find active managers
const activeManagers = await countryManagerService.findActive();

// Find with filters
const managers = await countryManagerService.findAll({
  filters: {
    country: 'United Kingdom',
    isActive: true,
  },
});
```

### Updating a Country Manager

```typescript
const updated = await countryManagerService.update(id, {
  region: 'Wales',
  isActive: false,
});
```

## Migration

Run the migration to create the table:

```bash
npm run migration:run
```

The migration file is located at:
```
backend/src/database/migrations/1736611200000-CreateCountryManagerTable.ts
```

## Testing

### Unit Tests

Test the service and controller logic:

```bash
npm run test -- country-manager
```

### E2E Tests

Test the API endpoints:

```bash
npm run test:e2e -- country-manager
```

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/swagger` - API documentation
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - ORM
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

## Security

- All endpoints require JWT authentication
- Soft delete prevents data loss
- Input validation on all DTOs
- UUID primary keys for security

## Best Practices

1. Always use UUIDs for IDs in new data
2. Preserve legacy IDs for production data migration
3. Use soft delete (deletedAt) instead of hard delete
4. Validate all inputs using class-validator decorators
5. Use proper HTTP status codes (201, 204, etc.)
6. Include proper API documentation with Swagger decorators

## Future Enhancements

- Add role-based access control for country managers
- Implement country manager hierarchy (regional managers)
- Add activity tracking and reporting
- Implement territory assignment for fitters
- Add integration with order routing based on country

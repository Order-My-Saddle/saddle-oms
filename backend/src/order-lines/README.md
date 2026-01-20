# Order Lines Module

Complete NestJS module for managing order line items in the OMS system.

## Module Structure

```
order-lines/
├── dto/
│   ├── create-order-line.dto.ts    # DTO for creating order lines
│   ├── update-order-line.dto.ts    # DTO for updating order lines
│   ├── query-order-line.dto.ts     # DTO for querying/filtering
│   └── order-line.dto.ts           # Response DTO
├── infrastructure/
│   └── persistence/
│       └── relational/
│           └── entities/
│               └── order-line.entity.ts  # TypeORM entity
├── order-line.controller.ts        # REST API controller
├── order-line.service.ts            # Business logic service
└── order-line.module.ts             # NestJS module definition
```

## Database Schema

**Table**: `order_line`

| Column        | Type          | Description                          |
|--------------|---------------|--------------------------------------|
| id           | uuid          | Primary key                          |
| order_id     | uuid          | Reference to orders table            |
| product_id   | uuid (null)   | Reference to products table          |
| quantity     | int           | Quantity (default: 1)                |
| unit_price   | decimal(10,2) | Price per unit                       |
| total_price  | decimal(10,2) | Total (quantity * unit_price)        |
| notes        | text (null)   | Additional notes                     |
| sequence     | int           | Display order (default: 0)           |
| created_at   | timestamp     | Creation timestamp                   |
| updated_at   | timestamp     | Last update timestamp                |
| deleted_at   | timestamp     | Soft delete timestamp                |

**Indexes**:
- order_id
- product_id
- (order_id, sequence) - composite
- created_at
- deleted_at

## API Endpoints

Base path: `/v1/order-lines`

### CRUD Operations

- `POST /` - Create a new order line
- `POST /bulk` - Bulk create order lines
- `GET /` - Get all order lines (with filtering & pagination)
- `GET /:id` - Get order line by ID
- `PATCH /:id` - Update order line
- `DELETE /:id` - Soft delete order line

### Order-Specific Operations

- `GET /order/:orderId` - Get all lines for an order
- `GET /order/:orderId/total` - Calculate order total
- `POST /order/:orderId/resequence` - Reorder line items

### Product Operations

- `GET /product/:productId` - Get all lines containing a product

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <jwt-token>
```

## Usage Examples

### Create Order Line

```typescript
POST /v1/order-lines
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "productId": "789e0123-e45b-67c8-d901-234567890abc",
  "quantity": 2,
  "unitPrice": 250.00,
  "totalPrice": 500.00,
  "notes": "Custom engraving requested",
  "sequence": 1
}
```

### Get Order Lines by Order

```typescript
GET /v1/order-lines/order/123e4567-e89b-12d3-a456-426614174000
```

### Calculate Order Total

```typescript
GET /v1/order-lines/order/123e4567-e89b-12d3-a456-426614174000/total

Response:
{
  "total": 1250.00
}
```

### Resequence Lines

```typescript
POST /v1/order-lines/order/123e4567-e89b-12d3-a456-426614174000/resequence
{
  "lineIds": [
    "line-id-3",
    "line-id-1",
    "line-id-2"
  ]
}
```

## Service Methods

### Core CRUD
- `create(createDto)` - Create single order line
- `findOne(id)` - Find by ID
- `findAll(queryDto)` - Find with filtering/pagination
- `update(id, updateDto)` - Update order line
- `remove(id)` - Soft delete

### Order Operations
- `findByOrderId(orderId)` - Get all lines for an order
- `calculateOrderTotal(orderId)` - Calculate total amount
- `resequence(orderId, lineIds)` - Reorder lines

### Product Operations
- `findByProductId(productId)` - Find lines by product

### Bulk Operations
- `bulkCreate(createDtos)` - Create multiple lines

## Integration

The module is registered in `app.module.ts`:

```typescript
import { OrderLineModule } from "./order-lines/order-line.module";

@Module({
  imports: [
    // ... other modules
    OrderModule,
    OrderLineModule,
    // ...
  ],
})
export class AppModule {}
```

## Features

- JWT authentication on all endpoints
- Soft delete support
- Pagination and filtering
- Order total calculation
- Line item resequencing
- Bulk operations
- Comprehensive Swagger/OpenAPI documentation
- TypeScript strict typing
- Input validation with class-validator
- Decimal precision for pricing (10,2)

## Next Steps

1. Generate database migration:
   ```bash
   cd backend
   npm run migration:generate -- database/migrations/CreateOrderLineTable
   npm run migration:run
   ```

2. Test the endpoints:
   ```bash
   npm run test
   ```

3. Access Swagger documentation:
   ```
   http://localhost:3000/docs
   ```

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - ORM for database operations
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `uuid` - UUID generation

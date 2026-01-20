# Order Product Saddles Module

This module manages the many-to-many relationship between Orders and Products (Saddles) in the OMS system.

## Overview

The OrderProductSaddle module provides a junction table that links orders with products, storing product-specific configuration, quantities, serial numbers, and other details for each product in an order.

## Architecture

This module follows NestJS best practices and the established patterns in the OMS codebase:

- **Controller**: REST API endpoints with JWT authentication
- **Service**: Business logic and data access
- **Entity**: TypeORM entity with database mapping
- **DTOs**: Data transfer objects for API contracts

## Entity Structure

### OrderProductSaddleEntity

**Table**: `order_product_saddle`

**Fields**:
- `id` (uuid, PK) - Unique identifier
- `order_id` (uuid, FK) - Reference to orders table
- `product_id` (uuid, FK) - Reference to saddles table
- `serial` (varchar(100), nullable) - Product serial number
- `configuration` (json, nullable) - Product configuration options
- `quantity` (int, default: 1) - Quantity of this product
- `notes` (text, nullable) - Product-specific notes
- `sequence` (int, default: 0) - Order sequence for multiple products
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `deleted_at` (timestamp, nullable) - Soft delete timestamp

**Indexes**:
- `order_id` - Fast lookups by order
- `product_id` - Fast lookups by product
- `serial` - Serial number searches
- `(order_id, sequence)` - Ordered product lists

**Relations**:
- `ManyToOne` → OrderEntity
- `ManyToOne` → SaddleEntity

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Base Path: `/v1/order_product_saddles`

### CRUD Operations

#### Create Order-Product Relationship
```http
POST /v1/order_product_saddles
```

**Request Body**:
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "productId": "789e0123-e45b-67c8-d901-234567890abc",
  "serial": "SN-2024-001234",
  "configuration": {
    "seatSize": "17.5",
    "leather": "Calfskin Brown",
    "flap": "Long",
    "extras": ["Extra padding"]
  },
  "quantity": 1,
  "notes": "Customer requested extra stitching",
  "sequence": 0
}
```

#### Get All Relationships
```http
GET /v1/order_product_saddles?orderId={uuid}&productId={uuid}&page=1&limit=50
```

#### Get Single Relationship
```http
GET /v1/order_product_saddles/:id
```

#### Update Relationship
```http
PATCH /v1/order_product_saddles/:id
```

**Request Body** (all fields optional):
```json
{
  "serial": "SN-2024-001235",
  "configuration": { "seatSize": "18.0" },
  "quantity": 2,
  "notes": "Updated notes",
  "sequence": 1
}
```

#### Delete Relationship
```http
DELETE /v1/order_product_saddles/:id
```

**Response**: 204 No Content

### Order-Specific Endpoints

#### Get Products for Order
```http
GET /v1/order_product_saddles/order/:orderId
```

Returns all products associated with a specific order, sorted by sequence.

#### Get Product Count for Order
```http
GET /v1/order_product_saddles/order/:orderId/count
```

**Response**:
```json
{
  "count": 3,
  "totalQuantity": 5
}
```

### Product-Specific Endpoints

#### Get Orders for Product
```http
GET /v1/order_product_saddles/product/:productId
```

Returns all orders that include a specific product, sorted by creation date (descending).

### Bulk Operations

#### Bulk Create
```http
POST /v1/order_product_saddles/bulk
```

**Request Body**:
```json
[
  {
    "orderId": "uuid1",
    "productId": "uuid2",
    "quantity": 1,
    "sequence": 0
  },
  {
    "orderId": "uuid1",
    "productId": "uuid3",
    "quantity": 2,
    "sequence": 1
  }
]
```

## Usage Examples

### TypeScript Service Usage

```typescript
import { OrderProductSaddleService } from './order-product-saddles';

// Inject in constructor
constructor(
  private readonly orderProductSaddleService: OrderProductSaddleService,
) {}

// Create relationship
const relationship = await this.orderProductSaddleService.create({
  orderId: 'order-uuid',
  productId: 'product-uuid',
  configuration: { seatSize: '17.5' },
  quantity: 1,
});

// Get products for order
const products = await this.orderProductSaddleService.findByOrderId('order-uuid');

// Get count and quantity
const count = await this.orderProductSaddleService.countByOrderId('order-uuid');
const totalQty = await this.orderProductSaddleService.getTotalQuantityByOrderId('order-uuid');
```

### Frontend API Call (fetch)

```javascript
// Create order-product relationship
const response = await fetch('/v1/order_product_saddles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: 'order-uuid',
    productId: 'product-uuid',
    configuration: { seatSize: '17.5', leather: 'Brown' },
    quantity: 1,
  }),
});

const result = await response.json();
```

## Configuration Options

The `configuration` field is a JSON object that can store any product-specific options:

```typescript
{
  seatSize: string;          // e.g., "17.5"
  leather: string;           // e.g., "Calfskin Brown"
  flap: string;              // e.g., "Long", "Short"
  panel: string;             // e.g., "Standard", "Custom"
  extras: string[];          // e.g., ["Extra padding", "Stirrup bars"]
  customOptions: object;     // Any additional custom configuration
}
```

## Validation

All DTOs use class-validator decorators for automatic validation:

- **orderId**: Required, must be valid UUID
- **productId**: Required, must be valid UUID
- **serial**: Optional, max 100 characters
- **configuration**: Optional, must be valid JSON object
- **quantity**: Optional, min 1, max 999, default 1
- **notes**: Optional, text field
- **sequence**: Optional, min 0, default 0

## Database Migration

To add this table to your database, create a migration:

```bash
npm run migration:create -- backend/database/migrations/CreateOrderProductSaddleTable
```

Then add the following to the migration:

```typescript
await queryRunner.query(`
  CREATE TABLE order_product_saddle (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    serial VARCHAR(100),
    configuration JSON,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    sequence INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES saddles(id)
  );

  CREATE INDEX idx_ops_order_id ON order_product_saddle(order_id);
  CREATE INDEX idx_ops_product_id ON order_product_saddle(product_id);
  CREATE INDEX idx_ops_serial ON order_product_saddle(serial);
  CREATE INDEX idx_ops_order_sequence ON order_product_saddle(order_id, sequence);
`);
```

## Testing

### Unit Tests

```typescript
describe('OrderProductSaddleService', () => {
  it('should create order-product relationship', async () => {
    const dto = {
      orderId: 'order-uuid',
      productId: 'product-uuid',
      quantity: 1,
    };
    const result = await service.create(dto);
    expect(result.orderId).toBe(dto.orderId);
    expect(result.productId).toBe(dto.productId);
  });
});
```

### Integration Tests

```typescript
describe('OrderProductSaddleController (e2e)', () => {
  it('/POST order_product_saddles', () => {
    return request(app.getHttpServer())
      .post('/v1/order_product_saddles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId: 'order-uuid',
        productId: 'product-uuid',
        quantity: 1,
      })
      .expect(201);
  });
});
```

## Security

- All endpoints protected with JWT authentication guard
- Input validation via class-validator
- SQL injection prevention via TypeORM parameterized queries
- Soft deletes for data retention

## Performance Considerations

- Indexes on `order_id` and `product_id` for fast lookups
- Composite index on `(order_id, sequence)` for ordered lists
- Pagination support in query endpoints
- Bulk create endpoint for efficient multiple insertions

## Module Files

```
order-product-saddles/
├── dto/
│   ├── create-order-product-saddle.dto.ts
│   ├── update-order-product-saddle.dto.ts
│   ├── query-order-product-saddle.dto.ts
│   └── order-product-saddle.dto.ts
├── infrastructure/
│   └── persistence/
│       └── relational/
│           └── entities/
│               └── order-product-saddle.entity.ts
├── order-product-saddle.controller.ts
├── order-product-saddle.service.ts
├── order-product-saddle.module.ts
├── index.ts
└── README.md
```

## Related Modules

- **OrderModule**: Parent order entity
- **ProductModule**: Product (saddle) entity
- **OrderLineModule**: Individual order line items

## Future Enhancements

- [ ] Add relationship validation (ensure order and product exist)
- [ ] Add configuration schema validation
- [ ] Add webhook events for relationship changes
- [ ] Add analytics for popular product configurations
- [ ] Add inventory tracking integration

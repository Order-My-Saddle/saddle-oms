# Comments Module

A comprehensive NestJS module for managing comments and notes associated with orders in the OMS system.

## Overview

The Comments module provides full CRUD functionality for order-related comments, supporting both internal staff notes and customer-facing communications. It follows NestJS best practices and integrates seamlessly with the existing OMS architecture.

## Features

- **Full CRUD Operations**: Create, read, update, and delete comments
- **Order-Specific Queries**: Retrieve all comments for a specific order
- **Internal/Public Separation**: Flag comments as internal or customer-facing
- **Comment Types**: Support for different comment categories (general, production, customer, internal, status_change)
- **User Attribution**: Track which user created each comment
- **Soft Deletes**: Comments are soft-deleted for audit trail
- **Bulk Operations**: Support for bulk comment creation during migrations
- **Statistics**: Get comment counts and breakdowns by type

## Architecture

### File Structure

```
comments/
├── dto/                                    # Data Transfer Objects
│   ├── comment.dto.ts                      # Response DTO
│   ├── create-comment.dto.ts               # Creation DTO
│   ├── update-comment.dto.ts               # Update DTO
│   └── query-comment.dto.ts                # Query/filter DTO
├── infrastructure/
│   └── persistence/
│       └── relational/
│           └── entities/
│               └── comment.entity.ts        # TypeORM entity
├── comments.controller.ts                   # REST API controller
├── comments.service.ts                      # Business logic service
├── comments.module.ts                       # NestJS module
├── index.ts                                 # Module exports
└── README.md                                # This file
```

## API Endpoints

All endpoints require JWT authentication via Bearer token.

### Base Path: `/v1/comments`

#### Create Comment
```http
POST /v1/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "789e0123-e45b-67c8-d901-234567890abc",
  "content": "Customer requested color change to black leather",
  "type": "customer",
  "isInternal": false
}
```

#### Get All Comments (with filtering)
```http
GET /v1/comments?orderId=123e4567-e89b-12d3-a456-426614174000&type=customer&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Single Comment
```http
GET /v1/comments/:id
Authorization: Bearer <token>
```

#### Get Comments by Order ID
```http
GET /v1/comments/order/:orderId
Authorization: Bearer <token>
```

#### Get Public Comments by Order ID
```http
GET /v1/comments/order/:orderId/public
Authorization: Bearer <token>
```

#### Get Internal Comments by Order ID
```http
GET /v1/comments/order/:orderId/internal
Authorization: Bearer <token>
```

#### Get Comment Statistics for Order
```http
GET /v1/comments/order/:orderId/stats
Authorization: Bearer <token>

Response:
{
  "total": 15,
  "internal": 8,
  "public": 7,
  "byType": {
    "general": 5,
    "production": 4,
    "customer": 6
  }
}
```

#### Get Comments by User ID
```http
GET /v1/comments/user/:userId
Authorization: Bearer <token>
```

#### Update Comment
```http
PATCH /v1/comments/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Updated comment content",
  "type": "production",
  "isInternal": true
}
```

#### Delete Comment (Soft Delete)
```http
DELETE /v1/comments/:id
Authorization: Bearer <token>

Response: 204 No Content
```

## Comment Types

The system supports the following comment types:

- **general**: General comments and notes
- **production**: Production-related comments
- **customer**: Customer communication and requests
- **internal**: Internal staff notes
- **status_change**: Comments related to order status changes

## Usage Examples

### Creating a Customer-Facing Comment

```typescript
import { CommentsService } from './comments/comments.service';

@Injectable()
export class OrderService {
  constructor(private commentsService: CommentsService) {}

  async addCustomerNote(orderId: string, userId: string, message: string) {
    return this.commentsService.create({
      orderId,
      userId,
      content: message,
      type: 'customer',
      isInternal: false,
    });
  }
}
```

### Creating an Internal Note

```typescript
async addInternalNote(orderId: string, userId: string, note: string) {
  return this.commentsService.create({
    orderId,
    userId,
    content: note,
    type: 'internal',
    isInternal: true,
  });
}
```

### Retrieving All Comments for an Order

```typescript
async getOrderComments(orderId: string) {
  return this.commentsService.findByOrderId(orderId);
}
```

### Getting Only Customer-Visible Comments

```typescript
async getPublicComments(orderId: string) {
  return this.commentsService.findPublicByOrderId(orderId);
}
```

### Bulk Creating Comments (Migration)

```typescript
async migrateComments(commentsData: CreateCommentDto[]) {
  return this.commentsService.bulkCreate(commentsData);
}
```

## Database Schema

### Table: `comment`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key |
| order_id | uuid | NO | - | Foreign key to orders table |
| user_id | uuid | YES | NULL | Foreign key to user table |
| content | text | NO | - | Comment content |
| type | varchar(50) | NO | 'general' | Comment type/category |
| is_internal | boolean | NO | false | Internal visibility flag |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

### Indexes

- `IDX_comment_order_id` - Order ID lookup
- `IDX_comment_user_id` - User ID lookup
- `IDX_comment_type` - Type filtering
- `IDX_comment_order_created` - Order + created date composite
- `IDX_comment_order_internal` - Order + internal flag composite
- `IDX_comment_created_at` - Creation date sorting
- `IDX_comment_deleted_at` - Soft delete filtering

### Foreign Keys

- `FK_comment_order_id` - References `orders(id)` ON DELETE CASCADE
- `FK_comment_user_id` - References `user(id)` ON DELETE SET NULL

## Integration with App Module

To enable the Comments module in your application:

```typescript
// src/app.module.ts
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // ... other modules
    CommentsModule,
  ],
})
export class AppModule {}
```

## Migration

Run the migration to create the comment table:

```bash
npm run migration:run
```

The migration file is located at:
`src/database/migrations/1736600000000-CreateCommentTable.ts`

## Testing

### Unit Tests

```bash
npm run test -- comments.service.spec.ts
npm run test -- comments.controller.spec.ts
```

### E2E Tests

```bash
npm run test:e2e -- comments.e2e-spec.ts
```

## Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Consider implementing role-based access control for internal comments
3. **Input Validation**: All DTOs use class-validator for input validation
4. **XSS Prevention**: Content should be sanitized when displayed in frontend
5. **Soft Deletes**: Comments are soft-deleted to maintain audit trail

## Performance Considerations

- Indexes on `order_id`, `user_id`, and `created_at` for fast queries
- Composite indexes for common query patterns
- Pagination support to limit large result sets
- Soft delete filtering using `deleted_at IS NULL`

## Future Enhancements

- [ ] Add mentions/tagging functionality (@username)
- [ ] Add comment threading/replies
- [ ] Add rich text formatting support
- [ ] Add file attachments to comments
- [ ] Add real-time notifications for new comments
- [ ] Add comment edit history/versioning
- [ ] Add comment reactions (like, helpful, etc.)
- [ ] Add full-text search capabilities

## Support

For issues or questions about the Comments module, please contact the development team.

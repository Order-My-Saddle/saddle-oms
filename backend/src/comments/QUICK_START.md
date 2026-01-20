# Comments Module - Quick Start Guide

## Installation

The module is already integrated. Just run the database migration:

```bash
cd backend
npm run migration:run
```

## Basic Usage

### Creating a Comment

```typescript
import { CommentsService } from './comments/comments.service';

@Injectable()
export class SomeService {
  constructor(private commentsService: CommentsService) {}

  async addOrderComment() {
    const comment = await this.commentsService.create({
      orderId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '789e0123-e45b-67c8-d901-234567890abc',
      content: 'Customer requested color change',
      type: 'customer',
      isInternal: false,
    });
    return comment;
  }
}
```

### Getting Comments for an Order

```typescript
async getOrderComments(orderId: string) {
  // Get all comments
  const allComments = await this.commentsService.findByOrderId(orderId);

  // Get only public comments
  const publicComments = await this.commentsService.findPublicByOrderId(orderId);

  // Get only internal comments
  const internalComments = await this.commentsService.findInternalByOrderId(orderId);

  return { allComments, publicComments, internalComments };
}
```

### Updating a Comment

```typescript
async updateComment(commentId: string) {
  return this.commentsService.update(commentId, {
    content: 'Updated content',
    isInternal: true,
  });
}
```

### Deleting a Comment (Soft Delete)

```typescript
async deleteComment(commentId: string) {
  await this.commentsService.remove(commentId);
}
```

## API Examples

### cURL Examples

#### Create Comment
```bash
curl -X POST http://localhost:3000/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "789e0123-e45b-67c8-d901-234567890abc",
    "content": "Customer requested color change to black leather",
    "type": "customer",
    "isInternal": false
  }'
```

#### Get Comments for Order
```bash
curl -X GET http://localhost:3000/v1/comments/order/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Comment Statistics
```bash
curl -X GET http://localhost:3000/v1/comments/order/123e4567-e89b-12d3-a456-426614174000/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Comment
```bash
curl -X PATCH http://localhost:3000/v1/comments/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated: Customer confirmed color change",
    "type": "production"
  }'
```

#### Delete Comment
```bash
curl -X DELETE http://localhost:3000/v1/comments/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Comment Types

Use these predefined types:

- `general` - General comments (default)
- `production` - Production-related notes
- `customer` - Customer communications
- `internal` - Internal staff notes
- `status_change` - Order status change notes

## Query Parameters

### Filtering
```bash
GET /v1/comments?orderId=123&type=customer&isInternal=false&page=1&limit=20
```

### Sorting
```bash
GET /v1/comments?sortBy=created_at&sortOrder=DESC
```

## Testing with Swagger

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. Open Swagger UI:
   ```
   http://localhost:3000/docs
   ```

3. Navigate to the "Comments" section

4. Click "Authorize" and enter your JWT token

5. Try out the endpoints interactively

## Common Patterns

### Auto-comment on Status Change

```typescript
async updateOrderStatus(orderId: string, newStatus: string, userId: string) {
  // Update order status
  await this.orderService.updateStatus(orderId, newStatus);

  // Auto-create comment
  await this.commentsService.create({
    orderId,
    userId,
    content: `Order status changed to: ${newStatus}`,
    type: 'status_change',
    isInternal: true,
  });
}
```

### Comment with Mention

```typescript
async notifyFitter(orderId: string, fitterId: string, message: string, userId: string) {
  await this.commentsService.create({
    orderId,
    userId,
    content: `@fitter ${message}`,
    type: 'internal',
    isInternal: true,
  });

  // TODO: Send notification to fitter
}
```

### Get Recent Activity

```typescript
async getRecentActivity(orderId: string) {
  const comments = await this.commentsService.findByOrderId(orderId);

  // Get last 5 comments
  const recent = comments.slice(0, 5);

  return recent.map(c => ({
    date: c.createdAt,
    user: c.userId,
    action: `Commented: ${c.content.substring(0, 50)}...`,
  }));
}
```

## Performance Tips

1. **Use Pagination**: Always paginate large result sets
   ```typescript
   const comments = await this.commentsService.findAll({
     orderId,
     page: 1,
     limit: 20,
   });
   ```

2. **Filter Early**: Use query parameters to filter at database level
   ```typescript
   const internalComments = await this.commentsService.findAll({
     orderId,
     isInternal: true,
   });
   ```

3. **Batch Operations**: Use bulk create for migrations
   ```typescript
   await this.commentsService.bulkCreate(manyComments);
   ```

## Security Notes

1. All endpoints require JWT authentication
2. Consider adding role-based access for internal comments
3. Sanitize content before displaying in HTML
4. Validate user has permission to view order before showing comments

## Troubleshooting

### Migration Fails
```bash
# Check if orders table exists first
psql -d your_database -c "SELECT COUNT(*) FROM orders;"

# Run migration
npm run migration:run
```

### Comments Not Showing
```bash
# Check if soft-deleted
SELECT * FROM comment WHERE deleted_at IS NOT NULL;

# Check foreign key constraints
SELECT * FROM comment WHERE order_id NOT IN (SELECT id FROM orders);
```

### Performance Issues
```bash
# Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'comment';

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM comment WHERE order_id = 'uuid';
```

## Support

For detailed documentation, see:
- `README.md` - Full module documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- Swagger UI at `/docs` - Interactive API documentation

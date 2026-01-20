# API Reference

Comprehensive documentation for the Order Management System REST API. This guide covers all available endpoints, authentication, request/response formats, and usage examples.

## 🔗 Base Information

### API Base URL
- **Development**: `http://localhost:3001`
- **Staging**: `https://staging-api.ordermysaddle.com`
- **Production**: `https://api.ordermysaddle.com`

### API Version
- **Current Version**: `v1`
- **API Versioning**: URI-based (`/api/v1/`)

### Content Type
- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

## 🔐 Authentication

### JWT Bearer Token
All protected endpoints require a JWT token in the Authorization header.

```http
Authorization: Bearer <your_jwt_token>
```

### Login Endpoint

**POST** `/auth/login`

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "USER|FITTER|SUPPLIER|SUPERVISOR|ADMIN",
    "firstName": "string",
    "lastName": "string"
  }
}
```

### Refresh Token

**POST** `/auth/refresh`

```http
Authorization: Bearer <current_token>
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

**POST** `/auth/logout`

```http
Authorization: Bearer <token>
```

## 📊 Common Response Formats

### Standard Response Structure

```json
{
  "data": {}, // Response data
  "meta": {   // Metadata (for lists)
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Error Response Structure

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### HTTP Status Codes

- **200 OK** - Successful GET, PUT, PATCH
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server error

## 📋 Orders API

### List Orders

**GET** `/orders`

**Query Parameters:**
```
page?: number = 1
limit?: number = 10
$filter?: string (OData-style filtering)
$orderby?: string (Sorting)
$search?: string (Text search)
```

**Example Request:**
```http
GET /orders?page=1&limit=20&$filter=status eq 'pending'&$orderby=createdAt desc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderId": "ORD-12345",
      "status": "pending",
      "urgent": false,
      "customer": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "fitter": {
        "id": "uuid",
        "name": "Jane Smith",
        "region": "Europe"
      },
      "product": {
        "id": "uuid",
        "name": "Custom Saddle Model A",
        "brand": "Premium Saddles"
      },
      "totalAmount": 2500.00,
      "currency": "EUR",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Get Single Order

**GET** `/orders/{id}`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "orderId": "ORD-12345",
    "status": "pending",
    "urgent": false,
    "customer": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "fitter": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "region": "Europe"
    },
    "product": {
      "id": "uuid",
      "name": "Custom Saddle Model A",
      "brand": "Premium Saddles",
      "model": "Professional Series",
      "leatherType": "Calfskin",
      "options": [
        {
          "id": "uuid",
          "name": "Extended Flaps",
          "price": 150.00
        }
      ],
      "extras": [
        {
          "id": "uuid",
          "name": "Custom Embossing",
          "price": 75.00
        }
      ]
    },
    "measurements": {
      "seatSize": 17.5,
      "treeWidth": "Medium",
      "panelType": "Wool",
      "customNotes": "Extra padding requested"
    },
    "pricing": {
      "basePrice": 2000.00,
      "optionsTotal": 150.00,
      "extrasTotal": 75.00,
      "discountAmount": 0.00,
      "taxAmount": 275.00,
      "totalAmount": 2500.00,
      "currency": "EUR"
    },
    "timeline": {
      "estimatedCompletion": "2024-03-15T00:00:00.000Z",
      "actualCompletion": null,
      "milestones": [
        {
          "name": "Order Confirmed",
          "date": "2024-01-15T10:00:00.000Z",
          "completed": true
        },
        {
          "name": "Measurements Taken",
          "date": null,
          "completed": false
        }
      ]
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Order

**POST** `/orders`

**Request Body:**
```json
{
  "customerId": "uuid",
  "productId": "uuid",
  "fitterId": "uuid",
  "urgent": false,
  "measurements": {
    "seatSize": 17.5,
    "treeWidth": "Medium",
    "panelType": "Wool",
    "customNotes": "Extra padding requested"
  },
  "options": ["uuid1", "uuid2"],
  "extras": ["uuid3"],
  "specialInstructions": "Rush order for competition",
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Amsterdam",
    "postalCode": "1000 AA",
    "country": "Netherlands"
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "orderId": "ORD-12346",
    "status": "pending",
    // ... full order object
  }
}
```

### Update Order

**PUT** `/orders/{id}`

**Request Body:**
```json
{
  "status": "in_progress",
  "fitterId": "uuid",
  "measurements": {
    "seatSize": 17.5,
    "treeWidth": "Medium-Wide",
    "panelType": "Foam",
    "customNotes": "Updated measurements after fitting"
  }
}
```

**Response:** `200 OK`

### Delete Order

**DELETE** `/orders/{id}`

**Response:** `204 No Content`

### Order Actions

**POST** `/orders/{id}/approve`

**Request Body:**
```json
{
  "approvedBy": "uuid",
  "notes": "Approved for production"
}
```

**POST** `/orders/{id}/cancel`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation",
  "refundAmount": 2500.00
}
```

**POST** `/orders/{id}/complete`

**Request Body:**
```json
{
  "completedBy": "uuid",
  "qualityNotes": "All specifications met",
  "shippingTrackingNumber": "TRACK123456"
}
```

## 👥 Customers API

### List Customers

**GET** `/customers`

**Query Parameters:**
```
page?: number = 1
limit?: number = 10
$filter?: string
$search?: string
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "country": "Netherlands",
      "region": "Europe",
      "active": true,
      "totalOrders": 5,
      "totalSpent": 12500.00,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "totalPages": 25
  }
}
```

### Get Single Customer

**GET** `/customers/{id}`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Amsterdam",
      "postalCode": "1000 AA",
      "country": "Netherlands"
    },
    "preferences": {
      "preferredLeatherType": "Calfskin",
      "usualSeatSize": 17.5,
      "communicationPreference": "email"
    },
    "statistics": {
      "totalOrders": 5,
      "totalSpent": 12500.00,
      "averageOrderValue": 2500.00,
      "lastOrderDate": "2024-01-15T10:00:00.000Z"
    },
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Customer

**POST** `/customers`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Amsterdam",
    "postalCode": "1000 AA",
    "country": "Netherlands"
  },
  "preferences": {
    "preferredLeatherType": "Calfskin",
    "usualSeatSize": 17.5,
    "communicationPreference": "email"
  }
}
```

**Response:** `201 Created`

### Update Customer

**PUT** `/customers/{id}`

### Delete Customer

**DELETE** `/customers/{id}`

### Customer Orders

**GET** `/customers/{id}/orders`

Returns all orders for a specific customer with pagination.

## 🔧 Fitters API

### List Fitters

**GET** `/fitters`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "region": "Europe",
      "specialties": ["Dressage", "Jumping"],
      "active": true,
      "rating": 4.8,
      "totalFittings": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Fitter

**GET** `/fitters/{id}`

### Create Fitter

**POST** `/fitters`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "region": "Europe",
  "specialties": ["Dressage", "Jumping"],
  "qualifications": [
    {
      "name": "Certified Saddle Fitter",
      "issuingBody": "International Saddle Fitting Association",
      "dateObtained": "2020-01-01T00:00:00.000Z"
    }
  ],
  "serviceAreas": ["Netherlands", "Belgium", "Germany"]
}
```

### Fitter Schedule

**GET** `/fitters/{id}/schedule`

**Query Parameters:**
```
startDate: string (ISO date)
endDate: string (ISO date)
```

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-20",
      "appointments": [
        {
          "id": "uuid",
          "orderId": "uuid",
          "customer": "John Doe",
          "time": "10:00",
          "duration": 120,
          "status": "confirmed",
          "notes": "Initial fitting"
        }
      ],
      "availability": [
        {
          "startTime": "14:00",
          "endTime": "17:00"
        }
      ]
    }
  ]
}
```

## 🏭 Suppliers API

### List Suppliers

**GET** `/suppliers`

### Get Single Supplier

**GET** `/suppliers/{id}`

### Supplier Inventory

**GET** `/suppliers/{id}/inventory`

### Update Inventory

**PUT** `/suppliers/{id}/inventory/{itemId}`

**Request Body:**
```json
{
  "quantity": 50,
  "reservedQuantity": 5,
  "restockDate": "2024-02-01T00:00:00.000Z",
  "minimumStock": 10
}
```

## 🛍️ Products API

### List Products

**GET** `/products`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Custom Saddle Model A",
      "description": "Premium handcrafted saddle",
      "brand": {
        "id": "uuid",
        "name": "Premium Saddles",
        "country": "England"
      },
      "model": {
        "id": "uuid",
        "name": "Professional Series",
        "year": 2024
      },
      "basePrice": 2000.00,
      "currency": "EUR",
      "active": true,
      "images": [
        {
          "id": "uuid",
          "url": "https://example.com/image1.jpg",
          "alt": "Front view",
          "isPrimary": true
        }
      ],
      "specifications": {
        "weight": "5.2 kg",
        "materials": ["Calfskin", "Steel", "Wool"],
        "colors": ["Black", "Brown", "Tan"]
      }
    }
  ]
}
```

### Product Configuration

**GET** `/products/{id}/configuration`

Returns all available options and extras for a product.

**Response:**
```json
{
  "data": {
    "baseProduct": {
      "id": "uuid",
      "name": "Custom Saddle Model A",
      "basePrice": 2000.00
    },
    "leatherTypes": [
      {
        "id": "uuid",
        "name": "Calfskin",
        "priceModifier": 0.00,
        "available": true
      },
      {
        "id": "uuid",
        "name": "Buffalo Leather",
        "priceModifier": 200.00,
        "available": true
      }
    ],
    "options": [
      {
        "id": "uuid",
        "name": "Extended Flaps",
        "description": "Longer flaps for better leg position",
        "price": 150.00,
        "required": false,
        "category": "Flaps"
      }
    ],
    "extras": [
      {
        "id": "uuid",
        "name": "Custom Embossing",
        "description": "Personalized embossing on leather",
        "price": 75.00,
        "estimatedDays": 5
      }
    ]
  }
}
```

## 👤 Users API

### List Users

**GET** `/users`

**Requires:** ADMIN or SUPERVISOR role

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "active": true,
      "lastLogin": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create User

**POST** `/users`

**Requires:** ADMIN role

**Request Body:**
```json
{
  "username": "new_user",
  "email": "user@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "USER",
  "password": "securePassword123",
  "active": true
}
```

### Update User Role

**PATCH** `/users/{id}/role`

**Requires:** ADMIN role

**Request Body:**
```json
{
  "role": "FITTER"
}
```

## 📊 Reporting API

### Order Statistics

**GET** `/reports/orders/statistics`

**Query Parameters:**
```
startDate?: string (ISO date)
endDate?: string (ISO date)
groupBy?: 'day'|'week'|'month'
```

**Response:**
```json
{
  "data": {
    "totalOrders": 150,
    "completedOrders": 120,
    "pendingOrders": 25,
    "cancelledOrders": 5,
    "averageOrderValue": 2500.00,
    "totalRevenue": 375000.00,
    "trends": [
      {
        "period": "2024-01-01",
        "orders": 10,
        "revenue": 25000.00
      }
    ]
  }
}
```

### Customer Analytics

**GET** `/reports/customers/analytics`

### Performance Metrics

**GET** `/reports/performance`

**Response:**
```json
{
  "data": {
    "orderFulfillment": {
      "averageCompletionDays": 28,
      "onTimeDeliveryRate": 0.92
    },
    "customerSatisfaction": {
      "averageRating": 4.6,
      "responseRate": 0.85
    },
    "fitterPerformance": [
      {
        "fitterId": "uuid",
        "name": "Jane Smith",
        "completedFittings": 25,
        "averageRating": 4.8,
        "onTimeRate": 0.95
      }
    ]
  }
}
```

## 🔍 Search API

### Global Search

**GET** `/search`

**Query Parameters:**
```
q: string (required)
types?: string[] (orders,customers,products)
limit?: number = 20
```

**Response:**
```json
{
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderId": "ORD-12345",
        "customer": "John Doe",
        "status": "pending"
      }
    ],
    "customers": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "products": [
      {
        "id": "uuid",
        "name": "Custom Saddle Model A",
        "brand": "Premium Saddles"
      }
    ]
  },
  "meta": {
    "query": "john",
    "totalResults": 15,
    "searchTime": 0.025
  }
}
```

## 📁 File Upload API

### Upload File

**POST** `/files/upload`

**Request:** `multipart/form-data`
```
file: File (required)
category?: string (orders,products,documents)
description?: string
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "originalName": "order-specifications.pdf",
    "mimeType": "application/pdf",
    "size": 1024576,
    "url": "https://storage.example.com/files/uuid",
    "category": "orders",
    "uploadedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Get File

**GET** `/files/{id}`

Returns file metadata.

### Download File

**GET** `/files/{id}/download`

Returns the actual file content.

## 📡 WebSocket Events

### Real-time Order Updates

**Connection:** `ws://localhost:3001/orders`

**Authentication:** Include JWT token in connection query
```
ws://localhost:3001/orders?token=<jwt_token>
```

**Events:**
```javascript
// Order status changed
{
  "event": "order.status.changed",
  "data": {
    "orderId": "uuid",
    "oldStatus": "pending",
    "newStatus": "in_progress",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}

// New order created
{
  "event": "order.created",
  "data": {
    "orderId": "uuid",
    "customerId": "uuid",
    "urgent": false
  }
}

// Order assigned to fitter
{
  "event": "order.assigned",
  "data": {
    "orderId": "uuid",
    "fitterId": "uuid",
    "assignedBy": "uuid"
  }
}
```

## 🔧 Utility Endpoints

### Health Check

**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "redis": {
      "status": "up"
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### API Documentation

**GET** `/docs`

Returns interactive Swagger documentation.

### API Schema

**GET** `/docs/json`

Returns OpenAPI schema in JSON format.

## 📈 Rate Limiting

### Default Limits
- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **File uploads**: 10 uploads per hour
- **Search requests**: 60 requests per minute

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 🐛 Error Handling

### Common Error Responses

**Validation Error (422)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email must be a valid email address"
      }
    ]
  }
}
```

**Authentication Error (401)**
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication token is required"
  }
}
```

**Authorization Error (403)**
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "User does not have permission to access this resource",
    "requiredRole": "ADMIN"
  }
}
```

**Not Found Error (404)**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Order with ID 'uuid' not found"
  }
}
```

## 🧪 Testing the API

### Using cURL

```bash
# Login to get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use token for protected endpoints
curl -X GET http://localhost:3001/orders \
  -H "Authorization: Bearer <your_token>"

# Create a new order
curl -X POST http://localhost:3001/orders \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "productId": "uuid",
    "urgent": false
  }'
```

### Using JavaScript/Fetch

```javascript
// Login and store token
const loginResponse = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Use token for subsequent requests
const ordersResponse = await fetch('http://localhost:3001/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const orders = await ordersResponse.json();
```

## 📋 Best Practices

### API Usage Guidelines

1. **Always use HTTPS in production**
2. **Include proper error handling**
3. **Implement request timeouts**
4. **Use appropriate HTTP methods**
5. **Leverage caching headers**
6. **Respect rate limits**

### Performance Tips

1. **Use pagination for large datasets**
2. **Request only needed fields**
3. **Implement proper caching**
4. **Use compression (gzip)**
5. **Batch operations when possible**

### Security Recommendations

1. **Store tokens securely (httpOnly cookies)**
2. **Validate all input data**
3. **Use HTTPS for all requests**
4. **Implement CSRF protection**
5. **Regular token rotation**

## ⚡ Next Steps

- **[Authentication Guide](../frontend/docs/auth.md)** - Frontend authentication implementation
- **[API Integration](../frontend/docs/api-integration.md)** - Frontend API integration patterns
- **[Backend Documentation](../backend/docs/README.md)** - Backend implementation details
- **[Testing Guide](./testing.md)** - API testing strategies
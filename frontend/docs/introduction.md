# Introduction

The Order Management System (OMS) frontend is a modern Next.js application designed for saddle manufacturing order management. This documentation provides comprehensive guidance for developers working on the frontend application.

## 🎯 Project Purpose

The OMS frontend serves as the user interface for a comprehensive order management system specializing in custom saddle manufacturing. It facilitates:

- **Complex order workflows** with multiple stakeholders
- **Product customization** for bespoke saddle manufacturing
- **Multi-role user management** across the supply chain
- **Real-time order tracking** and status updates
- **Integration** with manufacturing and fulfillment systems

## 🏗️ System Architecture

### Migration Context

This application is part of a strategic migration from a legacy PHP/Symfony system to a modern stack:

- **Legacy**: Aurelia.js frontend + PHP/Symfony API
- **Current**: Next.js 15 frontend + NestJS API (in progress)
- **Database**: Shared PostgreSQL during transition period
- **Deployment**: Kubernetes with staging/production environments

### Technology Choices

**Framework Selection**: Next.js 15 with App Router
- Server-side rendering for SEO and performance
- File-based routing for intuitive navigation
- Built-in optimization for production deployments
- Strong TypeScript integration

**State Management**: Jotai (Atomic State Management)
- Lightweight alternative to Redux
- Bottom-up approach with atomic state
- Perfect for complex forms and entity management
- Excellent TypeScript support

**UI Framework**: Tailwind CSS + Shadcn/ui
- Utility-first CSS for rapid development
- Consistent design system components
- Accessible components built on Radix UI
- Customizable theme system

## 👥 User Personas & Workflows

### Admin Users
- **Responsibilities**: System configuration, user management, reporting
- **Key Features**: User creation, role assignment, system monitoring
- **Typical Workflow**: Login → Dashboard → User Management → Configuration

### Customers (Users)
- **Responsibilities**: Place orders, track progress, manage profiles
- **Key Features**: Order creation, order history, profile management
- **Typical Workflow**: Login → Browse Products → Configure Saddle → Place Order → Track Progress

### Fitters
- **Responsibilities**: Take measurements, validate orders, provide expertise
- **Key Features**: Order validation, measurement tools, customer communication
- **Typical Workflow**: Login → View Assigned Orders → Record Measurements → Update Order Status

### Suppliers
- **Responsibilities**: Fulfill orders, update inventory, manage delivery schedules
- **Key Features**: Order fulfillment, inventory management, delivery tracking
- **Typical Workflow**: Login → View Orders → Update Fulfillment Status → Manage Inventory

### Supervisors
- **Responsibilities**: Oversee operations, approve special requests, monitor performance
- **Key Features**: Order oversight, approval workflows, performance reporting
- **Typical Workflow**: Login → Review Pending Approvals → Monitor Operations → Generate Reports

## 🔄 Business Processes

### Order Lifecycle
1. **Order Creation**: Customer configures and places order
2. **Fitter Assignment**: System assigns qualified fitter
3. **Measurement**: Fitter takes detailed measurements
4. **Manufacturing**: Order sent to production
5. **Quality Control**: Supervisor reviews completed saddle
6. **Delivery**: Supplier handles shipping and delivery
7. **Completion**: Customer confirms receipt and satisfaction

### Product Configuration
1. **Brand Selection**: Choose saddle manufacturer
2. **Model Selection**: Select specific saddle model
3. **Leather Type**: Choose material and color
4. **Options Configuration**: Select stirrups, flaps, etc.
5. **Extras Addition**: Add special features or accessories
6. **Preset Saving**: Save configuration for future orders

## 🔐 Security & Authentication

### JWT-Based Authentication
- **Token Storage**: localStorage for persistence
- **Token Refresh**: Automatic refresh before expiration
- **Role-Based Access**: Route protection based on user roles
- **Session Management**: Secure logout and cleanup

### Authorization Patterns
- **Route Protection**: Middleware checks user roles
- **Component Guards**: Conditional rendering based on permissions
- **API Security**: Bearer tokens for all backend requests
- **Data Isolation**: Users only see their authorized data

## 🚀 Performance Considerations

### Optimization Strategies
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: Strategic use of React Query and browser caching
- **Bundle Analysis**: Regular bundle size monitoring

### Loading States
- **Skeleton Loading**: Consistent loading patterns
- **Progressive Enhancement**: Core functionality loads first
- **Error Boundaries**: Graceful error handling
- **Offline Support**: Basic offline functionality for critical features

## 🧩 Integration Points

### Backend API Integration
- **RESTful APIs**: Standard HTTP methods for CRUD operations
- **OData Filtering**: Advanced query capabilities
- **Real-time Updates**: WebSocket connections for live data
- **File Uploads**: Image and document handling

### External Services
- **Email Notifications**: Automated order status updates
- **Payment Processing**: Secure payment gateway integration
- **Shipping APIs**: Real-time delivery tracking
- **Analytics**: User behavior and business metrics

## 📈 Scalability Planning

### Current Scale
- **Users**: ~500 concurrent users
- **Orders**: ~1000 orders/month
- **Products**: ~100 product configurations
- **Response Time**: <100ms for list views

### Future Considerations
- **Microservices**: Potential service decomposition
- **CDN Integration**: Global content delivery
- **Database Optimization**: Query performance tuning
- **Horizontal Scaling**: Kubernetes-based scaling

## 🔧 Development Philosophy

### Code Quality
- **TypeScript First**: Strict type checking throughout
- **Test Coverage**: Comprehensive unit and integration testing
- **Code Reviews**: Mandatory peer review process
- **Documentation**: Living documentation with code examples

### User Experience
- **Mobile First**: Responsive design for all devices
- **Accessibility**: WCAG 2.1 compliance
- **Internationalization**: Multi-language support ready
- **Progressive Enhancement**: Works without JavaScript for core features

## 📋 Next Steps

After reading this introduction, proceed to:

1. **[Installing and Running](./installing-and-running.md)** - Set up your development environment
2. **[Architecture](./architecture.md)** - Understand the codebase structure
3. **[Authentication](./auth.md)** - Learn the authentication system
4. **[Components](./components.md)** - Explore the component library

For specific implementation guidance, refer to the [CLAUDE.md](../CLAUDE.md) file which contains detailed development patterns and best practices.
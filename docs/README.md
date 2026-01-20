# Order Management System (OMS) Documentation

Welcome to the comprehensive documentation for the Order Management System (OMS) - a modern, cloud-native application designed specifically for saddle manufacturing order management.

## 📚 Documentation Overview

This documentation is organized to help developers, administrators, and stakeholders understand and work with the OMS effectively.

### 🏗️ System Components

- **[Frontend (Next.js 15)](../frontend/docs/README.md)** - React-based user interface with modern tooling
- **[Backend (NestJS)](../backend/docs/README.md)** - TypeScript API server with enterprise patterns
- **[E2E Testing](../e2e/README.md)** - Full application testing with Playwright
- **[Infrastructure](./infrastructure/README.md)** - Kubernetes deployment and DevOps

### 📖 Main Documentation

- **[Getting Started](./getting-started.md)** - Quick setup for developers
- **[System Architecture](./architecture.md)** - High-level system design
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Deployment Guide](./deployment.md)** - Production deployment instructions
- **[Staging Deployment Guide](./staging-deployment.md)** - **🆕 DevSecOps staging environment deployment**
- **[Development Workflow](./development-workflow.md)** - Team collaboration guidelines
- **[Database Design](./database.md)** - Schema and data modeling
- **[Security Guidelines](./security.md)** - Security policies and practices
- **[Performance Guide](./performance.md)** - Optimization strategies
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## 🚀 Quick Start

### For Developers

```bash
# Clone the repository
git clone git@github-iam-dev:Order-My-Saddle/saddle-oms.git
cd saddle-oms

# Backend setup
cd backend
npm install
cp .env.example .env
npm run migration:run
npm run seed:run:relational
npm run start:dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# E2E testing (new terminal)
cd e2e
npm install
npx playwright test
```

### For System Administrators

```bash
# Deploy to Staging V2 (Automated)
git push origin main  # Triggers GitHub Actions deployment

# Deploy to Staging V2 (Manual)
./scripts/deploy-staging-v2.sh

# Monitor staging deployment
kubectl get pods -n oms-staging-v2
kubectl logs -f deployment/oms-backend -n oms-staging-v2

# Health checks
curl https://api-staging-v2.ordermysaddle.com/health
curl https://staging-v2.ordermysaddle.com/api/health
```

## 🎯 Project Context

### Business Domain

The OMS is designed for **saddle manufacturing** with specialized features for:

- **Custom saddle orders** with complex configuration options
- **Multi-stakeholder workflows** involving customers, fitters, suppliers, and administrators
- **Manufacturing tracking** from order placement to delivery
- **Quality control** processes and approval workflows
- **Inventory management** for leather types, hardware, and accessories

### Technology Stack

**Frontend**
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS + Shadcn/ui components
- Jotai for state management
- Playwright for E2E testing

**Backend**
- NestJS with TypeScript
- TypeORM with PostgreSQL
- JWT authentication with Passport
- Redis for caching and sessions
- Jest for unit testing

**Infrastructure**
- Docker containers
- Kubernetes orchestration
- GitHub Actions CI/CD
- DigitalOcean hosting
- Let's Encrypt SSL

### User Roles

The system supports five distinct user roles with specific permissions:

1. **USER** (Customer) - Place orders, track progress, manage profile
2. **FITTER** - Take measurements, validate orders, update status
3. **SUPPLIER** - Manage inventory, fulfill orders, track delivery
4. **ADMIN** - System administration, user management, configuration
5. **SUPERVISOR** - Oversight, approval workflows, performance monitoring

## 📊 System Status

### Implementation Progress: 95% Complete

✅ **Completed Components**
- ✅ Core backend entities (Orders, Customers, Fitters, Suppliers, Users)
- ✅ **NEW**: All 7 product modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products)
- ✅ **SECURED**: Authentication and authorization system with JWT guards enabled
- ✅ Frontend application with modern UI
- ✅ Basic order management workflows
- ✅ Database schema and migrations
- ✅ **NEW**: Complete DevSecOps CI/CD pipeline with security scanning
- ✅ **NEW**: Kubernetes staging deployment (oms-staging-v2)
- ✅ **NEW**: Comprehensive E2E testing framework

⚠️ **In Progress**
- Frontend-backend integration fine-tuning
- Performance optimization
- Production environment setup

📋 **Planned**
- Advanced reporting and analytics
- Mobile application development
- Third-party integrations (payment, shipping)
- Performance optimization

### Current Phase: DevSecOps Complete ✅

**✅ COMPLETED**: All missing product entity modules implemented and secured
**✅ COMPLETED**: Authentication security enabled across all endpoints
**✅ COMPLETED**: DevSecOps CI/CD pipeline with staging deployment ready
**🔄 NEXT**: Frontend-backend integration and production deployment

## 🏛️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Authentication│    │   Redis Cache   │
│   (CDN/Local)   │    │   (JWT/Passport)│    │   (Sessions)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

```
User Request → Frontend → API Gateway → Backend Services → Database
           ↓              ↓              ↓                ↓
      State Mgmt → Authentication → Business Logic → Data Layer
```

## 🔗 Related Resources

### External Links
- **[Project Repository](https://github.com/Order-My-Saddle/saddle-oms)** - Main codebase
- **[CI/CD Pipeline](https://github.com/Order-My-Saddle/saddle-oms/actions)** - Build status
- **[Issue Tracker](https://github.com/Order-My-Saddle/saddle-oms/issues)** - Bug reports and features

### Development Tools
- **[Postman Collection](./api/postman-collection.json)** - API testing
- **[Database Schema](./database/schema.sql)** - Current schema
- **[Docker Compose](../docker-compose.yml)** - Local development

### Documentation Standards
- All code must include inline documentation
- API endpoints require OpenAPI/Swagger documentation
- Database changes require migration scripts
- New features require corresponding tests

## 📞 Support & Contributing

### Getting Help
1. Check this documentation first
2. Search [existing issues](https://github.com/Order-My-Saddle/saddle-oms/issues)
3. Ask in team communication channels
4. Create a new issue with detailed information

### Contributing Guidelines
1. Follow the [development workflow](./development-workflow.md)
2. Ensure all tests pass before submitting PR
3. Update documentation for new features
4. Follow established coding conventions

### Team Contacts
- **Technical Lead**: Architecture and technical decisions
- **Product Owner**: Requirements and business logic
- **DevOps**: Infrastructure and deployment
- **QA**: Testing and quality assurance

---

*This documentation is maintained by the development team and updated with each release. Last updated: January 2026*
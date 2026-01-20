# OMS Frontend Documentation

Welcome to the Order Management System (OMS) frontend documentation. This Next.js application provides the user interface for the saddle manufacturing order management system.

## 📚 Documentation Overview

This documentation is organized into the following sections:

- **[Introduction](./introduction.md)** - Project overview and key concepts
- **[Installing and Running](./installing-and-running.md)** - Setup and development environment
- **[Architecture](./architecture.md)** - Project structure and design patterns
- **[Authentication](./auth.md)** - User authentication and authorization
- **[API Integration](./api-integration.md)** - Backend service integration patterns
- **[Components](./components.md)** - Component development guidelines
- **[State Management](./state-management.md)** - Jotai atoms and state patterns
- **[Forms](./forms.md)** - Form handling and validation
- **[Testing](./testing.md)** - Testing strategies and best practices
- **[Performance](./performance.md)** - Optimization techniques
- **[Deployment](./deployment.md)** - Production deployment guide

## 🚀 Quick Start

1. **Prerequisites**: Node.js 18+, npm/yarn
2. **Install**: `cd frontend && npm install`
3. **Environment**: Copy `.env.example` to `.env.local`
4. **Run**: `npm run dev`
5. **Open**: [http://localhost:3000](http://localhost:3000)

## 🏗️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Jotai (atomic state)
- **Forms**: React Hook Form + Zod validation
- **API Client**: Custom service layer with fetch
- **Testing**: Jest + React Testing Library + Playwright
- **Linting**: ESLint + Prettier

## 🎯 Project Context

The OMS frontend is part of a larger system migration from PHP/Symfony to a modern NestJS + Next.js stack. It provides interfaces for:

- **Order Management**: Creating, tracking, and managing saddle orders
- **Customer Management**: Customer profiles and order history
- **Product Catalog**: Brands, models, leather types, options, and configurations
- **User Management**: Role-based access for different user types
- **Reporting**: Order analytics and business insights

## 👥 User Roles

The system supports five distinct user roles:

- **USER**: Basic customers placing orders
- **FITTER**: Professionals measuring and fitting saddles
- **SUPPLIER**: Product suppliers and manufacturers
- **ADMIN**: System administrators
- **SUPERVISOR**: Management oversight

## 🔗 Related Documentation

- **[Backend API Documentation](../backend/README.md)** - NestJS API reference
- **[E2E Testing](../e2e/README.md)** - Full application testing
- **[Project Overview](../README.md)** - Root project documentation

## 💡 Getting Help

- **Issues**: Check existing [GitHub Issues](https://github.com/Order-My-Saddle/saddle-oms/issues)
- **Development**: Review the [CLAUDE.md](../CLAUDE.md) for development patterns
- **Architecture**: See [Architecture Overview](./architecture.md) for system design

---

*This documentation follows the established patterns from the NestJS boilerplate and is designed to help developers quickly understand and contribute to the OMS frontend.*

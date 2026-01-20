# Installation

NestJS Boilerplate supports [TypeORM](https://www.npmjs.com/package/typeorm) and [Mongoose](https://www.npmjs.com/package/mongoose) for working with databases. By default, TypeORM uses [PostgreSQL](https://www.postgresql.org/) as the main database, but you can use any relational database.

Switching between TypeORM and Mongoose is implemented based on the [Hexagonal Architecture](architecture.md#hexagonal-architecture). This makes it easy to choose the right database for your application.

---

## Table of Contents <!-- omit in toc -->

- [Ralph Loop Quick Start](#ralph-loop-quick-start)
- [Comfortable development (PostgreSQL + TypeORM)](#comfortable-development-postgresql--typeorm)
  - [Video guideline (PostgreSQL + TypeORM)](#video-guideline-postgresql--typeorm)
- [Comfortable development (MongoDB + Mongoose)](#comfortable-development-mongodb--mongoose)
- [Quick run (PostgreSQL + TypeORM)](#quick-run-postgresql--typeorm)
- [Quick run (MongoDB + Mongoose)](#quick-run-mongodb--mongoose)
- [Ralph Loop Development](#ralph-loop-development)
- [Links](#links)

---

## Ralph Loop Quick Start

For immediate OMS development using Ralph Loop automation:

### 🚀 Quick Implementation Commands
```bash
# Navigate to project root
cd /Users/in615bac/Documents/OMS_NEXT/oms_nest

# View all available Ralph Loop commands
./scripts/start-ralph.sh

# Quick start - implement most critical entities
/ralph-wiggum:ralph-loop "Implement BrandsModule and ModelsModule for OMS backend following the exact pattern in backend/src/customers/. Each module must include: TypeORM entity, service with CRUD operations, controller with JWT authentication guards, DTOs for validation, and comprehensive tests (>90% coverage). These are product catalog entities critical for frontend /brands and /models pages.

VERIFICATION: cd backend && npm run test brands models && npm run lint

Output <promise>BRANDS_MODELS_COMPLETE</promise> when both modules are fully implemented and all tests pass." --max-iterations 25

# Complete all 7 missing backend entities
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the exact patterns in backend/src/customers/. Enable authentication guards. Achieve >90% test coverage. Output <promise>ALL_BACKEND_ENTITIES_COMPLETE</promise> when complete." --max-iterations 45
```

### 📋 Ralph Loop Prerequisites
- Ensure you're in the OMS project root directory
- Verify backend/src/customers/ exists (template pattern)
- Check current tests pass: `cd backend && npm test`
- Create backup: `git add . && git commit -m "Pre-Ralph checkpoint"`

For detailed Ralph Loop documentation:
- [Ralph Loop Integration Guide](../docs/RALPH-LOOP-INTEGRATION.md)
- [Ralph Quick Reference](../docs/RALPH-QUICK-REFERENCE.md)
- [Backend Ralph Development](ralph-loop-development.md)

---

## Comfortable development (PostgreSQL + TypeORM)

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-relational` as `.env`.

   ```bash
   cd my-app/
   cp env-example-relational .env
   ```

1. Change `DATABASE_HOST=postgres` to `DATABASE_HOST=localhost`

   Change `DATABASE_PORT=5432` to `DATABASE_PORT=5433` (to avoid port conflicts with other PostgreSQL instances)

   Change `MAIL_HOST=maildev` to `MAIL_HOST=localhost`

1. Run additional container:

   ```bash
   docker compose up -d postgres adminer maildev
   ```

1. Install dependency

   ```bash
   npm install
   ```

1. Run app configuration

   > You should run this command only the first time on initialization of your project, all next time skip it.

   > If you want to contribute to the boilerplate, you should NOT run this command.

   ```bash
   npm run app:config
   ```

1. Run migrations

   ```bash
   npm run migration:run
   ```

1. Run seeds

   ```bash
   npm run seed:run:relational
   ```

1. Run app in dev mode

   ```bash
   npm run start:dev
   ```

1. Open <http://localhost:3000>

### Video guideline (PostgreSQL + TypeORM)

<https://github.com/user-attachments/assets/136a16aa-f94a-4b20-8eaf-6b4262964315>

---

## Comfortable development (MongoDB + Mongoose)

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-document` as `.env`.

   ```bash
   cd my-app/
   cp env-example-document .env
   ```

1. Change `DATABASE_URL=mongodb://mongo:27017` to `DATABASE_URL=mongodb://localhost:27017`

1. Run additional container:

   ```bash
   docker compose -f docker-compose.document.yaml up -d mongo mongo-express maildev
   ```

1. Install dependency

   ```bash
   npm install
   ```

1. Run app configuration

   > You should run this command only the first time on initialization of your project, all next time skip it.

   > If you want to contribute to the boilerplate, you should NOT run this command.

   ```bash
   npm run app:config
   ```

1. Run seeds

   ```bash
   npm run seed:run:document
   ```

1. Run app in dev mode

   ```bash
   npm run start:dev
   ```

1. Open <http://localhost:3000>

---

## Quick run (PostgreSQL + TypeORM)

If you want quick run your app, you can use following commands:

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-relational` as `.env`.

   ```bash
   cd my-app/
   cp env-example-relational .env
   ```

1. Run containers

   ```bash
   docker compose up -d
   ```

1. For check status run

   ```bash
   docker compose logs
   ```

1. Open <http://localhost:3000>

---

## Quick run (MongoDB + Mongoose)

If you want quick run your app, you can use following commands:

1. Clone repository

   ```bash
   git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
   ```

1. Go to folder, and copy `env-example-document` as `.env`.

   ```bash
   cd my-app/
   cp env-example-document .env
   ```

1. Run containers

   ```bash
   docker compose -f docker-compose.document.yaml up -d
   ```

1. For check status run

   ```bash
   docker compose -f docker-compose.document.yaml logs
   ```

1. Open <http://localhost:3000>

---

## Ralph Loop Development

### Automated Entity Implementation

Ralph Loop provides autonomous development capabilities for the OMS backend. Use these commands for efficient development:

#### 📦 Entity Implementation Commands
```bash
# Single entity (replace [EntityName] with actual entity)
/ralph-wiggum:ralph-loop "Implement [EntityName]Module following backend/src/customers/ pattern. Include entity, service, controller with @UseGuards(JwtAuthGuard), DTOs, tests. Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise>." --max-iterations 20

# All missing entities (Brands, Models, Leathertypes, Options, Extras, Presets, Products)
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules following backend/src/customers/ pattern. Include authentication guards and >90% test coverage. Output <promise>ALL_ENTITIES_COMPLETE</promise>." --max-iterations 45
```

#### 🔐 Authentication & Security
```bash
# Enable authentication guards across all controllers
/ralph-wiggum:ralph-loop "Enable JWT authentication guards across ALL controllers. Remove TODO comments and activate @UseGuards(JwtAuthGuard). Test all 5 user roles. Output <promise>AUTH_SECURITY_COMPLETE</promise>." --max-iterations 15
```

#### ⚡ Performance Optimization
```bash
# Optimize backend performance
/ralph-wiggum:ralph-loop "Optimize OMS backend performance: database queries, caching, response times <100ms. Output <promise>PERFORMANCE_OPTIMIZED</promise>." --max-iterations 15
```

#### 🧪 Testing & Quality
```bash
# Comprehensive testing
/ralph-wiggum:ralph-loop "Create comprehensive test suite for OMS backend with >90% coverage. Include unit, integration, and E2E tests. Output <promise>TESTING_COMPLETE</promise>." --max-iterations 25
```

### Ralph Loop Safety Guidelines

#### Before Starting Ralph Loop
1. **Create Backup**: `git add . && git commit -m "Pre-Ralph checkpoint"`
2. **Create Backup Branch**: `git branch backup-$(date +%s)`
3. **Verify Location**: Ensure you're in `/Users/in615bac/Documents/OMS_NEXT/oms_nest`
4. **Check Template**: Verify `backend/src/customers/` exists as pattern template
5. **Test Current State**: Run `cd backend && npm test` to ensure current tests pass

#### Monitoring Progress
- **Check Completion**: Look for `<promise>TASK_COMPLETE</promise>` in output
- **Review Changes**: Use `git log --oneline -10` to see Ralph's commits
- **Monitor Tests**: Run `cd backend && npm test` to validate implementations
- **Check Build**: Run `cd backend && npm run build` to ensure compilation

#### Recovery if Needed
```bash
# Review what Ralph has done
git log --oneline
git status
git diff

# Reset if needed (CAUTION)
git reset --hard backup-branch-name

# Restart with smaller scope
# Use individual entity commands instead of all-at-once
```

### Integration with Development Workflow

#### After Ralph Completes Backend Entities
1. **Validate Implementation**: `cd backend && npm run test && npm run lint`
2. **Start Backend**: `cd backend && npm run start:dev`
3. **Test Frontend Connection**: Update frontend API URL from :8888 to :3001
4. **Run E2E Tests**: Validate full system integration

### Ralph Loop Documentation

For comprehensive Ralph Loop guides:
- **[Ralph Loop Integration](../docs/RALPH-LOOP-INTEGRATION.md)** - Complete guide with all patterns
- **[Ralph Quick Reference](../docs/RALPH-QUICK-REFERENCE.md)** - Copy-paste ready commands
- **[Backend Ralph Development](ralph-loop-development.md)** - Backend-specific automation
- **[Entity Implementation Guide](entity-implementation-guide.md)** - Step-by-step entity creation
- **[Phase Documentation](../docs/)** - Phase-by-phase implementation plans

### Quick Commands Reference

```bash
# View all Ralph commands
./scripts/start-ralph.sh

# Implement critical entities (recommended start)
# [See commands in Ralph Loop Quick Start section above]

# Enable authentication security
# [See Authentication & Security section above]

# Optimize performance
# [See Performance Optimization section above]

# Create comprehensive tests
# [See Testing & Quality section above]
```

---

## Links

- Swagger (API docs): <http://localhost:3000/docs>
- Adminer (client for DB): <http://localhost:8080>
- MongoDB Express (client for DB): <http://localhost:8081/>
- Maildev: <http://localhost:1080>

---

Previous: [Introduction](introduction.md)

Next: [Architecture](architecture.md)

# Getting Started

This guide will help you set up the complete OMS development environment and get both the backend and frontend applications running locally.

## 📋 Prerequisites

### System Requirements

**Required Software**
- **Node.js 18+** - JavaScript runtime for both frontend and backend
- **npm 8+** - Package manager (or yarn 1.22+)
- **Git 2.30+** - Version control
- **PostgreSQL 14+** - Database server
- **Redis 6+** - Cache and session storage

**Recommended Tools**
- **Docker Desktop** - Container runtime for isolated development
- **VSCode** - IDE with excellent TypeScript support
- **Postman/Insomnia** - API testing
- **pgAdmin/DBeaver** - Database management

### Development Environment Setup

**macOS (Homebrew)**
```bash
# Install core dependencies
brew install node postgresql@14 redis git

# Start services
brew services start postgresql@14
brew services start redis

# Optional: Install Docker Desktop from https://docker.com
```

**Ubuntu/Debian**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server

# Install Git
sudo apt-get install git
```

**Windows (via WSL2 recommended)**
```powershell
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu

# Then follow Ubuntu instructions above
```

## 🚀 Quick Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone git@github-iam-dev:Order-My-Saddle/saddle-oms.git
cd saddle-oms

# Verify repository structure
ls -la
# Should show: backend/ frontend/ e2e/ docs/ kubernetes/ etc.
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE oms_development;
CREATE USER oms_user WITH PASSWORD 'oms_password';
GRANT ALL PRIVILEGES ON DATABASE oms_development TO oms_user;
\q
```

**Option B: Docker PostgreSQL**
```bash
# Start PostgreSQL in Docker
docker run --name oms-postgres \
  -e POSTGRES_DB=oms_development \
  -e POSTGRES_USER=oms_user \
  -e POSTGRES_PASSWORD=oms_password \
  -p 5432:5432 \
  -d postgres:14-alpine
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env file with your database connection
# DATABASE_URL=postgresql://oms_user:oms_password@localhost:5432/oms_development

# Run database migrations
npm run migration:run

# Seed the database with sample data
npm run seed:run:relational

# Start the development server
npm run start:dev
```

**Verify backend is running:**
- Backend API: http://localhost:3001
- Swagger documentation: http://localhost:3001/docs
- Health check: http://localhost:3001/health

### 4. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start the development server
npm run dev
```

**Verify frontend is running:**
- Frontend application: http://localhost:3000
- Should redirect to login page

### 5. Test the Complete Setup

```bash
# Run backend tests
cd backend
npm run test

# Run frontend tests
cd ../frontend
npm run test

# Run E2E tests (optional)
cd ../e2e
npm install
npx playwright install
npx playwright test
```

## 🔐 Initial Login

### Default Users

The seeded database includes these test users:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | ADMIN | System administrator |
| `supervisor` | `super123` | SUPERVISOR | Operations supervisor |
| `fitter1` | `fitter123` | FITTER | Saddle fitter |
| `supplier1` | `supplier123` | SUPPLIER | Product supplier |
| `customer1` | `customer123` | USER | End customer |

### First Login Steps

1. Navigate to http://localhost:3000
2. Login with admin credentials: `admin` / `admin123`
3. Verify the dashboard loads with sample data
4. Navigate through different sections (Orders, Customers, etc.)

## 🛠️ Development Workflow

### Code Organization

```
saddle-oms/
├── backend/           # NestJS API server
│   ├── src/           # Source code
│   ├── test/          # Unit tests
│   └── docs/          # Backend-specific docs
├── frontend/          # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   └── docs/          # Frontend-specific docs
├── e2e/               # End-to-end tests
├── kubernetes/        # K8s deployment files
├── docs/              # Main documentation
└── docker-compose.yml # Local development stack
```

### Development Scripts

**Backend (from `/backend` directory)**
```bash
npm run start:dev      # Start with hot reload
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run integration tests
npm run lint           # Check code style
npm run migration:generate  # Create DB migration
```

**Frontend (from `/frontend` directory)**
```bash
npm run dev            # Start with hot reload
npm run build          # Build for production
npm run test           # Run unit tests
npm run lint           # Check code style
npm run type-check     # TypeScript validation
```

**E2E Testing (from `/e2e` directory)**
```bash
npx playwright test           # Run all E2E tests
npx playwright test --ui      # Run with UI mode
npx playwright test --debug   # Debug mode
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-product-catalog

# Make changes and commit
git add .
git commit -m "feat: add product catalog API endpoints

- Implement brands, models, and leathertypes modules
- Add CRUD operations with validation
- Include comprehensive tests

🤖 Generated with Claude Code"

# Push and create PR
git push -u origin feature/add-product-catalog
gh pr create --title "Add Product Catalog" --body "Implements missing product entities"
```

## 🐳 Docker Development

### Full Stack with Docker Compose

```bash
# Start entire stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop stack
docker-compose down

# Reset with fresh data
docker-compose down -v
docker-compose up -d
```

### Individual Services

```bash
# Backend only
docker-compose up backend postgres redis

# Frontend only (requires backend running)
docker-compose up frontend

# Database only
docker-compose up postgres redis
```

## 🧪 Testing Strategy

### Test Pyramid

```
E2E Tests (Playwright)     → Complete user workflows
Integration Tests (Jest)   → API + Database interactions
Unit Tests (Jest)          → Individual functions/classes
Static Analysis (ESLint)   → Code quality
```

### Running Tests

```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# All backend tests
npm run test

# E2E tests
npm run test:e2e

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Data Management

```bash
# Reset test database
npm run test:db:reset

# Seed test data
npm run test:db:seed

# Run migrations on test DB
npm run migration:run:test
```

## 🔧 Common Development Tasks

### Adding New API Endpoint

```bash
cd backend

# Generate new resource
npm run generate:resource:relational
# Follow prompts for entity name, properties, etc.

# Generate migration
npm run migration:generate -- src/database/migrations/AddNewEntity

# Run migration
npm run migration:run

# Start development server
npm run start:dev
```

### Adding New Frontend Page

```bash
cd frontend

# Create new page
mkdir -p app/new-feature
touch app/new-feature/page.tsx

# Add to navigation (if needed)
# Edit components/layout/Sidebar.tsx

# Start development server
npm run dev
```

### Database Operations

```bash
cd backend

# View current schema
npm run schema:log

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/DescribeMigration

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Drop schema and recreate
npm run schema:drop
npm run migration:run
npm run seed:run:relational
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on specific ports
npx kill-port 3000  # Frontend
npx kill-port 3001  # Backend
npx kill-port 5432  # PostgreSQL
npx kill-port 6379  # Redis
```

**Database Connection Issues**
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -U oms_user -d oms_development

# Restart PostgreSQL (macOS)
brew services restart postgresql@14

# Restart PostgreSQL (Ubuntu)
sudo systemctl restart postgresql
```

**Node Version Issues**
```bash
# Check current version
node --version

# Install/use correct version with nvm
nvm install 18
nvm use 18
nvm alias default 18
```

**Permission Issues (Linux/macOS)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Use Node Version Manager instead
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Cache Issues**
```bash
# Clear npm cache
npm cache clean --force

# Clear Next.js cache
rm -rf frontend/.next

# Clear TypeORM cache
rm -rf backend/dist

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

**Backend Debugging**
```bash
# Start with debugging enabled
npm run start:debug

# Connect debugger in VSCode or Chrome DevTools
# URL: chrome://inspect
```

**Frontend Debugging**
```bash
# Enable verbose logging
NODE_ENV=development npm run dev

# View detailed build information
npm run build -- --debug
```

### Environment Variables Debugging

```bash
# Check environment variables
npm run env:check

# Print all env vars (be careful with secrets!)
printenv | grep -E "(DATABASE|NEXT_PUBLIC|JWT)"
```

## 📈 Performance Tips

### Development Performance

```bash
# Use faster package manager
npm install -g pnpm
pnpm install  # Instead of npm install

# Enable TypeScript incremental compilation
# Add to tsconfig.json: "incremental": true

# Use Next.js Turbopack (experimental)
npm run dev -- --turbo
```

### Database Performance

```bash
# Monitor slow queries
# Add to .env: LOG_LEVEL=debug

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';

# Create indexes for frequently queried columns
# Add migrations for performance-critical indexes
```

## ⚡ Next Steps

Once you have the basic setup running:

1. **[System Architecture](./architecture.md)** - Understand the overall system design
2. **[API Reference](./api-reference.md)** - Learn about available endpoints
3. **[Development Workflow](./development-workflow.md)** - Team collaboration practices
4. **[Frontend Documentation](../frontend/docs/README.md)** - Frontend-specific guides
5. **[Backend Documentation](../backend/docs/README.md)** - Backend-specific guides

### Learning Resources

- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)** - Language fundamentals
- **[NestJS Documentation](https://docs.nestjs.com/)** - Backend framework
- **[Next.js Documentation](https://nextjs.org/docs)** - Frontend framework
- **[PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)** - Database

### Team Onboarding

For new team members:
1. Complete this getting started guide
2. Review the [development workflow](./development-workflow.md)
3. Read the business domain overview in [project README](./README.md)
4. Pair with a senior developer for first few tasks
5. Set up IDE with recommended extensions and settings

Need help? Check the [troubleshooting guide](./troubleshooting.md) or reach out to the team!
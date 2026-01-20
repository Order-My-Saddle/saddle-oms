# Development Workflow

This guide covers the complete development workflow for the OMS project, including Claude Code integration, Ralph Loop automation, and team collaboration patterns.

## 🤖 Claude Code Development

### Claude Code Overview

Claude Code is the primary AI development assistant for the OMS project. It provides intelligent code generation, debugging, and project management capabilities.

**Key Features:**
- **Intelligent Code Generation**: Entity modules, API endpoints, components
- **Automated Testing**: Unit tests, integration tests, E2E scenarios
- **Project Analysis**: Code review, architecture decisions, refactoring
- **Documentation**: Automatic documentation generation and updates

### Claude Code Setup

**1. Installation & Configuration**
```bash
# Claude Code is available at https://claude.ai/code
# No local installation required - web-based IDE integration

# Configure project context
# Create .claude files for project-specific instructions
echo "This is the OMS project context" > .claude-context
```

**2. Project Integration**

The OMS project includes specific Claude Code configuration in `CLAUDE.md`:

```markdown
# Current Implementation Status: 80% Complete
- ✅ Strong Foundation: NestJS backend with solid architecture
- ⚠️ Missing: 7 product entity modules (Phase 1 Priority)
- ⚠️ Security Issue: Authentication guards commented out
```

**3. Working with Claude Code**

**Entity Generation Example:**
```typescript
// Prompt: "Generate the BrandsModule following the CustomerModule pattern"

// Claude Code will generate:
// - src/brands/domain/brand.entity.ts
// - src/brands/brand.service.ts
// - src/brands/brand.controller.ts
// - src/brands/dto/create-brand.dto.ts
// - src/brands/dto/update-brand.dto.ts
// - src/brands/brand.module.ts
// - test/brands/brand.service.spec.ts
// - test/brands/brand.controller.spec.ts
```

### Claude Code Best Practices

**1. Context Management**
```markdown
# Always provide context in prompts
"I'm working on the OMS backend. We need to implement the ProductsModule following the existing patterns in CustomersModule. The entity should include relationships to Brands, Models, and Options."

# Reference specific files
"Looking at backend/src/customers/customer.controller.ts, create a similar controller for Products with the same authentication patterns."
```

**2. Iterative Development**
```typescript
// Start with basic structure
"Create a basic ProductService with CRUD operations"

// Then enhance
"Add caching to the ProductService using the same patterns as OrderService"

// Finally optimize
"Add performance optimizations and bulk operations to ProductService"
```

**3. Testing Integration**
```typescript
// Request tests with implementation
"Generate the ProductController with comprehensive Jest tests including authentication scenarios"

// Claude Code provides both implementation and tests
export class ProductController {
  // Implementation
}

// Generated tests
describe('ProductController', () => {
  // Comprehensive test suite
});
```

## 🔄 Ralph Loop Automation

### Ralph Loop Overview

Ralph Loop is an automation framework that enables continuous, autonomous development using Claude Code. It's perfect for implementing large features like the missing backend entity modules.

**Key Capabilities:**
- **Autonomous Feature Implementation**: Complete features without manual intervention
- **Multi-Step Task Execution**: Complex workflows with validation at each step
- **Error Recovery**: Automatic retry and error handling
- **Progress Tracking**: Real-time status updates and logging

### Ralph Loop Setup

**1. Installation**
```bash
# Install Ralph Loop CLI
npm install -g @frankbria/ralph-claude-code

# Verify installation
ralph --version

# Initialize in project
cd /path/to/oms_nest
ralph init
```

**2. Configuration**

Create `ralph.config.json`:
```json
{
  "project": "order-management-system",
  "claude": {
    "model": "claude-3-sonnet",
    "contextFiles": ["CLAUDE.md", "README.md"],
    "maxTokens": 200000
  },
  "workspace": {
    "backend": "./backend",
    "frontend": "./frontend",
    "docs": "./docs"
  },
  "tasks": {
    "maxIterations": 50,
    "timeout": 3600000,
    "retries": 3
  },
  "git": {
    "autoCommit": true,
    "branchPrefix": "ralph/",
    "commitFormat": "feat: {summary}\n\n🤖 Generated with Ralph Loop"
  }
}
```

### Ralph Loop Patterns for OMS

**1. Backend Entity Implementation**

```bash
# Single entity implementation
ralph-wiggum:ralph-loop "Implement the BrandsModule for OMS backend following the exact pattern in backend/src/customers/. Include complete CRUD operations, authentication guards, TypeORM entity, DTOs for validation, and comprehensive tests (>90% coverage). The module should handle saddle brand management with fields: name, country, description, logo, active status. Output <promise>BRANDS_MODULE_COMPLETE</promise> when fully implemented and tested." --max-iterations 25

# Multiple entities (overnight automation)
ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the exact patterns in backend/src/customers/ and backend/src/orders/. Each module must include: TypeORM entity, service with CRUD operations, controller with authentication guards, DTOs for validation, and comprehensive tests. Enable @UseGuards(JwtAuthGuard) on all endpoints. Ensure >90% test coverage. Output <promise>OVERNIGHT_BACKEND_COMPLETE</promise> when all modules are implemented and tests pass." --max-iterations 50
```

**2. Authentication Security Hardening**

```bash
# Enable authentication across all controllers
ralph-wiggum:ralph-loop "Enable and secure JWT authentication across OMS backend. Tasks:
1. Remove all TODO comments about auth guards
2. Enable @UseGuards(JwtAuthGuard) on ALL controllers
3. Test authentication for all 5 user roles:
   - USER: Can access own orders/profile
   - FITTER: Can access assigned orders
   - SUPPLIER: Can access order fulfillment
   - SUPERVISOR: Can approve orders and generate reports
   - ADMIN: Full system access
4. Validate proper error responses for unauthorized access
5. Update all controller tests to include auth scenarios
6. Verify API documentation reflects auth requirements

Success Criteria:
- No TODO comments about auth guards remain
- All controllers have proper JWT protection
- All tests pass with auth enabled
- Unauthorized requests return 401/403 properly
- All authenticated requests work correctly
- Documentation updated

Output <promise>AUTH_SECURITY_COMPLETE</promise> when done." --max-iterations 15
```

**3. Frontend-Backend Integration**

```bash
# Complete frontend integration
ralph-wiggum:ralph-loop "Update OMS frontend to connect with NestJS backend. Tasks:
1. Update environment configuration:
   - Change API URLs from PHP (:8888) to NestJS (:3001)
   - Update NEXT_PUBLIC_API_URL in all environments
2. Test and fix API integration:
   - All CRUD operations for existing entities
   - User authentication flows (login/logout/token refresh)
   - Order management workflows
   - Customer management
   - User role-based navigation
3. Verify performance targets:
   - Page load times < 2 seconds
   - API response times < 100ms for list views
   - Form submissions < 200ms
4. Test all user roles work correctly
5. Ensure error handling and loading states

Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when all frontend pages load correctly and backend integration is complete." --max-iterations 30
```

### Advanced Ralph Loop Patterns

**1. Parallel Development Workflows**

```bash
# Terminal 1: Backend entities
git worktree add ../oms-backend-entities -b feature/backend-entities
cd ../oms-backend-entities
ralph-wiggum:ralph-loop "Implement the 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the established patterns in backend/src/customers/ and backend/src/orders/. Each module must have: entity, service, controller, DTOs, tests. Enable authentication guards. Output <promise>BACKEND_ENTITIES_COMPLETE</promise> when all 7 modules pass tests." --max-iterations 30

# Terminal 2: Authentication hardening
git worktree add ../oms-auth-hardening -b feature/auth-hardening
cd ../oms-auth-hardening
ralph-wiggum:ralph-loop "Enable and test JWT authentication guards across all controllers. Remove TODO comments and activate @UseGuards(JwtAuthGuard) in all controller files. Test all 5 user roles (USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR). Output <promise>AUTH_HARDENING_COMPLETE</promise> when all endpoints are secured and tests pass." --max-iterations 20

# Terminal 3: Frontend integration
cd oms_nest/frontend
ralph-wiggum:ralph-loop "Update frontend services to connect to NestJS backend (port 3001) instead of PHP (port 8888). Update environment configs, API endpoints, and test all CRUD operations. Ensure authentication flows work for all user roles. Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when all frontend pages load correctly." --max-iterations 25
```

**2. Full-Stack Feature Implementation**

```bash
# Complete product catalog implementation
ralph-wiggum:ralph-loop "Implement complete product catalog feature for OMS:

BACKEND TASKS:
1. Create 7 missing entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products)
2. Implement relationships between entities (Product belongs to Brand/Model, has Options/Extras)
3. Add search and filtering capabilities
4. Include image upload for products
5. Add inventory tracking
6. Enable authentication on all endpoints

FRONTEND TASKS:
1. Create product catalog pages (/products, /brands, /models)
2. Add product search and filtering UI
3. Create product configuration interface (saddle customization)
4. Add image gallery for products
5. Implement shopping cart functionality (for order creation)
6. Add admin interfaces for product management

INTEGRATION TASKS:
1. Test complete product browsing workflow
2. Test product configuration and ordering
3. Test admin product management
4. Ensure performance meets targets (<100ms API, <2s page loads)

Output <promise>PRODUCT_CATALOG_COMPLETE</promise> when complete end-to-end product catalog is working." --max-iterations 60
```

### Ralph Loop Monitoring & Control

**1. Real-time Monitoring**

```bash
# Monitor Ralph Loop execution
tail -f ralph-execution.log

# Check progress via promises
grep -E "COMPLETE|ERROR" ralph-execution.log

# Ralph Loop status dashboard
ralph status --project oms

# Stop execution if needed
ralph stop --task-id <task-id>
```

**2. Progress Tracking**

```bash
# Ralph Loop automatically tracks:
# - Files created/modified
# - Tests run and results
# - Git commits made
# - Errors encountered
# - Time spent on each task

# View detailed report
ralph report --project oms --task backend-entities

# Export results
ralph export --format json --output oms-implementation-report.json
```

### Error Handling & Recovery

**1. Common Ralph Loop Issues**

```bash
# Test failures during implementation
# Ralph Loop will:
# 1. Analyze test output
# 2. Identify root cause
# 3. Fix implementation
# 4. Re-run tests
# 5. Continue if successful

# Build errors
# Ralph Loop will:
# 1. Check TypeScript errors
# 2. Fix type issues
# 3. Resolve import problems
# 4. Retry build

# Authentication issues
# Ralph Loop will:
# 1. Check auth configuration
# 2. Verify JWT setup
# 3. Test with different user roles
# 4. Fix permission issues
```

**2. Manual Intervention**

```bash
# Pause Ralph Loop for manual review
ralph pause --task-id <task-id>

# Review changes made
git log --oneline --graph

# Resume after manual fixes
ralph resume --task-id <task-id>

# Override with manual command
ralph execute "Fix the authentication issue in ProductController" --max-iterations 5
```

## 👥 Team Development Workflow

### Git Workflow with Claude Code/Ralph Loop

**1. Feature Branch Strategy**

```bash
# Manual development with Claude Code
git checkout -b feature/brands-module
# Use Claude Code to implement BrandsModule
# Regular commits with Claude Code assistance

# Ralph Loop automation
git checkout -b ralph/backend-entities
ralph-wiggum:ralph-loop "Implement missing entities..." --auto-branch
# Ralph Loop creates commits automatically

# Integration branch
git checkout -b integration/phase-1-entities
git merge feature/brands-module
git merge ralph/backend-entities
```

**2. Code Review Process**

```bash
# Create PR with Claude Code summary
git push origin feature/brands-module
gh pr create --title "Implement BrandsModule" --body "$(claude-summarize-changes)"

# Ralph Loop automated PRs
# Ralph Loop automatically creates PRs with:
# - Detailed implementation summary
# - Test results and coverage
# - Performance impact analysis
# - Breaking changes documentation
```

**3. Continuous Integration**

```yaml
# .github/workflows/claude-assisted-review.yml
name: Claude Code Review

on:
  pull_request:
    branches: [main, develop]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Claude Code Review
      uses: anthropic/claude-code-review@v1
      with:
        files-changed: ${{ github.event.pull_request.changed_files }}
        review-type: "security,performance,architecture"
        project-context: "./CLAUDE.md"
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}

    - name: Post Review Comment
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🤖 Claude Code Review completed. See details above.'
          })
```

### Development Task Patterns

**1. Daily Development Workflow**

```bash
# Morning: Check overnight Ralph Loop results
cd oms_nest
git fetch
git log --oneline origin/ralph/* # Review automated commits

# Start day with Claude Code planning
claude-plan "Today I need to implement user profile management. What should be the approach?"

# Use Ralph Loop for repetitive tasks
ralph-wiggum:ralph-loop "Create comprehensive tests for all existing controllers" --max-iterations 20

# Manual development with Claude Code assistance
# Implement complex business logic
# Code review with Claude Code
```

**2. Weekly Integration Workflow**

```bash
# Monday: Plan week with Ralph Loop automation
ralph-wiggum:ralph-loop "Plan and implement this week's sprint tasks:
1. Complete missing backend entities (if not done)
2. Implement advanced search functionality
3. Add bulk operations for order management
4. Create admin dashboard improvements
Create detailed implementation plan and execute over multiple days." --max-iterations 100

# Friday: Integration and testing
ralph-wiggum:ralph-loop "Run comprehensive integration tests across all implemented features. Fix any issues found. Ensure all user workflows work end-to-end. Generate weekly progress report." --max-iterations 30
```

## 📊 Quality Assurance with AI

### Automated Testing with Claude Code

**1. Test Generation**

```typescript
// Prompt: "Generate comprehensive tests for ProductService including edge cases"

describe('ProductService', () => {
  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      // Claude Code generates complete test scenarios
    });

    it('should handle empty results gracefully', async () => {
      // Edge case testing
    });

    it('should validate filter parameters', async () => {
      // Input validation testing
    });
  });

  describe('create', () => {
    it('should create product with valid data', async () => {
      // Happy path testing
    });

    it('should reject duplicate product names', async () => {
      // Business rule testing
    });

    it('should handle database constraints', async () => {
      // Error scenario testing
    });
  });
});
```

**2. Performance Testing**

```bash
# Ralph Loop performance testing
ralph-wiggum:ralph-loop "Create and run performance tests for OMS API:
1. Load test all endpoints with realistic data volumes
2. Test concurrent user scenarios (100 users)
3. Validate response times meet SLA (<100ms for lists, <50ms for single items)
4. Test database performance under load
5. Identify and fix performance bottlenecks
6. Generate performance report

Output <promise>PERFORMANCE_TESTING_COMPLETE</promise> when all tests pass and performance meets requirements." --max-iterations 25
```

### Code Quality Automation

**1. Architecture Validation**

```bash
# Ralph Loop architecture review
ralph-wiggum:ralph-loop "Review OMS codebase architecture and ensure consistency:
1. Verify all modules follow established patterns
2. Check dependency injection is properly used
3. Validate error handling consistency
4. Ensure authentication is properly implemented
5. Review database relationships and constraints
6. Check API documentation completeness
7. Suggest architectural improvements

Generate architectural compliance report and fix any inconsistencies found." --max-iterations 20
```

**2. Security Scanning**

```bash
# Automated security review
ralph-wiggum:ralph-loop "Perform comprehensive security audit of OMS:
1. Scan for common security vulnerabilities (OWASP Top 10)
2. Review authentication and authorization implementation
3. Check for SQL injection vulnerabilities
4. Validate input sanitization across all endpoints
5. Review JWT token handling
6. Check for sensitive data exposure in logs/responses
7. Validate CORS and security headers

Fix any security issues found and generate security compliance report." --max-iterations 15
```

## 🔧 Debugging with AI Assistance

### Claude Code Debugging Patterns

**1. Error Analysis**

```typescript
// Prompt: "I'm getting this error: [paste error]. The code is in ProductController. Help me debug."

// Claude Code provides:
// 1. Root cause analysis
// 2. Step-by-step debugging approach
// 3. Potential fixes
// 4. Prevention strategies
```

**2. Performance Debugging**

```bash
# Claude Code performance analysis
"The /products endpoint is slow (>500ms). Here's the current implementation: [paste code]. Help me optimize it."

# Claude Code analyzes:
# - Database query efficiency
# - N+1 query problems
# - Caching opportunities
# - Index recommendations
```

### Ralph Loop Debugging Automation

**1. Automated Bug Fixing**

```bash
# Ralph Loop bug fixing
ralph-wiggum:ralph-loop "Debug and fix the authentication issue in OrderController:
1. Analyze the current implementation
2. Identify why JWT validation is failing
3. Check auth guard configuration
4. Test with different user roles
5. Fix any issues found
6. Add tests to prevent regression

The error occurs when trying to access /orders with a valid JWT token. Output <promise>AUTH_BUG_FIXED</promise> when resolved." --max-iterations 10
```

**2. Integration Debugging**

```bash
# Debug frontend-backend integration
ralph-wiggum:ralph-loop "Debug and fix frontend-backend integration issues:
1. Check API endpoints are correctly configured
2. Verify CORS settings
3. Test authentication flow end-to-end
4. Fix any data format mismatches
5. Ensure error handling works properly
6. Test with realistic user scenarios

Output <promise>INTEGRATION_ISSUES_RESOLVED</promise> when frontend works seamlessly with backend." --max-iterations 15
```

## 📈 Productivity Metrics

### Measuring AI-Assisted Development

**1. Development Velocity**

```bash
# Track implementation speed
# Traditional development: 1-2 entities per week
# Claude Code assisted: 3-4 entities per week
# Ralph Loop automated: 7 entities per day

# Measure with git analytics
git log --since="1 week ago" --oneline | wc -l
git log --since="1 week ago" --stat
```

**2. Code Quality Metrics**

```bash
# Test coverage (target: >90%)
npm run test:coverage

# Code complexity
npx madge --circular backend/src
npx complexity-report backend/src

# Performance metrics
npm run build:analyze
```

**3. Error Reduction**

```bash
# Bug discovery rate
# Pre-AI: 50% bugs found in testing
# Claude Code: 80% bugs found during development
# Ralph Loop: 95% bugs prevented through comprehensive testing
```

## 🚀 Advanced AI Patterns

### Multi-Agent Development

**1. Specialized Agent Workflows**

```bash
# Backend specialist
ralph-backend:ralph-loop "Focus on backend API development and optimization" --agent-type backend-specialist

# Frontend specialist
ralph-frontend:ralph-loop "Focus on UI/UX and frontend optimization" --agent-type frontend-specialist

# DevOps specialist
ralph-devops:ralph-loop "Focus on deployment, monitoring, and infrastructure" --agent-type devops-specialist

# QA specialist
ralph-qa:ralph-loop "Focus on testing, quality assurance, and bug prevention" --agent-type qa-specialist
```

**2. Collaborative AI Development**

```bash
# Coordinated multi-agent implementation
ralph-orchestrator:ralph-loop "Coordinate implementation of complete order tracking feature:
1. Backend agent: Implement order status updates and notifications
2. Frontend agent: Create order tracking UI and real-time updates
3. DevOps agent: Set up WebSocket infrastructure
4. QA agent: Create comprehensive test suite for order tracking

Ensure all agents work together seamlessly. Output <promise>ORDER_TRACKING_COMPLETE</promise> when fully integrated." --max-iterations 40 --multi-agent
```

### AI-Generated Documentation

**1. Automatic Documentation Updates**

```bash
# Ralph Loop documentation maintenance
ralph-wiggum:ralph-loop "Update all documentation to reflect current implementation:
1. Update API documentation with new endpoints
2. Update architecture diagrams
3. Create user guides for new features
4. Update deployment instructions
5. Generate troubleshooting guides
6. Create video tutorials scripts

Ensure documentation is comprehensive and up-to-date." --max-iterations 20
```

**2. Interactive Learning Materials**

```bash
# Generate onboarding materials
ralph-wiggum:ralph-loop "Create comprehensive onboarding materials for new OMS developers:
1. Interactive tutorial for setting up development environment
2. Code examples for common tasks
3. Best practices guide
4. Common pitfalls and solutions
5. Video script for development workflow
6. Quiz questions to test understanding

Output materials that help new developers become productive quickly." --max-iterations 15
```

## 📋 Best Practices Summary

### Claude Code Best Practices

1. **Clear Context**: Always provide project context and specific requirements
2. **Iterative Refinement**: Start simple, then enhance with additional requirements
3. **Pattern Following**: Reference existing code patterns for consistency
4. **Test-Driven**: Request tests alongside implementation
5. **Documentation**: Ask for documentation updates with new features

### Ralph Loop Best Practices

1. **Atomic Tasks**: Define clear, specific outcomes for each Ralph Loop session
2. **Promise Tracking**: Use specific promise keywords to track completion
3. **Error Recovery**: Set appropriate retry limits and error handling
4. **Progress Monitoring**: Regularly check logs and progress indicators
5. **Manual Oversight**: Review critical changes before merging to main branch

### Team Collaboration

1. **AI Transparency**: Document when AI was used for implementation
2. **Code Review**: Always review AI-generated code before merging
3. **Knowledge Sharing**: Share successful AI prompts and patterns with team
4. **Quality Gates**: Maintain testing and quality standards regardless of implementation method
5. **Human Expertise**: Use AI to augment, not replace, human decision-making

## ⚡ Next Steps

### Immediate Actions

1. **Set up Ralph Loop** for overnight backend entity implementation
2. **Configure Claude Code** with project-specific context
3. **Create automation scripts** for common development tasks
4. **Establish AI code review** processes
5. **Train team** on Claude Code and Ralph Loop best practices

### Long-term Goals

1. **Achieve 95% automation** for repetitive development tasks
2. **Reduce bug rates** through AI-assisted quality assurance
3. **Improve development velocity** by 3-5x through AI assistance
4. **Maintain high code quality** with automated reviews and testing
5. **Create reusable AI patterns** for similar projects

The combination of Claude Code and Ralph Loop enables unprecedented development velocity while maintaining high quality standards. This workflow has been specifically designed for the OMS project's needs and can be adapted as the project evolves.
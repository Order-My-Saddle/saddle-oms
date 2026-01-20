# Ralph Loop Integration Guide for OMS

## Overview

Ralph Loop is an autonomous development tool that enables Claude Code to work iteratively on complex development tasks without constant human intervention. This guide provides comprehensive instructions for using Ralph Loop with the OMS Order Management System project.

## Quick Start

### Installation
Ralph Loop is available as a Claude Code plugin:
```bash
/plugin install ralph-wiggum@claude-plugins-official
```

### Immediate Action - Critical Missing Entities
```bash
# Run this command to start implementing the most critical missing backend entities
/ralph-wiggum:ralph-loop "Implement BrandsModule and ModelsModule for OMS backend following the exact pattern in backend/src/customers/. Each module must include: TypeORM entity, service with CRUD operations, controller with JWT authentication guards, DTOs for validation, and comprehensive tests (>90% coverage). These are product catalog entities critical for frontend /brands and /models pages.

VERIFICATION: cd backend && npm run test brands models && npm run lint

Output <promise>BRANDS_MODELS_COMPLETE</promise> when both modules are fully implemented and all tests pass." --max-iterations 25
```

## Project Context

### Current OMS Status
- **80% Complete**: Strong NestJS/Next.js foundation with authentication, caching, testing
- **Missing**: 7 backend entity modules blocking frontend functionality
- **Priority**: Brands, Models, Leathertypes, Options, Extras, Presets, Products modules
- **Authentication**: JWT guards commented out, need activation

### Ralph Loop Readiness ✅
- ✅ **PROMPT.md**: Complete development instructions and constraints
- ✅ **@fix_plan.md**: 4-phase implementation plan with completion promises
- ✅ **@AGENT.md**: Automation-ready build commands
- ✅ **RALPH_ADVANCED_PATTERNS.md**: Advanced workflow configurations
- ✅ **scripts/start-ralph.sh**: Quick command reference

## Development Workflows

### 1. Sequential Phase Development (Recommended)

#### Phase 1: Backend Entity Implementation
```bash
/ralph-wiggum:ralph-loop "Phase 1: Implement 7 missing backend entity modules with CRUD operations, authentication guards, >90% test coverage.

SUCCESS CRITERIA:
- All 7 modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) implemented
- Authentication guards enabled: @UseGuards(JwtAuthGuard)
- Test coverage >90%
- All existing tests pass
- Backend starts without errors

VERIFICATION: cd backend && npm run test && npm run lint && npm run test:e2e

Output <promise>PHASE1_BACKEND_COMPLETE</promise> when criteria met." --max-iterations 35
```

#### Phase 2: Frontend Integration
```bash
/ralph-wiggum:ralph-loop "Phase 2: Connect frontend to NestJS backend.

PREREQUISITES: Phase 1 complete (PHASE1_BACKEND_COMPLETE)

SUCCESS CRITERIA:
- Frontend API URL updated :8888 → :3001
- All CRUD operations working
- Auth flows tested for all 5 user roles
- Response times <100ms
- No console errors

VERIFICATION: cd frontend && npm run test && npm run build

Output <promise>PHASE2_FRONTEND_COMPLETE</promise> when criteria met." --max-iterations 25
```

#### Phase 3: E2E Testing
```bash
/ralph-wiggum:ralph-loop "Phase 3: Comprehensive E2E test suite.

PREREQUISITES: Phase 1 & 2 complete

SUCCESS CRITERIA:
- E2E tests for auth, CRUD, workflows
- Performance tests validating targets
- >95% test coverage critical paths
- All tests pass consistently

VERIFICATION: cd e2e && npx playwright test && cd ../backend && npm run test:cov

Output <promise>PHASE3_TESTING_COMPLETE</promise> when criteria met." --max-iterations 20
```

### 2. Parallel Development with Git Worktrees

#### Setup Parallel Branches
```bash
# Create isolated worktrees for parallel development
git worktree add ../oms-backend-entities -b feature/backend-entities
git worktree add ../oms-auth-hardening -b feature/auth-hardening
git worktree add ../oms-frontend-integration -b feature/frontend-integration

# List all worktrees
git worktree list
```

#### Parallel Ralph Execution
```bash
# Terminal 1: Backend entities (highest priority)
cd ../oms-backend-entities
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following patterns in backend/src/customers/. Each module: entity, service, controller, DTOs, tests. Enable @UseGuards(JwtAuthGuard). Output <promise>BACKEND_ENTITIES_COMPLETE</promise> when all 7 modules operational." --max-iterations 40

# Terminal 2: Authentication hardening
cd ../oms-auth-hardening
/ralph-wiggum:ralph-loop "Enable JWT authentication guards across ALL controllers. Remove TODO comments, activate @UseGuards(JwtAuthGuard). Test all 5 user roles (USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR). Output <promise>AUTH_HARDENING_COMPLETE</promise> when all endpoints secured." --max-iterations 20

# Terminal 3: Frontend integration
cd ../oms-frontend-integration
/ralph-wiggum:ralph-loop "Update frontend to NestJS backend (port 3001 vs PHP 8888). Update environment configs, test CRUD operations and auth flows. Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when all pages load correctly." --max-iterations 25
```

### 3. Overnight Batch Processing

#### Create Overnight Development Script
```bash
cat << 'EOF' > scripts/overnight-development.sh
#!/bin/bash
set -e
cd /Users/in615bac/Documents/OMS_NEXT/oms_nest

echo "Starting overnight OMS development: $(date)"

# Phase 1: Complete backend implementation
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules with complete CRUD operations, authentication guards, and >90% test coverage. Follow patterns in backend/src/customers/. Output <promise>OVERNIGHT_BACKEND_COMPLETE</promise> when all modules implemented and tested." --max-iterations 50

# Phase 2: Enable authentication security
/ralph-wiggum:ralph-loop "Enable authentication guards across all controllers, test all user roles, ensure proper security. Output <promise>OVERNIGHT_AUTH_COMPLETE</promise> when secured." --max-iterations 20

# Phase 3: Frontend integration
/ralph-wiggum:ralph-loop "Connect frontend to NestJS backend, update configurations, validate all functionality. Output <promise>OVERNIGHT_FRONTEND_COMPLETE</promise> when integrated." --max-iterations 30

echo "Overnight processing completed: $(date)"
EOF

chmod +x scripts/overnight-development.sh
```

#### Monitor Overnight Progress
```bash
cat << 'EOF' > scripts/monitor-overnight.sh
#!/bin/bash
while true; do
    echo "$(date): Checking overnight progress..."

    # Check for completion promises
    if grep -q "OVERNIGHT_BACKEND_COMPLETE" *.log 2>/dev/null; then
        echo "✅ Backend implementation completed"
    fi

    if grep -q "OVERNIGHT_AUTH_COMPLETE" *.log 2>/dev/null; then
        echo "✅ Authentication hardening completed"
    fi

    if grep -q "OVERNIGHT_FRONTEND_COMPLETE" *.log 2>/dev/null; then
        echo "✅ Frontend integration completed"
        break
    fi

    sleep 300  # Check every 5 minutes
done
EOF

chmod +x scripts/monitor-overnight.sh
```

## Safety and Best Practices

### Pre-Ralph Checklist
```bash
# Before starting any Ralph loop:
1. git add . && git commit -m "Pre-Ralph checkpoint"
2. git branch backup-$(date +%s)
3. cd /Users/in615bac/Documents/OMS_NEXT/oms_nest
4. Ensure backend/src/customers/ exists (template pattern)
5. Review scripts/start-ralph.sh for command options
```

### Iteration Limits and Cost Management
| Task Complexity | Recommended Max Iterations | Estimated Cost |
|----------------|---------------------------|----------------|
| Simple (entity module) | 15-20 | $5-10 |
| Medium (auth hardening) | 20-25 | $10-15 |
| Complex (full backend) | 35-50 | $20-30 |
| Overnight batch | 50+ | $30-50 |

### Error Recovery Patterns
```bash
# Pattern: Error-resilient completion promise
/ralph-wiggum:ralph-loop "Task with built-in error recovery.

PRIMARY GOAL: [Main objective]

IF ERRORS ENCOUNTERED:
1. Log the specific error
2. Attempt alternative approach
3. Simplify implementation if needed
4. Ensure partial progress is saved

FALLBACK SUCCESS: If primary goal cannot be achieved, implement simplified version and output <promise>PARTIAL_SUCCESS_STABLE</promise>

FULL SUCCESS: Output <promise>COMPLETE_SUCCESS</promise> only when primary goal fully achieved." --max-iterations N
```

### Post-Ralph Validation
```bash
# After Ralph completion:
1. Review git diff for all changes
2. Run full test suite: npm run test && npm run test:e2e
3. Check build integrity: npm run build
4. Validate core functionality manually
5. Commit with descriptive message
```

## Quick Command Reference

### Essential Commands
```bash
# View all available commands
./scripts/start-ralph.sh

# Quick start (most critical entities)
# [Copy command from start-ralph.sh option 1]

# Complete backend (all 7 entities)
# [Copy command from start-ralph.sh option 2]

# Authentication hardening
# [Copy command from start-ralph.sh option 3]

# Frontend integration
# [Copy command from start-ralph.sh option 4]
```

### Specialized Commands
```bash
# Individual entity implementation
/ralph-wiggum:ralph-loop "Implement [EntityName]Module for OMS backend following backend/src/customers/ pattern. Include: entity, service, controller, DTOs, tests. Enable JWT guards. Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise> when done." --max-iterations 20

# Authentication only
/ralph-wiggum:ralph-loop "Enable @UseGuards(JwtAuthGuard) across all OMS controllers. Test all 5 user roles. Output <promise>AUTH_GUARDS_ENABLED</promise> when secured." --max-iterations 15

# Testing enhancement
/ralph-wiggum:ralph-loop "Create comprehensive test suite for OMS with >95% coverage. Include unit, integration, and E2E tests. Output <promise>TESTING_COMPLETE</promise> when done." --max-iterations 25
```

## Integration with OMS Architecture

### Entity Implementation Pattern
Ralph Loop follows the established OMS patterns:
```typescript
// Template structure for new entities
backend/[entity]/
├── domain/
│   ├── [entity].ts              # Domain model
│   └── [entity].repository.ts   # Repository interface
├── infrastructure/
│   ├── persistence/
│   │   ├── relational/
│   │   │   ├── entities/[entity].entity.ts
│   │   │   ├── repositories/[entity].repository.impl.ts
│   │   │   └── mappers/[entity].mapper.ts
├── [entity].service.ts          # Business logic
├── [entity].controller.ts       # REST endpoints
├── dto/
│   ├── create-[entity].dto.ts
│   ├── update-[entity].dto.ts
│   └── query-[entity].dto.ts
└── [entity].module.ts           # NestJS module
```

### Authentication Integration
```typescript
// JWT guard pattern Ralph Loop implements
@Controller('api/[entity]')
@UseGuards(JwtAuthGuard)  // Ralph enables this
export class EntityController {
  @Get()
  async findAll(@Query() query: QueryEntityDto) {
    return this.service.findAll(query);
  }
}
```

## Troubleshooting

### Common Issues
1. **"PROMPT.md not found"**: Ensure you're in the OMS root directory
2. **"Template pattern missing"**: Verify backend/src/customers/ exists
3. **"Tests failing"**: Check if existing test suite passes before starting Ralph
4. **"Authentication errors"**: Ensure JWT configuration is correct

### Recovery Procedures
```bash
# If Ralph loop gets stuck:
1. Check current iteration count
2. Review git commits made by Ralph
3. Run verification commands manually
4. If needed: git reset --hard backup-branch
5. Restart with simplified task scope
```

### Performance Optimization
- Use specific completion promises for faster convergence
- Set conservative iteration limits for complex tasks
- Monitor token usage with multiple small tasks vs. single large task
- Leverage git worktrees for true parallel development

## Next Steps

1. **Start Small**: Run the Quick Start command for Brands/Models entities
2. **Scale Up**: Use parallel worktrees for simultaneous development
3. **Automate**: Set up overnight batch processing for large tasks
4. **Monitor**: Track progress and costs throughout development
5. **Iterate**: Refine Ralph commands based on success patterns

For detailed technical implementation, see:
- `backend/docs/ralph-loop-development.md`
- `docs/RALPH-ADVANCED-PATTERNS.md`
- `scripts/start-ralph.sh`
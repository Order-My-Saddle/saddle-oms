# Ralph Loop Quick Reference for OMS

## Instant Commands (Copy & Paste Ready)

### 🚀 Quick Start - Most Critical (Recommended First)
```bash
/ralph-wiggum:ralph-loop "Implement BrandsModule and ModelsModule for OMS backend following the exact pattern in backend/src/customers/. Each module must include: TypeORM entity, service with CRUD operations, controller with JWT authentication guards, DTOs for validation, and comprehensive tests (>90% coverage). These are product catalog entities critical for frontend /brands and /models pages.

VERIFICATION: cd backend && npm run test brands models && npm run lint

Output <promise>BRANDS_MODELS_COMPLETE</promise> when both modules are fully implemented and all tests pass." --max-iterations 25
```

### 🔧 Complete Backend - All 7 Missing Entities
```bash
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the exact patterns in backend/src/customers/ and backend/src/orders/. Each module must include: TypeORM entity, service with CRUD operations, controller with JWT authentication guards (@UseGuards(JwtAuthGuard)), DTOs for validation, and comprehensive tests achieving >90% coverage.

SUCCESS CRITERIA:
- All 7 modules compile without errors
- Authentication guards enabled on all endpoints
- Test coverage >90% for each module
- All existing tests still pass
- Backend starts successfully

VERIFICATION: cd backend && npm run test && npm run lint && npm run test:e2e

Output <promise>ALL_BACKEND_ENTITIES_COMPLETE</promise> when all criteria are met." --max-iterations 40
```

### 🔐 Authentication Hardening
```bash
/ralph-wiggum:ralph-loop "Enable JWT authentication guards across ALL controllers in the OMS backend. Remove TODO comments and activate @UseGuards(JwtAuthGuard) in: customers/customer.controller.ts, orders/order.controller.ts, fitters/fitter.controller.ts, suppliers/supplier.controller.ts, users/users.controller.ts, enriched-orders/enriched-orders.controller.ts, and all new entity controllers.

Test authentication flows for all 5 user roles (USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR). Ensure proper 401/403 error responses for unauthorized access.

VERIFICATION: cd backend && npm run test:e2e && npm run test auth

Output <promise>AUTH_SECURITY_COMPLETE</promise> when all endpoints are secured and tests pass." --max-iterations 15
```

### 🌐 Frontend Integration
```bash
/ralph-wiggum:ralph-loop "Update OMS frontend to connect with NestJS backend instead of PHP. Change API URLs from :8888 to :3001 in frontend/.env.local and frontend/src/lib/api.ts. Update all service files with hardcoded URLs.

Test all CRUD operations and authentication flows for all 5 user roles. Validate that response times meet performance targets (<100ms). Ensure all frontend pages load without errors.

VERIFICATION: cd frontend && npm run test && npm run build

Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when integration is complete and all functionality works." --max-iterations 25
```

### 🧪 E2E Testing Suite
```bash
/ralph-wiggum:ralph-loop "Create comprehensive E2E test suite for OMS covering all authentication flows, CRUD operations, business workflows, and performance testing. Use Playwright framework already configured in the project.

SUCCESS CRITERIA:
- Authentication tests for all 5 user roles
- CRUD operation tests for all entities
- Business workflow tests (order lifecycle, customer onboarding)
- Performance tests validating response time targets
- >95% test coverage across critical paths

VERIFICATION: cd e2e && npx playwright test && cd ../backend && npm run test:cov

Output <promise>E2E_TESTING_COMPLETE</promise> when all tests are implemented and passing." --max-iterations 20
```

## Specialized Commands

### Individual Entity Implementation
```bash
/ralph-wiggum:ralph-loop "Implement [ENTITY_NAME]Module for OMS backend following backend/src/customers/ pattern. Include: TypeORM entity with proper relationships, service with CRUD operations, controller with @UseGuards(JwtAuthGuard), DTOs for create/update/query, and comprehensive tests (>90% coverage).

VERIFICATION: cd backend && npm run test [entity-name] && npm run lint

Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise> when module is fully implemented and tested." --max-iterations 20
```

**Replace [ENTITY_NAME] with:**
- Brands
- Models
- Leathertypes
- Options
- Extras
- Presets
- Products

### Quick Authentication Fix
```bash
/ralph-wiggum:ralph-loop "Quick authentication fix: Remove all TODO comments about auth guards and enable @UseGuards(JwtAuthGuard) on ALL controller methods in OMS backend. Verify authentication works correctly.

VERIFICATION: cd backend && npm run test auth

Output <promise>QUICK_AUTH_FIX_COMPLETE</promise> when all guards enabled and working." --max-iterations 10
```

### Performance Optimization
```bash
/ralph-wiggum:ralph-loop "Optimize OMS backend performance: review and improve database queries, add missing indexes, optimize Redis caching, and ensure response times <100ms for all endpoints.

SUCCESS CRITERIA:
- All list endpoints respond in <100ms
- Single entity endpoints respond in <50ms
- Cache hit rate >85%
- No N+1 query issues

VERIFICATION: cd backend && npm run test && npm run benchmarks

Output <promise>PERFORMANCE_OPTIMIZED</promise> when targets met." --max-iterations 15
```

## Advanced Patterns

### Parallel Development Setup
```bash
# Setup parallel worktrees
git worktree add ../oms-backend-entities -b feature/backend-entities
git worktree add ../oms-auth-hardening -b feature/auth-hardening
git worktree add ../oms-frontend-integration -b feature/frontend-integration

# Run in separate terminals
cd ../oms-backend-entities
# [Run backend entity command above]

cd ../oms-auth-hardening
# [Run authentication hardening command above]

cd ../oms-frontend-integration
# [Run frontend integration command above]
```

### Overnight Batch Processing
```bash
# Create overnight script
cat << 'EOF' > scripts/overnight-development.sh
#!/bin/bash
set -e
cd /Users/in615bac/Documents/OMS_NEXT/oms_nest

echo "Starting overnight OMS development: $(date)" | tee overnight.log

# Complete backend implementation (2-3 hours estimated)
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules with complete CRUD operations, authentication guards, and >90% test coverage. Follow patterns in backend/src/customers/. Output <promise>OVERNIGHT_BACKEND_COMPLETE</promise> when all modules implemented and tested." --max-iterations 50 2>&1 | tee -a overnight.log

# Authentication hardening (30 minutes estimated)
/ralph-wiggum:ralph-loop "Enable authentication guards across all controllers, test all user roles, ensure proper security. Output <promise>OVERNIGHT_AUTH_COMPLETE</promise> when secured." --max-iterations 20 2>&1 | tee -a overnight.log

# Frontend integration (1-2 hours estimated)
/ralph-wiggum:ralph-loop "Connect frontend to NestJS backend, update configurations, validate all functionality. Output <promise>OVERNIGHT_FRONTEND_COMPLETE</promise> when integrated." --max-iterations 30 2>&1 | tee -a overnight.log

echo "Overnight processing completed: $(date)" | tee -a overnight.log
EOF

chmod +x scripts/overnight-development.sh
./scripts/overnight-development.sh
```

## Safety Checklist

### Before Starting Ralph
- [ ] `git add . && git commit -m "Pre-Ralph checkpoint"`
- [ ] `git branch backup-$(date +%s)`
- [ ] Ensure you're in project root: `/Users/in615bac/Documents/OMS_NEXT/oms_nest`
- [ ] Verify backend/src/customers/ exists (template pattern)
- [ ] Check current tests pass: `cd backend && npm test`

### Command Structure Template
```bash
/ralph-wiggum:ralph-loop "[Clear task description]

SUCCESS CRITERIA:
- [Specific measurable criterion 1]
- [Specific measurable criterion 2]
- [Test/verification requirement]

VERIFICATION: [Command to validate success]

Output <promise>[SPECIFIC_COMPLETION_PROMISE]</promise> when [completion condition]." --max-iterations [conservative-limit]
```

### Iteration Limits Guide
| Task Type | Max Iterations | Estimated Time | Estimated Cost |
|-----------|---------------|----------------|----------------|
| Single entity | 15-20 | 30-60 min | $5-10 |
| 2-3 entities | 25-30 | 1-2 hours | $10-15 |
| All 7 entities | 35-50 | 2-4 hours | $20-30 |
| Auth hardening | 15-20 | 30-60 min | $5-10 |
| Frontend integration | 20-30 | 1-2 hours | $10-15 |
| E2E testing | 20-25 | 1-2 hours | $10-15 |
| Overnight batch | 50+ | 4-8 hours | $30-50 |

## Monitoring and Recovery

### Check Ralph Progress
```bash
# Monitor current iteration
tail -f *.log | grep "iteration\|promise\|error"

# Check completion promises
grep -r "promise>" . --include="*.log"

# Review git commits made by Ralph
git log --oneline -10
```

### Recovery Commands
```bash
# If Ralph gets stuck
git log --oneline  # Review what was done
git status        # Check current state
git diff          # See current changes

# Reset if needed (CAUTION)
git reset --hard backup-branch-name

# Restart with smaller scope
# Use individual entity commands instead of all-at-once
```

## Quick Navigation

### Scripts
- `./scripts/start-ralph.sh` - Interactive command selection
- `./scripts/overnight-development.sh` - Automated batch processing
- `./scripts/monitor-overnight.sh` - Progress monitoring

### Documentation
- `docs/RALPH-LOOP-INTEGRATION.md` - Comprehensive guide
- `docs/RALPH-ADVANCED-PATTERNS.md` - Advanced workflows
- `backend/docs/ralph-loop-development.md` - Backend-specific guide
- `PROMPT.md` - Project constraints and patterns
- `@fix_plan.md` - Phase implementation plan

### Key Files to Check
- `backend/src/customers/` - Template pattern for new entities
- `backend/src/orders/` - Complex entity example
- `frontend/src/lib/api.ts` - API integration points
- `package.json` - Available npm scripts

Start with the **Quick Start** command above for immediate results!
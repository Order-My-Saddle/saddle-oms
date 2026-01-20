# OMS Ralph Loop Advanced Patterns Implementation

## Overview
This document implements advanced Ralph Loop patterns for the OMS project based on best practices from the Ralph Wiggum documentation and community blogs.

## 1. Git Worktree Strategy for Parallel Development

### Setup Parallel Development Branches
```bash
# Create worktrees for parallel development
git worktree add ../oms-backend-entities -b feature/backend-entities
git worktree add ../oms-auth-hardening -b feature/auth-hardening
git worktree add ../oms-frontend-integration -b feature/frontend-integration
git worktree add ../oms-testing-suite -b feature/testing-suite

# List all worktrees
git worktree list
```

### Parallel Ralph Loop Execution
```bash
# Terminal 1: Backend entities (highest priority)
cd ../oms-backend-entities
/ralph-wiggum:ralph-loop "Implement the 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the established patterns in backend/src/customers/ and backend/src/orders/. Each module must have: entity, service, controller, DTOs, tests. Enable authentication guards. Output <promise>BACKEND_ENTITIES_COMPLETE</promise> when all 7 modules pass tests." Yo

# Terminal 2: Authentication hardening
cd ../oms-auth-hardening
/ralph-wiggum:ralph-loop "Enable and test JWT authentication guards across all controllers. Remove TODO comments and activate @UseGuards(JwtAuthGuard) in all controller files. Test all 5 user roles (USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR). Output <promise>AUTH_HARDENING_COMPLETE</promise> when all endpoints are secured and tests pass." --max-iterations 20

# Terminal 3: Frontend integration (after backend complete)
cd ../oms-frontend-integration
/ralph-wiggum:ralph-loop "Update frontend services to connect to NestJS backend (port 3001) instead of PHP (port 8888). Update environment configs, API endpoints, and test all CRUD operations. Ensure authentication flows work for all user roles. Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when all frontend pages load correctly." --max-iterations 25
```

## 2. Multi-Phase Development with Sequential Chaining

### Phase Chain Configuration
```bash
# Phase 1: Core Backend Implementation
/ralph-wiggum:ralph-loop "Phase 1: Implement 7 missing backend entity modules with complete CRUD operations, authentication guards, and >90% test coverage.

Success Criteria:
- All 7 modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) implemented
- Authentication guards enabled on all controllers
- Test coverage >90%
- All existing tests still pass
- Backend starts without errors

Verification Commands:
cd backend && npm run test && npm run lint && npm run test:e2e

Output <promise>PHASE1_BACKEND_COMPLETE</promise> when criteria met." --max-iterations 30

# Phase 2: Frontend Integration (triggered after Phase 1)
/ralph-wiggum:ralph-loop "Phase 2: Connect frontend to new NestJS backend and validate all functionality.

Prerequisites: Phase 1 must be complete (PHASE1_BACKEND_COMPLETE)

Success Criteria:
- Frontend API URL updated from :8888 to :3001
- All CRUD operations working
- Authentication flows tested for all 5 user roles
- Response times <100ms
- No console errors

Verification Commands:
cd frontend && npm run test && npm run build && npm run start

Output <promise>PHASE2_FRONTEND_COMPLETE</promise> when criteria met." --max-iterations 25

# Phase 3: E2E Testing and Validation
/ralph-wiggum:ralph-loop "Phase 3: Create comprehensive E2E test suite covering all user workflows.

Prerequisites: Phase 1 and 2 must be complete

Success Criteria:
- E2E tests covering authentication, CRUD, business workflows
- Performance tests validating response time targets
- >95% test coverage across critical paths
- All tests pass consistently

Verification Commands:
cd e2e && npx playwright test && cd ../backend && npm run test:cov

Output <promise>PHASE3_TESTING_COMPLETE</promise> when criteria met." --max-iterations 20
```

## 3. Overnight Batch Processing Configuration

### Automated Overnight Development Script
```bash
#!/bin/bash
# File: overnight-development.sh

set -e
cd /Users/in615bac/Documents/OMS_NEXT/oms_nest

echo "Starting overnight OMS development batch processing..."
echo "Timestamp: $(date)"

# Phase 1: Backend Entities (estimated 2-3 hours)
echo "=== Phase 1: Backend Entity Implementation ==="
/ralph-wiggum:ralph-loop "Implement all 7 missing backend entity modules (Brands, Models, Leathertypes, Options, Extras, Presets, Products) following the exact patterns in backend/src/customers/ and backend/src/orders/. Each module needs: TypeORM entity, service with CRUD operations, controller with authentication guards, DTOs for validation, and comprehensive tests. Enable @UseGuards(JwtAuthGuard) on all endpoints. Ensure >90% test coverage. Output <promise>OVERNIGHT_BACKEND_COMPLETE</promise> when all modules are implemented and tests pass." --max-iterations 50

# Phase 2: Authentication Security (estimated 1 hour)
echo "=== Phase 2: Authentication Hardening ==="
/ralph-wiggum:ralph-loop "Review and enable authentication guards across ALL controllers in the backend. Remove TODO comments and activate JWT guards. Test authentication flows for all 5 user roles. Ensure proper error handling for unauthorized access. Output <promise>OVERNIGHT_AUTH_COMPLETE</promise> when all endpoints are secured." --max-iterations 20

# Phase 3: Frontend Integration (estimated 2 hours)
echo "=== Phase 3: Frontend Integration ==="
/ralph-wiggum:ralph-loop "Update frontend to connect with NestJS backend. Change API URLs from PHP (:8888) to NestJS (:3001). Update environment configurations. Test all CRUD operations and user workflows. Validate authentication flows work correctly. Ensure response times meet performance targets (<100ms). Output <promise>OVERNIGHT_FRONTEND_COMPLETE</promise> when integration is complete." --max-iterations 30

echo "Overnight batch processing completed at: $(date)"
echo "Check git history for all changes made during overnight processing."
```

### Batch Processing Safety Configuration
```bash
# Make script executable
chmod +x overnight-development.sh

# Create monitoring script
cat << 'EOF' > monitor-overnight.sh
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

chmod +x monitor-overnight.sh
```

## 4. Optimized Prompt Engineering Patterns

### Completion Promise Optimization
```bash
# Pattern 1: Specific Technical Completion
/ralph-wiggum:ralph-loop "Task description with clear technical criteria.

COMPLETION CRITERIA:
- Specific measurable outcome 1
- Specific measurable outcome 2
- All tests pass
- No build errors

VERIFICATION COMMAND:
npm run test && npm run build

Output <promise>TASK_COMPLETE_WITH_TESTS_PASSING</promise> ONLY when all criteria are met." --max-iterations N

# Pattern 2: Multi-Stage Completion
/ralph-wiggum:ralph-loop "Multi-stage task with checkpoints.

STAGE 1: Implement core functionality
Output <checkpoint>CORE_IMPLEMENTED</checkpoint>

STAGE 2: Add comprehensive tests
Output <checkpoint>TESTS_ADDED</checkpoint>

STAGE 3: Optimize and validate
Output <promise>FULL_TASK_COMPLETE</promise>

Continue to next stage only after previous checkpoint is reached." --max-iterations N

# Pattern 3: Error-Resilient Completion
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

## 5. Cost-Effective Iteration Strategies

### Conservative Iteration Limits Based on Task Complexity
```bash
# Simple tasks (3-8 iterations typical)
--max-iterations 15

# Medium complexity (5-12 iterations typical)
--max-iterations 25

# Complex tasks (10-20 iterations typical)
--max-iterations 35

# Very complex/overnight tasks (20-40 iterations)
--max-iterations 50
```

### Iteration Monitoring Pattern
```bash
# Add monitoring to track iteration efficiency
/ralph-wiggum:ralph-loop "Task description.

ITERATION TRACKING:
- Iteration 1-5: Core implementation
- Iteration 6-10: Testing and refinement
- Iteration 11+: Edge case handling

If reaching iteration 15+ without significant progress, simplify approach.

Output iteration progress: <iteration>N</iteration> at start of each cycle.
Output <promise>TASK_COMPLETE</promise> when done." --max-iterations 20
```

## 6. Ready-to-Use OMS-Specific Prompt Templates

### Template 1: Backend Entity Implementation
```bash
/ralph-wiggum:ralph-loop "Implement NestJS entity module for [ENTITY_NAME] in the OMS system.

REQUIREMENTS:
1. Create complete module following backend/src/customers/ pattern
2. Include: entity, service, controller, DTOs, tests
3. Enable JWT authentication guards
4. Add proper TypeORM relationships
5. Implement CRUD operations with pagination
6. Add input validation with class-validator

VERIFICATION:
cd backend && npm run test [entity-name] && npm run lint

SUCCESS CRITERIA:
- Module compiles without errors
- All tests pass (>90% coverage)
- Authentication works correctly
- CRUD operations functional

Output <promise>[ENTITY_NAME]_MODULE_COMPLETE</promise> when done." --max-iterations 20
```

### Template 2: Frontend Integration
```bash
/ralph-wiggum:ralph-loop "Update frontend integration for OMS NestJS backend.

REQUIREMENTS:
1. Change API URLs from :8888 (PHP) to :3001 (NestJS)
2. Update environment configurations
3. Test authentication flows for all user roles
4. Validate CRUD operations work correctly
5. Ensure error handling is proper
6. Check performance targets (<100ms response times)

FILES TO UPDATE:
- frontend/.env.local
- frontend/src/lib/api.ts
- All service files with hardcoded URLs

VERIFICATION:
cd frontend && npm run test && npm run build

SUCCESS CRITERIA:
- All pages load without errors
- Authentication flows work for all 5 user roles
- CRUD operations functional
- Performance targets met

Output <promise>FRONTEND_INTEGRATION_COMPLETE</promise> when done." --max-iterations 25
```

### Template 3: Authentication Security Hardening
```bash
/ralph-wiggum:ralph-loop "Enable and secure JWT authentication across OMS backend.

REQUIREMENTS:
1. Remove all TODO comments about auth guards
2. Enable @UseGuards(JwtAuthGuard) on ALL controllers
3. Test authentication for all 5 user roles:
   - USER, FITTER, SUPPLIER, ADMIN, SUPERVISOR
4. Validate proper error responses for unauthorized access
5. Ensure role-based access control works correctly

CONTROLLERS TO UPDATE:
- customers/customer.controller.ts
- orders/order.controller.ts
- fitters/fitter.controller.ts
- suppliers/supplier.controller.ts
- users/users.controller.ts
- enriched-orders/enriched-orders.controller.ts
- All new entity controllers

VERIFICATION:
cd backend && npm run test:e2e && npm run test auth

SUCCESS CRITERIA:
- All endpoints secured with JWT guards
- Unauthorized requests return 401/403 properly
- All authenticated requests work correctly
- Role-based access enforced

Output <promise>AUTH_SECURITY_COMPLETE</promise> when done." --max-iterations 15
```

## 7. Safety and Monitoring Best Practices

### Pre-Ralph Checklist
```bash
# Before starting any Ralph loop:
1. Commit current work: git add . && git commit -m "Pre-Ralph checkpoint"
2. Create backup branch: git branch backup-$(date +%s)
3. Set realistic iteration limits
4. Define clear completion criteria
5. Prepare rollback plan
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

## 8. Usage Examples for OMS Implementation

### Quick Start - High Priority Backend Entities
```bash
cd /Users/in615bac/Documents/OMS_NEXT/oms_nest

# Start with most critical missing entities
/ralph-wiggum:ralph-loop "Implement BrandsModule and ModelsModule for OMS backend following the exact pattern in backend/src/customers/. Include complete CRUD operations, authentication guards, proper TypeORM entities, DTOs for validation, and comprehensive tests. These are product catalog entities critical for frontend functionality. Output <promise>BRANDS_MODELS_COMPLETE</promise> when both modules are fully implemented and tested." --max-iterations 25
```

### Medium-Term - Complete Backend Implementation
```bash
# After initial entities are working
/ralph-wiggum:ralph-loop "Complete implementation of remaining 5 backend entity modules: Leathertypes, Options, Extras, Presets, Products. Each module must follow established patterns, include relationships to other entities, have >90% test coverage, and work with the authentication system. Output <promise>ALL_BACKEND_ENTITIES_COMPLETE</promise> when all 7 product entities are fully operational." --max-iterations 40
```

This advanced pattern implementation provides the OMS project with production-ready autonomous development capabilities, cost-effective iteration strategies, and comprehensive safety measures.
# Staging Deployment Guide

## Overview

This guide covers deploying the Order Management System (OMS) to the **oms-staging-v2** Kubernetes namespace using automated DevSecOps pipelines. The staging environment provides a production-like environment for testing new features, integrations, and security updates.

## Quick Start

### Automated Deployment (Recommended)
```bash
# Push to main branch to trigger deployment
git push origin main

# Or manually trigger from GitHub Actions UI
```

### Manual Deployment
```bash
# Set up environment variables
cp .env.staging-v2.template .env.staging-v2
# Edit .env.staging-v2 with actual values

# Deploy
./scripts/deploy-staging-v2.sh
```

## Environment Details

### Infrastructure
- **Namespace**: `oms-staging-v2`
- **Cluster**: DigitalOcean Kubernetes
- **Ingress**: NGINX with SSL termination
- **Storage**: DigitalOcean Block Storage
- **Registry**: GitHub Container Registry (GHCR)

### Services
- **Frontend**: Next.js 15 application
- **Backend**: NestJS API server
- **Database**: PostgreSQL 16 with persistent storage
- **Cache**: Redis 7 for sessions and caching
- **Monitoring**: Prometheus metrics collection

### URLs
- **Frontend**: https://staging-v2.ordermysaddle.com
- **Backend API**: https://api-staging-v2.ordermysaddle.com
- **API Docs**: https://api-staging-v2.ordermysaddle.com/docs
- **Health Check**: https://api-staging-v2.ordermysaddle.com/health

## Deployment Methods

### 1. GitHub Actions Workflow (Recommended)

The automated CI/CD pipeline provides comprehensive DevSecOps capabilities:

#### Pipeline Stages
1. **Security Scan**: Trivy vulnerability scanning
2. **Backend Build**: Lint, test, build Docker image
3. **Frontend Build**: Lint, test, build Docker image
4. **Deploy**: Kubernetes deployment with rolling updates
5. **E2E Tests**: Automated validation testing
6. **Notify**: Slack notifications on completion

#### Trigger Options

**Automatic Triggers**:
- Push to `main` branch
- Push to `develop` branch
- PR with `deploy-staging-v2` label

**Manual Trigger**:
1. Go to GitHub Actions
2. Select "Deploy to Staging V2"
3. Click "Run workflow"
4. Choose environment options

#### Required GitHub Secrets

Configure in **Settings** → **Secrets and variables** → **Actions**:

```bash
# Database
DB_USERNAME=staging_db_user
DB_PASSWORD=secure_db_password
DB_HOST=your-postgres-host.com
DB_NAME=oms_staging_v2

# Application
JWT_SECRET_KEY=your-32-character-jwt-secret
ENCRYPTION_SECRET=your-encryption-secret

# Infrastructure
DIGITALOCEAN_ACCESS_TOKEN=your-do-token
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=your-redis-password

# Testing (Optional)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test_password

# Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### 2. Manual Script Deployment

For local development or troubleshooting:

#### Prerequisites
```bash
# Install required tools
brew install kubectl doctl docker

# Authenticate with services
doctl auth init
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

#### Environment Setup
```bash
# Copy and configure environment
cp .env.staging-v2.template .env.staging-v2

# Edit with your values:
# - Database credentials
# - Application secrets
# - Infrastructure tokens
```

#### Execute Deployment
```bash
./scripts/deploy-staging-v2.sh
```

## Architecture

### Container Images
- **Backend**: `ghcr.io/your-org/oms-backend:staging-v2-latest`
- **Frontend**: `ghcr.io/your-org/oms-frontend:staging-v2-latest`

### Kubernetes Resources

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: oms-staging-v2
  labels:
    environment: staging
    project: oms
```

#### Core Services
- **PostgreSQL StatefulSet**: Primary database with 10GB persistent storage
- **Redis StatefulSet**: Cache and session storage with 1GB storage
- **Backend Deployment**: NestJS API with 2 replicas
- **Frontend Deployment**: Next.js app with 2 replicas

#### Security Features
- **Network Policies**: Traffic isolation between namespaces
- **Pod Security Contexts**: Non-root containers, read-only filesystems
- **RBAC**: Least-privilege service accounts
- **Secret Management**: Kubernetes secrets for sensitive data

#### High Availability
- **Horizontal Pod Autoscaler**: Auto-scaling based on CPU/memory
- **Rolling Updates**: Zero-downtime deployments
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: Memory and CPU constraints

## Monitoring & Observability

### Health Endpoints
```bash
# Application health
curl https://api-staging-v2.ordermysaddle.com/health

# Database health
curl https://api-staging-v2.ordermysaddle.com/health/database

# Frontend health
curl https://staging-v2.ordermysaddle.com/api/health
```

### Kubernetes Monitoring
```bash
# Pod status
kubectl get pods -n oms-staging-v2

# Service endpoints
kubectl get services -n oms-staging-v2

# Ingress configuration
kubectl get ingress -n oms-staging-v2

# Resource usage
kubectl top pods -n oms-staging-v2
```

### Application Logs
```bash
# Backend application logs
kubectl logs -f deployment/oms-backend -n oms-staging-v2

# Frontend application logs
kubectl logs -f deployment/oms-frontend -n oms-staging-v2

# Database logs
kubectl logs -f statefulset/oms-postgres -n oms-staging-v2

# Redis logs
kubectl logs -f statefulset/oms-redis -n oms-staging-v2
```

### Metrics Collection
- **Prometheus**: Application metrics at `/metrics` endpoints
- **Custom Metrics**: Business logic performance indicators
- **Infrastructure Metrics**: Kubernetes cluster resource usage

## Testing & Validation

### Automated E2E Tests
The deployment pipeline includes comprehensive end-to-end testing:

```bash
# Run tests locally against staging
cd e2e
npx playwright test --config=staging-v2.config.ts
```

#### Test Coverage
- **Health Checks**: All services responding correctly
- **Authentication**: JWT token validation and protected endpoints
- **API Endpoints**: All core business entities accessible
- **Security**: CORS headers, security headers, rate limiting
- **Performance**: Page load times and response times
- **Cross-browser**: Chrome, Firefox, Safari, mobile devices

### Manual Testing Checklist

#### Pre-deployment
- [ ] Environment secrets configured
- [ ] Database backup completed
- [ ] Network connectivity verified
- [ ] Resource quotas checked

#### Post-deployment
- [ ] All pods running and healthy
- [ ] Health endpoints returning 200 OK
- [ ] Database migrations completed successfully
- [ ] Frontend application loads without errors
- [ ] API documentation accessible
- [ ] Authentication flow working
- [ ] CORS configuration correct
- [ ] SSL certificates valid

#### Performance Validation
- [ ] Frontend loads within 3 seconds
- [ ] API responses under 100ms for simple queries
- [ ] Database queries optimized
- [ ] Memory usage within limits
- [ ] CPU utilization normal

## Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n oms-staging-v2

# Check resource limits
kubectl get pods -o wide -n oms-staging-v2

# Review logs
kubectl logs <pod-name> -n oms-staging-v2
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it deployment/oms-backend -n oms-staging-v2 -- npm run db:test

# Check database secrets
kubectl get secret oms-postgres-secrets -n oms-staging-v2 -o yaml

# Access database directly
kubectl exec -it statefulset/oms-postgres -n oms-staging-v2 -- psql -U $DB_USERNAME -d $DB_NAME
```

#### Image Pull Errors
```bash
# Check registry credentials
kubectl get secret registry-credentials -n oms-staging-v2 -o yaml

# Verify image tags
kubectl describe deployment/oms-backend -n oms-staging-v2
```

#### SSL/Ingress Issues
```bash
# Check ingress status
kubectl describe ingress oms-staging-v2-ingress -n oms-staging-v2

# Verify TLS certificates
kubectl get certificate -n oms-staging-v2

# Test DNS resolution
nslookup staging-v2.ordermysaddle.com
```

### Recovery Procedures

#### Rollback Deployment
```bash
# View rollout history
kubectl rollout history deployment/oms-backend -n oms-staging-v2

# Rollback to previous version
kubectl rollout undo deployment/oms-backend -n oms-staging-v2
kubectl rollout undo deployment/oms-frontend -n oms-staging-v2

# Check rollback status
kubectl rollout status deployment/oms-backend -n oms-staging-v2
```

#### Emergency Scale Down
```bash
# Scale to zero (maintenance mode)
kubectl scale deployment/oms-backend --replicas=0 -n oms-staging-v2
kubectl scale deployment/oms-frontend --replicas=0 -n oms-staging-v2
```

#### Database Recovery
```bash
# Access database for manual intervention
kubectl exec -it statefulset/oms-postgres -n oms-staging-v2 -- bash

# Run specific migration
kubectl exec -it deployment/oms-backend -n oms-staging-v2 -- npm run migration:run
```

## Security Considerations

### Data Protection
- All environment variables stored as Kubernetes secrets
- Database passwords never logged or exposed
- JWT secrets rotated regularly
- SSL/TLS encryption for all external traffic

### Network Security
- Network policies restrict inter-pod communication
- Ingress controller provides WAF protection
- Rate limiting prevents abuse
- CORS properly configured for frontend origins

### Container Security
- Non-root containers with minimal privileges
- Read-only root filesystems where possible
- Security contexts enforce resource constraints
- Regular vulnerability scanning with Trivy

### Access Control
- RBAC policies limit Kubernetes access
- Service accounts use least-privilege principles
- Audit logging enabled for all administrative actions

## Performance Optimization

### Resource Allocation
```yaml
# Backend resources
requests:
  memory: "512Mi"
  cpu: "250m"
limits:
  memory: "2Gi"
  cpu: "1000m"

# Frontend resources
requests:
  memory: "128Mi"
  cpu: "100m"
limits:
  memory: "512Mi"
  cpu: "500m"
```

### Auto-scaling Configuration
- **HPA**: Scales pods based on CPU/memory usage
- **VPA**: Adjusts resource requests automatically
- **Cluster Autoscaler**: Adds nodes when needed

### Caching Strategy
- **Redis**: Session storage and API response caching
- **CDN**: Static asset delivery optimization
- **Database**: Connection pooling and query optimization

## Maintenance

### Regular Tasks
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly disaster recovery testing
- [ ] Bi-annual security audits

### Backup Procedures
```bash
# Database backup
kubectl exec statefulset/oms-postgres -n oms-staging-v2 -- pg_dump -U $DB_USERNAME $DB_NAME > backup.sql

# Configuration backup
kubectl get all -n oms-staging-v2 -o yaml > k8s-backup.yaml
```

### Update Procedures
1. Test changes in development environment
2. Update container images
3. Apply Kubernetes manifests
4. Run E2E test suite
5. Monitor application health
6. Notify stakeholders of completion

## Support

### Documentation
- [Architecture Overview](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [API Reference](./api-reference.md)
- [Getting Started](./getting-started.md)

### Contact Information
- **DevOps Team**: #devops Slack channel
- **On-call Engineer**: Check PagerDuty rotation
- **Development Team**: #development Slack channel
- **Security Team**: security@ordermysaddle.com

### Emergency Contacts
- **Production Issues**: Call PagerDuty escalation
- **Security Incidents**: security-incident@ordermysaddle.com
- **Infrastructure Issues**: infrastructure@ordermysaddle.com

---

## Quick Reference

### Essential Commands
```bash
# Deploy to staging
git push origin main

# Check deployment status
kubectl get pods -n oms-staging-v2

# View application logs
kubectl logs -f deployment/oms-backend -n oms-staging-v2

# Rollback deployment
kubectl rollout undo deployment/oms-backend -n oms-staging-v2

# Run E2E tests
cd e2e && npx playwright test --config=staging-v2.config.ts

# Health check
curl https://api-staging-v2.ordermysaddle.com/health
```

### Key URLs
- **Frontend**: https://staging-v2.ordermysaddle.com
- **API**: https://api-staging-v2.ordermysaddle.com
- **Docs**: https://api-staging-v2.ordermysaddle.com/docs
- **Health**: https://api-staging-v2.ordermysaddle.com/health
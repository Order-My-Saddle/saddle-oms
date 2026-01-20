r# GitHub Workflows for OMS Deployment

This directory contains CI/CD workflows for automated deployment of the Order Management System (OMS).

## Workflows

### `staging-deployment.yml`
Automated deployment to the `oms-staging-v2` Kubernetes namespace.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests with `deploy-staging-v2` label
- Manual workflow dispatch

**Pipeline Steps:**
1. **Security Scan** - Trivy vulnerability scanning
2. **Backend Build** - Lint, test, build, and push Docker image
3. **Frontend Build** - Lint, test, build, and push Docker image
4. **Deploy to Staging** - Deploy to Kubernetes with secrets management
5. **E2E Tests** - Run Playwright tests against deployed environment
6. **Notifications** - Slack alerts on success/failure

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Database Configuration
- `DB_USERNAME` - PostgreSQL username for staging
- `DB_PASSWORD` - PostgreSQL password for staging
- `DB_HOST` - PostgreSQL host address
- `DB_NAME` - Database name for staging

### Application Secrets
- `JWT_SECRET_KEY` - JWT signing secret
- `ENCRYPTION_SECRET` - Application encryption key
- `REDIS_HOST` - Redis server host
- `REDIS_PASSWORD` - Redis authentication password

### Infrastructure
- `DIGITALOCEAN_ACCESS_TOKEN` - DigitalOcean API token for K8s access

### Testing
- `TEST_USER_EMAIL` - Test user email for E2E tests
- `TEST_USER_PASSWORD` - Test user password for E2E tests

### Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook for deployment notifications

## Usage

### Automatic Deployment
Push to `main` or `develop` branch to trigger automatic deployment.

### Manual Deployment
1. Go to GitHub Actions tab
2. Select "Deploy to Staging V2" workflow
3. Click "Run workflow"
4. Choose environment and options

### PR-based Deployment
Add the `deploy-staging-v2` label to any PR to trigger deployment.

## Security Features

- **Vulnerability scanning** with Trivy
- **SARIF upload** for GitHub Security tab integration
- **Least-privilege secrets** management
- **Read-only root filesystem** in containers
- **Network policies** for traffic isolation
- **Resource limits** and security contexts

## Monitoring

After deployment, the workflow automatically:
- Verifies pod readiness
- Performs health checks on endpoints
- Runs comprehensive E2E test suite
- Sends notifications to Slack

## Rollback

To rollback a deployment:
```bash
kubectl rollout undo deployment/oms-backend -n oms-staging-v2
kubectl rollout undo deployment/oms-frontend -n oms-staging-v2
```

## Debugging

View deployment logs:
```bash
kubectl logs -f deployment/oms-backend -n oms-staging-v2
kubectl describe pod -l app=oms-backend -n oms-staging-v2
```

Check service status:
```bash
kubectl get all -n oms-staging-v2
kubectl get ingress -n oms-staging-v2
```
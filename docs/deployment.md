# Deployment Guide

This comprehensive guide covers all aspects of deploying the Order Management System (OMS) to production environments, including infrastructure setup, CI/CD pipelines, and operational procedures.

## 🚀 Deployment Overview

The OMS supports multiple deployment strategies across different environments:

```
Local Development → Staging → Production
     ↓              ↓          ↓
   Docker      Kubernetes  Kubernetes
  Compose      (DigitalOcean) (DigitalOcean)
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Production Environment                      │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer (DigitalOcean)                                  │
│           ↓                                                     │
│  Nginx Ingress Controller                                       │
│           ↓                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Frontend      │    │   Backend API   │                    │
│  │   (Next.js)     │    │   (NestJS)      │                    │
│  │   Replicas: 2   │    │   Replicas: 3   │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           ↓                       ↓                             │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Redis Cache   │    │   PostgreSQL    │                    │
│  │   Replicas: 1   │    │  (Managed DB)   │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Infrastructure Requirements

### Minimum System Requirements

**Production Environment**
- **CPU**: 8 cores (distributed across services)
- **RAM**: 16 GB total
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps
- **Kubernetes**: 1.24+

**Per Service Requirements**
```yaml
# Backend API
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

# Frontend
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Redis
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"
```

### Cloud Provider Setup (DigitalOcean)

**1. Create Kubernetes Cluster**
```bash
# Using doctl (DigitalOcean CLI)
doctl kubernetes cluster create oms-production \
  --region ams3 \
  --version 1.28.2-do.0 \
  --node-pool "name=worker-pool;size=s-4vcpu-8gb;count=3;auto-scale=true;min-nodes=2;max-nodes=5"

# Get cluster credentials
doctl kubernetes cluster kubeconfig save oms-production
```

**2. Create Managed Database**
```bash
# PostgreSQL cluster
doctl databases create oms-postgres-prod \
  --engine postgres \
  --version 14 \
  --region ams3 \
  --size db-s-2vcpu-4gb \
  --num-nodes 1

# Get connection details
doctl databases connection oms-postgres-prod --format URL
```

**3. Create Load Balancer**
```bash
# Load balancer is created automatically by Kubernetes Ingress
# Configure in ingress.yaml
```

## 🐳 Container Images

### Docker Image Building

**Backend Dockerfile (Multi-stage)**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Security: Create non-root user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile (Next.js)**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Image Registry

**GitHub Container Registry**
```bash
# Build and push images
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Backend
docker build -t ghcr.io/order-my-saddle/oms-backend:latest ./backend
docker push ghcr.io/order-my-saddle/oms-backend:latest

# Frontend
docker build -t ghcr.io/order-my-saddle/oms-frontend:latest ./frontend
docker push ghcr.io/order-my-saddle/oms-frontend:latest
```

## ☸️ Kubernetes Deployment

### Namespace Setup

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: oms-production
  labels:
    name: oms-production
    environment: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: oms-staging
  labels:
    name: oms-staging
    environment: staging
```

### ConfigMaps and Secrets

**ConfigMap**
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: oms-config
  namespace: oms-production
data:
  NODE_ENV: "production"
  API_URL: "https://api.ordermysaddle.com"
  FRONTEND_URL: "https://ordermysaddle.com"
  REDIS_HOST: "oms-redis-service"
  REDIS_PORT: "6379"
  LOG_LEVEL: "error"
  CORS_ORIGIN: "https://ordermysaddle.com"
```

**Secrets**
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: oms-secrets
  namespace: oms-production
type: Opaque
data:
  database-url: <base64-encoded-postgresql-url>
  jwt-secret: <base64-encoded-jwt-secret>
  redis-password: <base64-encoded-redis-password>
  smtp-password: <base64-encoded-smtp-password>
```

### Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oms-backend
  namespace: oms-production
  labels:
    app: oms-backend
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  selector:
    matchLabels:
      app: oms-backend
  template:
    metadata:
      labels:
        app: oms-backend
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: api
        image: ghcr.io/order-my-saddle/oms-backend:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3001
          protocol: TCP
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: oms-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: oms-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: oms-secrets
              key: jwt-secret
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: oms-config
              key: REDIS_HOST
        - name: REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: oms-config
              key: REDIS_PORT
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
      imagePullSecrets:
      - name: ghcr-login-secret
---
apiVersion: v1
kind: Service
metadata:
  name: oms-backend-service
  namespace: oms-production
  labels:
    app: oms-backend
spec:
  selector:
    app: oms-backend
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: http
  type: ClusterIP
```

### Frontend Deployment

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oms-frontend
  namespace: oms-production
  labels:
    app: oms-frontend
    version: v1.0.0
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: oms-frontend
  template:
    metadata:
      labels:
        app: oms-frontend
        version: v1.0.0
    spec:
      containers:
      - name: frontend
        image: ghcr.io/order-my-saddle/oms-frontend:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: oms-config
              key: API_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: ghcr-login-secret
---
apiVersion: v1
kind: Service
metadata:
  name: oms-frontend-service
  namespace: oms-production
spec:
  selector:
    app: oms-frontend
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: http
  type: ClusterIP
```

### Redis Deployment

```yaml
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oms-redis
  namespace: oms-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: oms-redis
  template:
    metadata:
      labels:
        app: oms-redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --appendonly yes
        - --requirepass $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: oms-secrets
              key: redis-password
        volumeMounts:
        - name: redis-data
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: oms-production
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: do-block-storage
---
apiVersion: v1
kind: Service
metadata:
  name: oms-redis-service
  namespace: oms-production
spec:
  selector:
    app: oms-redis
  ports:
  - port: 6379
    targetPort: 6379
  type: ClusterIP
```

### Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: oms-ingress
  namespace: oms-production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - ordermysaddle.com
    - www.ordermysaddle.com
    - api.ordermysaddle.com
    secretName: oms-tls
  rules:
  # Frontend
  - host: ordermysaddle.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: oms-frontend-service
            port:
              number: 80
  - host: www.ordermysaddle.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: oms-frontend-service
            port:
              number: 80
  # Backend API
  - host: api.ordermysaddle.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: oms-backend-service
            port:
              number: 80
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_BACKEND: order-my-saddle/oms-backend
  IMAGE_NAME_FRONTEND: order-my-saddle/oms-frontend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json

    # Backend tests
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci

    - name: Run backend tests
      run: |
        cd backend
        npm run test:cov
        npm run test:e2e

    # Frontend tests
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci

    - name: Run frontend tests
      run: |
        cd frontend
        npm run test
        npm run build

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      backend-image: ${{ steps.backend-meta.outputs.tags }}
      frontend-image: ${{ steps.frontend-meta.outputs.tags }}

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    # Backend image
    - name: Extract backend metadata
      id: backend-meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push backend image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ steps.backend-meta.outputs.tags }}
        labels: ${{ steps.backend-meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    # Frontend image
    - name: Extract frontend metadata
      id: frontend-meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_FRONTEND }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: ${{ steps.frontend-meta.outputs.tags }}
        labels: ${{ steps.frontend-meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://ordermysaddle.com

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_DATA }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl config current-context

    - name: Deploy to Kubernetes
      run: |
        export KUBECONFIG=kubeconfig

        # Update backend image
        kubectl set image deployment/oms-backend \
          api=${{ needs.build-and-push.outputs.backend-image }} \
          -n oms-production

        # Update frontend image
        kubectl set image deployment/oms-frontend \
          frontend=${{ needs.build-and-push.outputs.frontend-image }} \
          -n oms-production

        # Wait for rollout to complete
        kubectl rollout status deployment/oms-backend -n oms-production --timeout=300s
        kubectl rollout status deployment/oms-frontend -n oms-production --timeout=300s

    - name: Verify deployment
      run: |
        export KUBECONFIG=kubeconfig

        # Check pod status
        kubectl get pods -n oms-production

        # Check service endpoints
        kubectl get endpoints -n oms-production

        # Basic health check
        kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
          -- curl -f http://oms-backend-service.oms-production.svc.cluster.local/health

    - name: Run smoke tests
      run: |
        # Wait for services to be ready
        sleep 30

        # Test API endpoint
        curl -f https://api.ordermysaddle.com/health

        # Test frontend
        curl -f https://ordermysaddle.com/api/health

    - name: Notify deployment status
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Staging Deployment

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop, staging]
  pull_request:
    branches: [main]

# Similar workflow but targeting staging environment
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.ordermysaddle.com

    steps:
    # Similar steps but with staging namespace and URLs
    - name: Deploy to staging
      run: |
        kubectl set image deployment/oms-backend \
          api=${{ needs.build-and-push.outputs.backend-image }} \
          -n oms-staging
```

## 🔧 Database Migrations

### Production Migration Strategy

```bash
# Create migration job
kubectl create job migrate-$(date +%s) \
  --from=cronjob/oms-migrate \
  -n oms-production

# Monitor migration
kubectl logs job/migrate-$(date +%s) -n oms-production -f

# Rollback if needed
kubectl create job rollback-$(date +%s) \
  --from=cronjob/oms-rollback \
  -n oms-production
```

**Migration CronJob**
```yaml
# migration-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: oms-migrate
  namespace: oms-production
spec:
  schedule: "0 0 * * *"  # Daily at midnight (disabled by default)
  suspend: true  # Manually trigger only
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: migrate
            image: ghcr.io/order-my-saddle/oms-backend:latest
            command:
            - /bin/sh
            - -c
            - |
              echo "Starting database migration..."
              npm run migration:run
              echo "Migration completed successfully"
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: oms-secrets
                  key: database-url
          restartPolicy: OnFailure
      backoffLimit: 3
```

## 📊 Monitoring & Logging

### Prometheus Monitoring

```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s

    scrape_configs:
    - job_name: 'oms-backend'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - oms-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: oms-backend-service
      - source_labels: [__meta_kubernetes_endpoint_port_name]
        action: keep
        regex: http

    - job_name: 'oms-frontend'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - oms-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: oms-frontend-service
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "OMS Production Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Order Creation Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "increase(orders_created_total[1h])",
            "legendFormat": "Orders/hour"
          }
        ]
      }
    ]
  }
}
```

### Log Aggregation

```yaml
# logging/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*oms-backend*.log
      pos_file /var/log/fluentd-oms-backend.log.pos
      tag kubernetes.oms.backend
      format json
    </source>

    <source>
      @type tail
      path /var/log/containers/*oms-frontend*.log
      pos_file /var/log/fluentd-oms-frontend.log.pos
      tag kubernetes.oms.frontend
      format json
    </source>

    <match kubernetes.oms.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name oms-logs
    </match>
```

## 🔒 Security Hardening

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: oms-backend-netpol
  namespace: oms-production
spec:
  podSelector:
    matchLabels:
      app: oms-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: oms-frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: oms-redis
    ports:
    - protocol: TCP
      port: 6379
  - to: []  # Allow external database access
    ports:
    - protocol: TCP
      port: 5432
```

### Pod Security Standards

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: oms-restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 🔄 Backup & Recovery

### Database Backups

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: oms-db-backup
  namespace: oms-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14-alpine
            command:
            - /bin/sh
            - -c
            - |
              BACKUP_FILE="/backup/oms-backup-$(date +%Y%m%d-%H%M%S).sql"
              pg_dump $DATABASE_URL > $BACKUP_FILE
              gzip $BACKUP_FILE

              # Upload to object storage
              aws s3 cp ${BACKUP_FILE}.gz s3://oms-backups/daily/

              # Cleanup old local files
              find /backup -name "*.sql.gz" -mtime +7 -delete
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: oms-secrets
                  key: database-url
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: backup-secrets
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: backup-secrets
                  key: secret-access-key
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### Disaster Recovery Procedures

**1. Full System Recovery**
```bash
# Restore from backup
kubectl apply -f kubernetes/
kubectl wait --for=condition=available --timeout=300s deployment --all -n oms-production

# Restore database
kubectl run pg-restore --image=postgres:14-alpine --rm -i --restart=Never \
  --command -- psql $DATABASE_URL -f /backup/latest.sql
```

**2. Rolling Back Deployments**
```bash
# Rollback to previous version
kubectl rollout undo deployment/oms-backend -n oms-production
kubectl rollout undo deployment/oms-frontend -n oms-production

# Check rollout status
kubectl rollout status deployment/oms-backend -n oms-production
```

## 📋 Deployment Checklist

### Pre-Deployment Checklist

**Code Quality**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed and approved
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Performance benchmarks within acceptable limits
- [ ] Database migrations tested in staging

**Infrastructure**
- [ ] Kubernetes cluster health verified
- [ ] Resource quotas and limits configured
- [ ] Network policies applied
- [ ] SSL certificates valid and updated
- [ ] DNS records configured correctly

**Security**
- [ ] Secrets rotated and updated
- [ ] Image vulnerability scan passed
- [ ] Network security groups configured
- [ ] Backup systems operational
- [ ] Monitoring and alerting configured

### Post-Deployment Checklist

**Verification**
- [ ] All pods running and healthy
- [ ] Health checks passing
- [ ] Application endpoints responding
- [ ] Database connections working
- [ ] Cache connections working

**Monitoring**
- [ ] Application metrics flowing to monitoring system
- [ ] Error rates within normal parameters
- [ ] Response times meeting SLA requirements
- [ ] Resource usage within expected ranges
- [ ] Backup jobs completed successfully

**Business Validation**
- [ ] Core user workflows tested
- [ ] Admin functions verified
- [ ] Payment processing working
- [ ] Email notifications sending
- [ ] Search functionality working

## 🚨 Troubleshooting

### Common Deployment Issues

**Pod Startup Failures**
```bash
# Check pod status and events
kubectl get pods -n oms-production
kubectl describe pod <pod-name> -n oms-production

# Check logs
kubectl logs <pod-name> -n oms-production
kubectl logs <pod-name> -n oms-production --previous

# Check resource constraints
kubectl top pods -n oms-production
```

**Service Connectivity Issues**
```bash
# Test service endpoints
kubectl run debug --image=busybox --rm -i --restart=Never \
  -- nslookup oms-backend-service.oms-production.svc.cluster.local

# Test connectivity
kubectl run curl --image=curlimages/curl --rm -i --restart=Never \
  -- curl -v http://oms-backend-service.oms-production.svc.cluster.local/health
```

**Database Connection Problems**
```bash
# Test database connectivity
kubectl run pg-client --image=postgres:14-alpine --rm -i --restart=Never \
  -- psql $DATABASE_URL -c "SELECT 1;"

# Check connection pools
kubectl logs deployment/oms-backend -n oms-production | grep -i "database\|pool"
```

### Performance Issues

**High CPU Usage**
```bash
# Check resource usage
kubectl top pods -n oms-production

# Adjust resource limits
kubectl patch deployment oms-backend -n oms-production -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"cpu":"2000m"}}}]}}}}'
```

**Memory Leaks**
```bash
# Monitor memory usage over time
kubectl top pods -n oms-production --sort-by=memory

# Enable heap dumps for Node.js apps
kubectl patch deployment oms-backend -n oms-production -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"NODE_OPTIONS","value":"--max-old-space-size=1024 --heapdump-on-oom"}]}]}}}}'
```

### Rollback Procedures

**Emergency Rollback**
```bash
# Immediate rollback to previous version
kubectl rollout undo deployment/oms-backend -n oms-production
kubectl rollout undo deployment/oms-frontend -n oms-production

# Monitor rollback progress
kubectl rollout status deployment/oms-backend -n oms-production
```

**Database Rollback**
```bash
# Restore from backup (if schema changes were made)
kubectl create job db-restore-$(date +%s) --image=postgres:14-alpine \
  -- psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore from latest backup
kubectl run pg-restore --image=postgres:14-alpine --rm -i --restart=Never \
  -- psql $DATABASE_URL -f /backup/pre-deployment.sql
```

## ⚡ Next Steps

For operational excellence:

- **[Monitoring Setup](./monitoring.md)** - Detailed monitoring configuration
- **[Security Guidelines](./security.md)** - Production security best practices
- **[Performance Tuning](./performance.md)** - Optimization strategies
- **[Backup Procedures](./backup.md)** - Comprehensive backup strategies
- **[Incident Response](./incident-response.md)** - Emergency procedures

### Continuous Improvement

**Infrastructure as Code**
- Migrate to Terraform for infrastructure management
- Implement GitOps with ArgoCD for deployment automation
- Add automated testing for infrastructure changes

**Observability Enhancement**
- Implement distributed tracing with Jaeger
- Add business metrics and SLI/SLO monitoring
- Implement automated alerts and runbooks

**Security Hardening**
- Implement Pod Security Admission
- Add image scanning to CI/CD pipeline
- Regular security audits and penetration testing
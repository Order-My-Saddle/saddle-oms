# Deployment

This guide covers the deployment strategies, infrastructure setup, and production considerations for the OMS frontend application.

## 🚀 Deployment Overview

The OMS frontend supports multiple deployment strategies for different environments and requirements:

```
Development → Staging → Production
     ↓          ↓         ↓
Local Dev   → Testing  → Live System
Docker      → K8s      → K8s + CDN
```

### Deployment Targets

- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live production environment with optimizations
- **Preview**: Branch-based preview deployments

## 🏗️ Build Process

### Production Build

```bash
# Install dependencies
npm ci

# Run linting and tests
npm run lint
npm run test:coverage

# Type checking
npm run type-check

# Create production build
npm run build

# Start production server
npm start
```

### Build Optimization

The Next.js build process includes:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    turbo: {}, // Turbopack for faster builds
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    plugins: [require('@next/bundle-analyzer')({
      enabled: true,
    })],
  }),

  // Image optimization
  images: {
    domains: ['localhost', 'api.ordermysaddle.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_VERSION: process.env.npm_package_version,
  },
}

module.exports = nextConfig
```

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Performance audits
npm run lighthouse

# Check bundle for duplicates
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

## 🐳 Docker Deployment

### Multi-stage Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    image: ordermysaddle/oms-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/oms
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=oms
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## ☸️ Kubernetes Deployment

### Deployment Manifests

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: oms-frontend
  namespace: oms-production
  labels:
    app: oms-frontend
    version: v1.0.0
spec:
  replicas: 3
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
        image: ordermysaddle/oms-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: oms-config
              key: api-url
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
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
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
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: oms-frontend-ingress
  namespace: oms-production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - ordermysaddle.com
    - www.ordermysaddle.com
    secretName: oms-frontend-tls
  rules:
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
```

### ConfigMap for Environment Variables

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: oms-config
  namespace: oms-production
data:
  api-url: "https://api.ordermysaddle.com"
  app-name: "Order My Saddle"
  environment: "production"
  log-level: "error"
```

### Secrets Management

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: oms-secrets
  namespace: oms-production
type: Opaque
data:
  # Base64 encoded values
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  api-key: <base64-encoded-api-key>
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: order-my-saddle/oms-frontend

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

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

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

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'

    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig

    - name: Deploy to Kubernetes
      run: |
        export KUBECONFIG=kubeconfig

        # Update image tag
        kubectl set image deployment/oms-frontend \
          frontend=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          -n oms-production

        # Wait for rollout
        kubectl rollout status deployment/oms-frontend -n oms-production

    - name: Verify deployment
      run: |
        export KUBECONFIG=kubeconfig
        kubectl get pods -n oms-production -l app=oms-frontend
```

### Multi-Environment Pipeline

```yaml
# .github/workflows/multi-env-deploy.yml
name: Multi-Environment Deployment

on:
  push:
    branches:
      - main
      - staging
      - develop

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging

    steps:
    - name: Deploy to staging
      run: |
        # Deploy to staging environment
        helm upgrade --install oms-staging ./helm/oms \
          --namespace oms-staging \
          --values values-staging.yaml \
          --set image.tag=${{ github.sha }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
    - name: Deploy to production
      run: |
        # Deploy to production environment
        helm upgrade --install oms-production ./helm/oms \
          --namespace oms-production \
          --values values-production.yaml \
          --set image.tag=${{ github.sha }}
```

## 🌐 CDN & Edge Deployment

### Vercel Deployment

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.ordermysaddle.com/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.ordermysaddle.com"
  },
  "functions": {
    "app/api/health/route.js": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Cloudflare Deployment

```toml
# wrangler.toml
name = "oms-frontend"
main = "src/index.js"
compatibility_date = "2024-01-15"

[site]
bucket = ".next/static"
entry-point = "workers-site"

[env.production]
name = "oms-frontend-prod"
route = "ordermysaddle.com/*"

[env.staging]
name = "oms-frontend-staging"
route = "staging.ordermysaddle.com/*"
```

## 🔍 Monitoring & Observability

### Health Check Endpoints

```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
  }

  try {
    // Check backend connectivity
    const backendHealth = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      timeout: 5000,
    })

    healthCheck.backend = {
      status: backendHealth.ok ? 'ok' : 'error',
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    healthCheck.backend = {
      status: 'error',
      error: error.message,
    }
  }

  const status = healthCheck.backend?.status === 'ok' ? 200 : 503

  return NextResponse.json(healthCheck, { status })
}
```

### Application Metrics

```typescript
// utils/metrics.ts
export class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Map<string, number> = new Map()

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  incrementCounter(name: string, value = 1) {
    const current = this.metrics.get(name) || 0
    this.metrics.set(name, current + value)
  }

  recordTiming(name: string, duration: number) {
    this.metrics.set(`${name}_duration`, duration)
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  reset() {
    this.metrics.clear()
  }
}

// Usage in components
export const useMetrics = () => {
  const metrics = MetricsCollector.getInstance()

  const trackPageView = (page: string) => {
    metrics.incrementCounter(`page_view_${page}`)
  }

  const trackUserAction = (action: string) => {
    metrics.incrementCounter(`user_action_${action}`)
  }

  const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
    metrics.incrementCounter(`api_call_${endpoint}`)
    metrics.recordTiming(`api_call_${endpoint}`, duration)
    metrics.incrementCounter(`api_call_${endpoint}_${success ? 'success' : 'error'}`)
  }

  return {
    trackPageView,
    trackUserAction,
    trackApiCall,
  }
}
```

### Error Tracking

```typescript
// utils/errorTracking.ts
export class ErrorTracker {
  static captureException(error: Error, context?: Record<string, any>) {
    console.error('Error captured:', error, context)

    // Send to monitoring service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Implement actual error tracking service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error)
    }
  }

  static captureMessage(message: string, level = 'info', context?: Record<string, any>) {
    console.log(`[${level.toUpperCase()}] ${message}`, context)

    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // Send to monitoring service
    }
  }
}
```

## 🔒 Security Considerations

### Environment Variables Security

```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.ordermysaddle.com
NEXT_PUBLIC_APP_NAME="Order My Saddle"

# Secrets (stored in secure secret management)
DATABASE_URL=postgresql://...
JWT_SECRET=...
API_KEY=...

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.ordermysaddle.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' *.ordermysaddle.com wss:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 🚀 Performance Optimization

### Static Generation

```typescript
// app/orders/[id]/page.tsx
export async function generateStaticParams() {
  // Generate static pages for frequently accessed orders
  const orders = await fetchPopularOrders()

  return orders.map((order) => ({
    id: order.id,
  }))
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await fetchOrder(params.id)

  return <OrderDetails order={order} />
}
```

### Image Optimization

```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'

export const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    {...props}
  />
)
```

### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      }
    }

    return config
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react'],
  },
}
```

## 📋 Deployment Checklist

### Pre-Deployment ✅
- [ ] All tests passing
- [ ] Linting clean
- [ ] Type checking successful
- [ ] Bundle analysis reviewed
- [ ] Performance audit completed
- [ ] Security scan passed
- [ ] Environment variables configured
- [ ] Database migrations ready

### Deployment ✅
- [ ] Build successful
- [ ] Image pushed to registry
- [ ] Infrastructure provisioned
- [ ] Application deployed
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] Load balancer configured

### Post-Deployment ✅
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Performance metrics baseline
- [ ] Error tracking active
- [ ] Backup strategy verified
- [ ] Rollback plan tested
- [ ] Documentation updated

## 🔧 Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Memory Issues**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max_old_space_size=4096" npm run build
```

**Environment Variables**
```bash
# Check environment variables
npm run env:check

# Debug environment
NODE_ENV=development npm run debug
```

### Rollback Strategy

```bash
# Kubernetes rollback
kubectl rollout undo deployment/oms-frontend -n oms-production

# Docker rollback
docker-compose up -d --scale frontend=3 frontend:previous-tag

# Vercel rollback
vercel --prod --yes --token $VERCEL_TOKEN rollback
```

## ⚡ Next Steps

For production operations:

- **[Monitoring Setup](./monitoring.md)** - Application monitoring and alerting
- **[Performance Optimization](./performance.md)** - Production performance tuning
- **[Security Guidelines](./security.md)** - Production security best practices
- **[Architecture](./architecture.md)** - Understanding the system architecture
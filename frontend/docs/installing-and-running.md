# Installing and Running

This guide will help you set up the OMS frontend development environment and get the application running locally.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn 1.22+)
- **Git**: Latest version for repository management
- **VSCode**: Recommended IDE with extension recommendations

### Operating System Support
- **macOS**: 10.15 (Catalina) or later
- **Windows**: 10 version 1903 or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone git@github-iam-dev:Order-My-Saddle/saddle-oms.git
cd saddle-oms/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15 with React 19
- TypeScript and type definitions
- Tailwind CSS and UI components
- Development tools and linters

### 3. Environment Setup

Copy the environment template and configure for local development:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development

# Optional: Enable debugging
NEXT_PUBLIC_DEBUG=true
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

### Core Commands

```bash
# Start development server with Turbopack (fast refresh)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Type checking
npm run type-check
```

### Backend Integration

The frontend requires the NestJS backend to be running. There are two options:

#### Option 1: Local NestJS Backend (Recommended)

```bash
# In a separate terminal, start the backend
cd ../backend
npm install
npm run start:dev
```

The backend will run at [http://localhost:3001](http://localhost:3001)

#### Option 2: Legacy PHP Backend

```bash
# Start the full stack with Docker
cd ..
docker-compose up
```

The PHP API will run at [http://localhost:8888](http://localhost:8888)

**Note**: Update `NEXT_PUBLIC_API_URL` in your `.env.local` to match your chosen backend.

## 🛠️ IDE Setup

### VSCode Configuration

Install recommended extensions:
- **ESLint**: Syntax and style checking
- **Prettier**: Code formatting
- **TypeScript Importer**: Auto import management
- **Tailwind CSS IntelliSense**: CSS class suggestions
- **Auto Rename Tag**: HTML/JSX tag synchronization

### VSCode Settings

Add to your `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "javascript": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^)]*)\\)",
    "[\"'`]([^\"'`]*).*?[\"'`]",
    "cn\\(([^)]*)\\)"
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

#### Node Version Issues

```bash
# Check your Node.js version
node --version

# Use nvm to install correct version
nvm install 18
nvm use 18
```

#### Dependency Conflicts

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Check for TypeScript errors
npm run type-check

# Restart TypeScript service in VSCode
# Command Palette -> "TypeScript: Restart TS Server"
```

### Environment Issues

#### API Connection Problems

1. **Check API URL**: Verify `NEXT_PUBLIC_API_URL` in `.env.local`
2. **Backend Status**: Ensure backend is running and accessible
3. **CORS Issues**: Check backend CORS configuration
4. **Network Logs**: Use browser DevTools to inspect network requests

#### Authentication Issues

1. **Clear Storage**: Clear localStorage and sessionStorage
2. **Token Expiry**: Check if JWT tokens have expired
3. **Role Permissions**: Verify user has correct role assignments

## 📦 Build Process

### Development Build

```bash
# Fast development build with Turbopack
npm run dev
```

Features:
- Hot module replacement
- Source maps for debugging
- Unoptimized bundles for faster compilation

### Production Build

```bash
# Optimized production build
npm run build

# Analyze bundle size
npm run build:analyze

# Start production server
npm start
```

Features:
- Code splitting and tree shaking
- Minified and optimized assets
- Static generation for improved performance

### Build Optimization

Check build performance:

```bash
# Bundle analyzer
npm run build:analyze

# Lighthouse CI (if configured)
npm run lighthouse

# Performance monitoring
npm run perf
```

## 🔒 Security Setup

### Environment Variables

Never commit sensitive data. Use `.env.local` for secrets:

```env
# ❌ Don't commit these
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key

# ✅ OK to commit (public variables)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=OMS Frontend
```

### HTTPS in Development

For testing authentication and secure features:

```bash
# Generate local SSL certificates
npm run dev:https

# Or use mkcert
mkcert localhost
npm run dev -- --experimental-https
```

## 🚀 Docker Development

### Using Docker Compose

```bash
# Start full development stack
docker-compose -f docker-compose.dev.yml up

# Frontend only
docker-compose -f docker-compose.dev.yml up frontend
```

### Custom Docker Setup

```dockerfile
# Dockerfile.dev
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## 🔧 Advanced Configuration

### Custom Webpack Config

Modify `next.config.js` for advanced webpack configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable Turbopack
    turbo: {},
  },
  // Custom webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom configurations here
    return config;
  },
};

module.exports = nextConfig;
```

### Path Aliases

Already configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

## 📱 Mobile Development

### Testing on Mobile Devices

```bash
# Get your local IP address
npm run dev:mobile

# Or manually start with host binding
npm run dev -- --hostname 0.0.0.0
```

Access from mobile device: `http://YOUR_IP:3000`

### Responsive Testing

Use browser DevTools device simulation or:

```bash
# Install additional mobile testing tools
npm install -g browser-sync
browser-sync start --server --files "**/*" --startPath "/"
```

## 🔍 Debugging

### Browser DevTools

Essential debugging techniques:
- **React DevTools**: Component inspection
- **Redux DevTools**: State management debugging (if used)
- **Network Tab**: API request monitoring
- **Console Logs**: Application error tracking

### Server-Side Debugging

```bash
# Enable Node.js debugging
NODE_OPTIONS='--inspect' npm run dev

# Debug with specific port
NODE_OPTIONS='--inspect=9229' npm run dev
```

Connect debugger in Chrome: `chrome://inspect`

## 📈 Performance Monitoring

### Development Performance

```bash
# Bundle analyzer
npm run build:analyze

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Performance profiling
npm run dev:profile
```

### Production Monitoring

Consider implementing:
- **Error tracking** (Sentry, Bugsnag)
- **Performance monitoring** (New Relic, DataDog)
- **User analytics** (Google Analytics, Mixpanel)

## ⚡ Next Steps

Once you have the application running:

1. **[Architecture](./architecture.md)** - Understand the codebase structure
2. **[Authentication](./auth.md)** - Learn the authentication flow
3. **[Components](./components.md)** - Explore the component system
4. **[API Integration](./api-integration.md)** - Understand backend integration

For development best practices, see the main [CLAUDE.md](../CLAUDE.md) file.
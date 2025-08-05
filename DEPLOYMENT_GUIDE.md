# 🚀 Production Deployment Guide - Skill Mapping Backend

## 📋 Your Original Commands Analysis

### ❌ **Issues Found:**
```bash
npm i                        # ❌ Should use npm ci --only=production
npm run build               # ✅ Correct
npx prisma generate         # ✅ Correct
npx prisma migrate deploy   # ✅ Correct  
node ./dist/src/main.js     # ❌ Incorrect path (should be dist/src/main.js)
pm2 save                    # ⚠️  Should save after starting PM2 process
```

### ✅ **Improved Commands:**

## 🛠️ **Option 1: Quick Fix (Minimal Changes)**

Replace your commands with:
```bash
npm ci --only=production
npm run build
npx prisma generate
npx prisma migrate deploy
NODE_ENV=production pm2 start dist/src/main.js --name "skill-mapping-backend"
pm2 save
```

## 🚀 **Option 2: Enhanced Deployment Script**

Use the provided deployment script:
```bash
# Make executable (one time)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🔧 **Option 3: Package.json Scripts**

Use the new npm scripts:
```bash
# Full deployment
npm run deploy:full

# Quick deployment (dependencies already installed)
npm run deploy
```

## 📝 **Available Scripts**

The package.json now includes these deployment scripts:

```json
{
  "scripts": {
    "deploy": "npm run build && npm run prisma:migrate:deploy && npm run start:prod",
    "deploy:full": "npm ci --only=production && npm run build && npm run prisma:generate && npm run prisma:migrate:deploy && npm run start:prod",
    "start:prod": "node dist/src/main"
  }
}
```

## 🐳 **Docker Deployment**

If using Docker, your Dockerfile should include:
```dockerfile
# Production build
RUN npm ci --only=production
RUN npm run build
RUN npx prisma generate

# Start command
CMD ["node", "dist/src/main.js"]
```

## 🔄 **CI/CD Pipeline Example**

### GitHub Actions:
```yaml
name: Deploy Backend
on:
  push:
    branches: [main, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci --only=production
        
      - name: Build application
        run: npm run build
        
      - name: Generate Prisma client
        run: npx prisma generate
        
      - name: Deploy to server
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            cd /path/to/your/app
            git pull origin main
            npm ci --only=production
            npm run build
            npx prisma generate
            npx prisma migrate deploy
            pm2 restart skill-mapping-backend
            pm2 save
          EOF
```

## 🛡️ **Production Best Practices**

### 1. **Environment Variables**
```bash
# Set production environment
export NODE_ENV=production

# Database connection
export DATABASE_URL="mysql://user:password@localhost:3306/production_db"

# Other production configs
export JWT_SECRET="your-production-jwt-secret"
export PORT=3000
```

### 2. **PM2 Configuration**
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'skill-mapping-backend',
    script: 'dist/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Then use:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 3. **Health Checks**
```bash
# Check if app is running
curl -f http://localhost:3000/health || exit 1

# Check PM2 status
pm2 list | grep skill-mapping-backend
```

### 4. **Database Migration Safety**
```bash
# Check migration status before deploy
npx prisma migrate status

# Backup database before migration
mysqldump -u user -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npx prisma migrate deploy
```

## 🚨 **Troubleshooting**

### Common Issues:

**1. Build Path Error**
```bash
# ❌ Wrong
node ./dist/src/main.js

# ✅ Correct
node dist/src/main.js
```

**2. Missing Prisma Client**
```bash
# Always run after build
npx prisma generate
```

**3. Database Connection**
```bash
# Test database connection
npx prisma db pull
```

**4. PM2 Process Issues**
```bash
# Check logs
pm2 logs skill-mapping-backend

# Restart if needed
pm2 restart skill-mapping-backend

# Delete and recreate
pm2 delete skill-mapping-backend
pm2 start dist/src/main.js --name skill-mapping-backend
```

## 📊 **Deployment Checklist**

- [ ] ✅ Use `npm ci --only=production` instead of `npm i`
- [ ] ✅ Run `npm run build` to compile TypeScript
- [ ] ✅ Generate Prisma client with `npx prisma generate`
- [ ] ✅ Deploy database migrations with `npx prisma migrate deploy`
- [ ] ✅ Use correct path: `dist/src/main.js`
- [ ] ✅ Set `NODE_ENV=production`
- [ ] ✅ Start with PM2 for process management
- [ ] ✅ Save PM2 configuration
- [ ] ✅ Verify deployment with health checks

## 🎯 **Recommended Post-Deploy Hook**

**For your server post-deploy hook, use this improved version:**

```bash
#!/bin/bash
set -e

echo "🚀 Starting post-deploy process..."

# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Setup Prisma
npx prisma generate
npx prisma migrate deploy

# Start with PM2
pm2 start dist/src/main.js --name "skill-mapping-backend" --env production || pm2 restart skill-mapping-backend
pm2 save

echo "✅ Deployment completed successfully!"
```

This fixes all the issues in your original commands and adds proper error handling and production optimizations.

---

**Choose the option that best fits your deployment infrastructure!**

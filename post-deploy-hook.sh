#!/bin/bash

# Post-Deploy Hook for Skill Mapping Backend using PM2 to prevent port conflicts

set -euo pipefail

echo "🚀 Starting post-deploy process..."

# Step 1: Install production dependencies
echo "📦 Installing dependencies..."
# if [ -f "package-lock.json" ]; then
#   npm ci --only=production
# else
#   npm install --only=production
# fi
npm install

# Step 2: Build the application
echo "🔨 Building application..."
npm run build

# Step 3: Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Step 4: Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Step 5: Reload/Start with PM2 to avoid EADDRINUSE
echo "🚀 Starting application with PM2..."
if command -v pm2 >/dev/null 2>&1; then
  # Try reload, fallback to start if not online yet
  pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
  pm2 save || true
  echo "📋 PM2 status:"
  pm2 list
else
  echo "⚠️ PM2 not found, starting node directly (may cause port conflicts)"
  NODE_ENV=production node dist/src/main.js &
fi

echo "✅ Post-deploy process completed successfully!"

#!/bin/bash

# Simple Post-Deploy Hook for Skill Mapping Backend
# This is a simplified version for server post-deploy hooks

set -e # Exit on any error

echo "🚀 Starting post-deploy process..."

# Step 1: Install production dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Step 2: Build the application
echo "🔨 Building application..."
npm run build

# Step 3: Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Step 4: Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Step 5: Start the application
echo "🚀 Starting application..."
NODE_ENV=production node dist/src/main.js &

# Step 6: Save PM2 configuration (if PM2 is used)
if command -v pm2 >/dev/null 2>&1; then
    echo "💾 Saving PM2 configuration..."
    pm2 save
fi

echo "✅ Post-deploy process completed successfully!"

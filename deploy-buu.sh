#!/bin/bash

set -e

APP_NAME="skill-mapping-backend"
IMAGE_NAME="skill-mapping-builder"

BUU_HOST="10.80.7.179"
BUU_USER="developer"
BUU_REMOTE_PATH="/home/developer/skill-mapping-backend"
BUU_PORT="22"

# Optional: Use custom SSH key
SSH_KEY_OPTION=""
# SSH_KEY_OPTION="-i ~/.ssh/id_rsa"

# === 1. Build Docker Image ===
echo "[1/5] 🔧 Building Docker image..."
docker build -t $IMAGE_NAME .

# === 2. Create Container and Extract Runtime Files ===
echo "[2/5] 📦 Exporting runtime files from container..."
CID=$(docker create $IMAGE_NAME)
rm -rf ./deploy-temp
mkdir -p ./deploy-temp
docker cp "$CID:/usr/src/app" ./deploy-temp
docker rm $CID

# === 3. Package for Transfer ===
echo "[3/5] 📦 Creating deployment package..."
cd deploy-temp
tar -czf ../$APP_NAME.tar.gz .
cd ..
rm -rf ./deploy-temp

# === 4. Transfer to Server ===
echo "[4/5] 🚀 Transferring to server..."
scp -P $BUU_PORT $SSH_KEY_OPTION $APP_NAME.tar.gz "$BUU_USER@$BUU_HOST:$BUU_REMOTE_PATH/"
ssh -p $BUU_PORT $SSH_KEY_OPTION "$BUU_USER@$BUU_HOST" "cd $BUU_REMOTE_PATH && tar -xzf $APP_NAME.tar.gz && rm $APP_NAME.tar.gz"

# === 5. Done ===
echo "[5/5] ✅ Deployment complete. App is ready on server."

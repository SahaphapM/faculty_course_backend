#!/bin/bash
set -e

APP_NAME="skill-mapping-backend"
IMAGE_NAME="skill-mapping-builder"

BUU_HOST="10.80.7.179"
BUU_USER="developer"
BUU_REMOTE_PATH="/home/developer/skill-mapping-backend"
BUU_PORT="22"

SSH_KEY_OPTION=""
# SSH_KEY_OPTION="-i ~/.ssh/id_rsa"

echo "[1/3] 🔧 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "[2/3] 📦 Streaming build output directly to server..."
CID=$(docker create $IMAGE_NAME)

# Stream /usr/src/app directly from container to server
docker cp "$CID":/usr/src/app - | \
ssh -p $BUU_PORT $SSH_KEY_OPTION "$BUU_USER@$BUU_HOST" \
"rm -rf $BUU_REMOTE_PATH && mkdir -p $BUU_REMOTE_PATH && tar -x -C $BUU_REMOTE_PATH"

docker rm "$CID" > /dev/null

echo "[3/3] ✅ Deployment complete."

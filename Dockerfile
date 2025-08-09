FROM ubuntu:24.04

# Install Node.js 22
RUN apt-get update && apt-get install -y curl python3 make g++ \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y nodejs

WORKDIR /usr/src/app

# Copy package files first for caching
# COPY package.json yarn.lock ./
COPY package.json ./
# RUN corepack enable && yarn install
RUN npm install

# Copy the rest of the source
COPY . .

RUN npx prisma generate && npm run build

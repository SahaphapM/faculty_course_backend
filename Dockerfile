# ---- Builder Stage ----
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Enable corepack & activate yarn 4.9.2
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install

COPY . .

RUN yarn prisma generate
RUN yarn build

# ---- Runtime Stage ----
FROM node:22-alpine

WORKDIR /usr/src/app

# Enable corepack & activate yarn 4.9.2
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

COPY package.json yarn.lock ./
RUN yarn workspaces focus

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

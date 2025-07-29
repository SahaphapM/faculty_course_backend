#!/bin/bash
npm i
npm run build
npx prisma generate
npx prisma migrate deploy
node ./dist/src/main.js
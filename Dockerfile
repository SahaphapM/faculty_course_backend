FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY package-lock.json ./

RUN npm install

EXPOSE 3000

COPY . .

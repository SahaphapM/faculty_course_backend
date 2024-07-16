FROM node:20

WORKDIR /usr/src/app

COPY package.json ./

COPY package-lock.json ./

RUN npm install

EXPOSE 3000

COPY . .

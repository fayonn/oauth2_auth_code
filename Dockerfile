FROM node:16
LABEL authors="Sviatoslav"

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json ./
COPY nest-cli.json ./
COPY .eslintrc.js .prettierrc ./

RUN npm install

COPY envs ./envs
COPY src ./src
COPY test ./test

COPY public ./public
COPY views ./views

RUN npm run build
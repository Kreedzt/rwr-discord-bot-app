# build
FROM node:18.12.1 as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npx pnpm i

COPY ./ ./

RUN npm run build:dev

# run
FROM node:18.12.1-alpine

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npx pnpm i --production

COPY --from=builder /app/dist /app/dist

CMD ["node", "/app/dist/index.js"]
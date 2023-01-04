# build
FROM node:18.12.1 as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npx pnpm i

COPY ./ ./

RUN npm run build:dev

# run
FROM node:18.12.1

WORKDIR /app

COPY --from=builder /app/dist /dist

CMD ["node", "/app/dist/index.js"]
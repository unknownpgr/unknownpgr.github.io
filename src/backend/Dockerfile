FROM node:18 AS builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80
CMD ["node", "dist/main.js"]
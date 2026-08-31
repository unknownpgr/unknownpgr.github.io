# Build the static-site generator. The deploy script runs this image with the
# source posts and generated public directory mounted from the host.
FROM node:18 AS builder
WORKDIR /app/src/builder

# Install dependencies (incl. dev deps needed for the TypeScript build)
COPY src/builder/package.json src/builder/yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the generator
COPY src/builder/ ./
RUN yarn build

CMD ["node", "dist/main.js"]

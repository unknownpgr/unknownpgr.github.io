# ---- Stage 1: generate the static site ----
FROM node:18 AS builder
WORKDIR /app/src/builder

# Install dependencies (incl. dev deps needed for the TypeScript build)
COPY src/builder/package.json src/builder/yarn.lock ./
RUN yarn install --frozen-lockfile

# Build the generator
COPY src/builder/ ./
RUN yarn build

# Bring in the posts and generate the static site.
# main.ts resolves postPath="../../posts" and outputDir="../../static"
# relative to this working directory, i.e. /app/posts and /app/static.
COPY posts /app/posts
RUN node dist/main.js

# ---- Stage 2: serve the static site ----
FROM nginx:alpine
COPY --from=builder /app/static /usr/share/nginx/html

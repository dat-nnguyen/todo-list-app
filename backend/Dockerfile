FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY migrations ./migrations
COPY src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]

# why book worm slim?
# multi-stage build?

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
# Generate Prisma client for the target platform
RUN npx prisma generate

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security (OWASP A05 – Security Misconfiguration)
RUN addgroup --system --gid 1001 nestjs \
 && adduser  --system --uid 1001 nestjs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nestjs:nestjs /app/dist            ./dist
COPY --from=builder --chown=nestjs:nestjs /app/prisma          ./prisma
# Copy pre-generated Prisma client (avoids re-generation at runtime)
COPY --from=builder --chown=nestjs:nestjs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3000

# ECS health check – relies on GET / returning 200 (AppController)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "dist/main"]

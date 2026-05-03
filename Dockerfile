# ─── Stage 1: Build ──────────────────────────────────────────────────────────
# node_modules is copied from the host (pre-installed via npm install on host).
# This avoids needing npm registry access during Docker build.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy everything including host node_modules
COPY . .

# Generate Prisma client using the already-present binary
RUN node_modules/.bin/prisma generate

# Build the NestJS TypeScript application
RUN node_modules/.bin/nest build

# Remove devDependencies to shrink the production node_modules
# --legacy-peer-deps bypasses peer dependency version conflicts (mixed NestJS v10/v11)
RUN npm prune --omit=dev --legacy-peer-deps

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production-ready assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --chown=appuser:appgroup package.json ./

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check — Docker will mark container unhealthy if API is down
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# Start the application
CMD ["node", "dist/main"]

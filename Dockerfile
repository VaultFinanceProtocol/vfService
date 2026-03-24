# Multi-stage build for VaultFinance Service

# =============================================================================
# Stage 1: Base
# =============================================================================
FROM node:22-alpine AS base

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/

# Install dependencies
RUN npm ci

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM base AS build

WORKDIR /app

# Copy source code
COPY . .

# Build backend
RUN npm run build:backend

# Build frontend
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build:frontend

# =============================================================================
# Stage 3: Production
# =============================================================================
FROM node:22-alpine AS production

# Install production dependencies
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend production files
COPY --from=build --chown=nodejs:nodejs /app/packages/backend/dist ./packages/backend/dist
COPY --from=build --chown=nodejs:nodejs /app/packages/backend/package*.json ./packages/backend/

# Copy frontend build
COPY --from=build --chown=nodejs:nodejs /app/packages/frontend/dist ./packages/frontend/dist

# Copy root package files
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Install production dependencies
RUN npm ci --production && \
    npm cache clean --force

# Create logs directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
CMD ["node", "packages/backend/dist/main.js"]

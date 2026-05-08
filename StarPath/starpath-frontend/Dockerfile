# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept API URL as build argument
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Ensure public directory exists
RUN mkdir -p /app/public

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

# Expose port (Railway will set PORT env var dynamically)
EXPOSE 3000

# Environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Start the application - use PORT env var from Railway if set, otherwise default to 3000
CMD ["sh", "-c", "node server.js -p ${PORT:-3000}"]

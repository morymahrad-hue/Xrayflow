# Multi-stage production build for 3X-UI Pro
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies with legacy-peer-deps to avoid upstream resolution conflicts
COPY package*.json ./
COPY .npmrc ./
RUN npm install --legacy-peer-deps

# Copy source code and build Vite client
COPY . .
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

# Start server using tsx
CMD ["npm", "run", "start"]

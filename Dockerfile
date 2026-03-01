# Multi-Stage Dockerfile for Hotel Management System
# Stage 1: Build Frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci --legacy-peer-deps

COPY frontend/ .

RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine as backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm ci --only=production

COPY backend/ .

# Stage 3: Final Production Image
FROM node:18-alpine

WORKDIR /app

# Install serve for frontend
RUN npm install -g serve

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Copy docker-compose and other configs
COPY docker-compose.yml .
COPY .gitignore .

# Set environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    FRONTEND_PORT=3000

# Expose ports
EXPOSE 5000 3000

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'node src/server.js &' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'serve -s frontend/build -l 3000' >> /app/start.sh && \
    chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start application
CMD ["/app/start.sh"]

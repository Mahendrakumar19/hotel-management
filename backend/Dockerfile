FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install build dependencies required for compiling native modules, install packages, then remove build deps
RUN apk add --no-cache --virtual .build-deps python3 build-base linux-headers \
    && npm ci --only=production \
    && apk del .build-deps

COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

EXPOSE 5000

CMD ["npm", "start"]

#!/bin/bash

echo "🏨 Hotel Management System - Startup"
echo "======================================="

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be available..."
cd /app/backend

# Retry logic for MySQL connection
MAX_RETRIES=30
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
  if npm run migrate 2>&1; then
    echo "✓ Database migration successful"
    break
  else
    RETRY=$((RETRY + 1))
    if [ $RETRY -lt $MAX_RETRIES ]; then
      echo "⏳ Retry $RETRY/$MAX_RETRIES - Waiting for MySQL..."
      sleep 2
    else
      echo "✗ Failed to connect to MySQL after $MAX_RETRIES attempts"
      echo "⚠️  Running backend without migration"
      break
    fi
  fi
done

# Try to seed if migration was successful
if [ -f "src/database/seed.js" ]; then
  echo "🌱 Checking if seed data is needed..."
  npm run seed 2>&1 || echo "⚠️  Seed skipped or already applied"
fi

echo ""
echo "🚀 Starting services..."
echo "======================================="

# Start backend in background
echo "📡 Starting API server on port 5000..."
cd /app/backend
node src/server.js &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd /app
serve -s frontend/build -l 3000 &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

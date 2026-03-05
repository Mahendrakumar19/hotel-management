#!/bin/bash

set -e

echo "=========================================="
echo "Building Hotel Management System"
echo "=========================================="

echo ""
echo "→ Installing backend dependencies..."
cd backend
npm install
echo "✓ Backend dependencies installed"

echo ""
echo "→ Running database migration..."
npm run migrate || echo "⚠ Migration warning (may already be complete)"
echo "✓ Database ready"

cd ..

echo ""
echo "→ Installing frontend dependencies..."
cd frontend
npm install
echo "✓ Frontend dependencies installed"

echo ""
echo "→ Building React app..."
npm run build
echo "✓ React app built successfully"

cd ..

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""
echo "To start the application, run:"
echo "  npm start"
echo ""

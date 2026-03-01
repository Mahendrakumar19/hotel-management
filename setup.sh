#!/bin/bash

# Hotel Management System - Linux/Mac Setup Script

echo ""
echo "============================================"
echo "Hotel Management System - Setup Script"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 14+ from https://nodejs.org"
    exit 1
fi

echo "Node.js is installed: $(node --version)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL is not installed or not in PATH"
    echo "Please ensure MySQL Server is running"
fi

echo ""
echo "Setting up Backend..."
cd backend

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies"
        exit 1
    fi
fi

# Run database migration
echo ""
echo "Running database migration..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "WARNING: Migration failed. Make sure MySQL is configured correctly."
    echo "Check your .env file in the backend folder."
fi

# Seed database
echo ""
echo "Seeding database with sample data..."
npm run seed
if [ $? -ne 0 ]; then
    echo "WARNING: Seeding failed. Database may need manual setup."
fi

cd ..

echo ""
echo "Setting up Frontend..."
cd frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        exit 1
    fi
fi

cd ..

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Make sure MySQL is running"
echo "2. Review and update .env files:"
echo "   - backend/.env"
echo "   - frontend/.env"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. In another terminal, start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "Default Login Credentials:"
echo "  Admin: admin@hotel.com / admin@123"
echo "  Front Desk: frontdesk1@hotel.com / frontdesk@123"
echo "  F&B Manager: fb@hotel.com / fb@123"
echo ""

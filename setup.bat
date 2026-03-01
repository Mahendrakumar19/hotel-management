@echo off
REM Hotel Management System - Windows Setup Script

echo.
echo ============================================
echo Hotel Management System - Setup Script
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 14+ from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL is not installed or not in PATH
    echo Please ensure MySQL Server is running
    pause
)

echo.
echo Setting up Backend...
cd backend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)

REM Run database migration
echo.
echo Running database migration...
call npm run migrate
if %errorlevel% neq 0 (
    echo WARNING: Migration failed. Make sure MySQL is configured correctly.
    echo Check your .env file in the backend folder.
)

REM Seed database
echo.
echo Seeding database with sample data...
call npm run seed
if %errorlevel% neq 0 (
    echo WARNING: Seeding failed. Database may need manual setup.
)

cd ..

echo.
echo Setting up Frontend...
cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

cd ..

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Make sure MySQL is running
echo 2. Review and update .env files:
echo    - backend/.env
echo    - frontend/.env
echo 3. Start the backend: cd backend && npm run dev
echo 4. In another terminal, start frontend: cd frontend && npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
echo Default Login Credentials:
echo   Admin: admin@hotel.com / admin@123
echo   Front Desk: frontdesk1@hotel.com / frontdesk@123
echo   F&B Manager: fb@hotel.com / fb@123
echo.
pause

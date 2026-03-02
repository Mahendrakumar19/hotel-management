@echo off
REM Hotel Management System - Database Setup Helper

echo.
echo ================================================
echo   Hotel Management System - Database Setup
echo ================================================
echo.

REM Check if MySQL is running
echo Checking MySQL status...
mysql -u root -p"root" -e "SELECT 1" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] MySQL is running
) else (
    echo [ERROR] MySQL is not running
    echo.
    echo Please start MySQL first:
    echo   1. Open XAMPP Control Panel
    echo   2. Click "Start" next to MySQL
    echo   3. Wait for status to show "Running"
    echo.
    pause
    exit /b 1
)

echo.
echo Running database migration...
cd backend
call npm run migrate
if %errorlevel% neq 0 (
    echo [ERROR] Migration failed
    pause
    exit /b 1
)

echo.
echo Running database seed...
call npm run seed
if %errorlevel% neq 0 (
    echo [WARNING] Seed completed with warnings
)

echo.
echo ================================================
echo   Database setup complete!
echo ================================================
echo.
echo Next steps:
echo   1. Run: npm run dev (in backend folder)
echo   2. Run: npm run dev (in frontend folder, new terminal)
echo   3. Open: http://localhost:3000
echo.
pause

@echo off
echo.
echo ========================================
echo   College Finder - Email Server
echo ========================================
echo.

cd server

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create server\.env file with:
    echo   EMAIL_USER=your-email@gmail.com
    echo   EMAIL_PASSWORD=your-app-password
    echo   PORT=3000
    echo.
    echo Get App Password at: https://myaccount.google.com/apppasswords
    echo.
    pause
    exit /b 1
)

echo Starting email verification server...
echo.
node email-server.js

pause

@echo off
REM Decentralized Game Room - Signaling Server Startup Script (Windows)
REM Memory optimization: minimal startup overhead

echo 🎮 Starting Decentralized Game Room Signaling Server...
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Start the signaling server
echo 🚀 Starting signaling server on port 8080...
echo Press Ctrl+C to stop the server
echo ==================================================

REM Memory optimization: start with minimal flags
node signaller.js

pause

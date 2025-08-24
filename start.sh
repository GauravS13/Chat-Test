#!/bin/bash

# Decentralized Game Room - Signaling Server Startup Script
# Memory optimization: minimal startup overhead

echo "🎮 Starting Decentralized Game Room Signaling Server..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Error: Node.js version 16+ required, found version $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Start the signaling server
echo "🚀 Starting signaling server on port 8080..."
echo "Press Ctrl+C to stop the server"
echo "=================================================="

# Memory optimization: start with minimal flags
node signaller.js

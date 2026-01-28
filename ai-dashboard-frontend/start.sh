#!/bin/bash

# AI Dashboard Frontend - Quick Start Script
# This script helps you set up and run the frontend quickly

echo "🚀 AI Dashboard Frontend - Quick Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please run this script from the ai-dashboard-frontend directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo "This may take 2-3 minutes..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully!"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Starting development server..."
echo ""
echo "The application will open at: http://localhost:3000"
echo "Make sure your backend is running at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "========================================"
echo ""

# Start the development server
npm run dev

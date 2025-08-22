#!/bin/bash

echo "🚀 Starting ShortCinema Backend Server..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one from env.example"
    exit 1
fi

# Check if port is available
PORT=$(grep "PORT=" .env | cut -d'=' -f2)
if lsof -i :$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use. Stopping existing process..."
    lsof -ti:$PORT | xargs kill -9
    sleep 2
fi

echo "✅ Port $PORT is available"

# Start the server
echo "🚀 Starting server on port $PORT..."
echo "=========================================="

# Start in background and capture PID
node server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully with PID: $SERVER_PID"
    echo "📍 Backend URL: http://localhost:$PORT"
    echo "🔗 Health Check: http://localhost:$PORT/health"
    echo "🔗 API Base: http://localhost:$PORT/api"
    echo ""
    echo "To stop the server, run: kill $SERVER_PID"
    echo "=========================================="
    
    # Save PID to file for easy stopping
    echo $SERVER_PID > .server.pid
    
    # Wait for user input to stop
    echo "Press Ctrl+C to stop the server..."
    wait $SERVER_PID
else
    echo "❌ Failed to start server"
    exit 1
fi

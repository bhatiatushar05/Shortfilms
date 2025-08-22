#!/bin/bash

echo "🛑 Stopping ShortCinema Backend Server..."
echo "=========================================="

# Check if PID file exists
if [ -f ".server.pid" ]; then
    PID=$(cat .server.pid)
    
    if ps -p $PID > /dev/null; then
        echo "🔄 Stopping server with PID: $PID"
        kill $PID
        
        # Wait for graceful shutdown
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null; then
            echo "⚠️  Force stopping server..."
            kill -9 $PID
        fi
        
        echo "✅ Server stopped successfully"
    else
        echo "⚠️  Server with PID $PID is not running"
    fi
    
    # Remove PID file
    rm -f .server.pid
else
    echo "⚠️  No PID file found. Checking for running processes..."
    
    # Look for node server.js processes
    PIDS=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
    
    if [ -n "$PIDS" ]; then
        echo "🔄 Found running server processes: $PIDS"
        echo $PIDS | xargs kill
        
        sleep 2
        
        # Force kill if still running
        REMAINING_PIDS=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
        if [ -n "$REMAINING_PIDS" ]; then
            echo "⚠️  Force stopping remaining processes..."
            echo $REMAINING_PIDS | xargs kill -9
        fi
        
        echo "✅ All server processes stopped"
    else
        echo "✅ No running server processes found"
    fi
fi

echo "=========================================="

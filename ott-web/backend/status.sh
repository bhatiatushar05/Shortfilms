#!/bin/bash

echo "📊 ShortCinema Backend Status Report"
echo "====================================="
echo ""

# Check if server is running
if [ -f ".server.pid" ]; then
    PID=$(cat .server.pid)
    if ps -p $PID > /dev/null; then
        echo "✅ Backend Server: RUNNING (PID: $PID)"
        echo "📍 URL: http://localhost:3001"
    else
        echo "❌ Backend Server: NOT RUNNING (stale PID file)"
        rm -f .server.pid
    fi
else
    echo "❌ Backend Server: NOT RUNNING (no PID file)"
fi

echo ""

# Check port usage
echo "🔌 Port Status:"
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Port 3001: IN USE"
    lsof -i :3001 | grep LISTEN
else
    echo "❌ Port 3001: AVAILABLE"
fi

echo ""

# Check environment file
echo "⚙️  Environment Configuration:"
if [ -f ".env" ]; then
    echo "✅ .env file: EXISTS"
    
    # Check key configurations
    if grep -q "PORT=3001" .env; then
        echo "✅ Port: 3001"
    else
        echo "❌ Port: $(grep 'PORT=' .env | cut -d'=' -f2)"
    fi
    
    if grep -q "NODE_ENV=production" .env; then
        echo "✅ Environment: production"
    else
        echo "⚠️  Environment: $(grep 'NODE_ENV=' .env | cut -d'=' -f2)"
    fi
    
    if grep -q "JWT_SECRET=" .env; then
        echo "✅ JWT Secret: CONFIGURED"
    else
        echo "❌ JWT Secret: NOT SET"
    fi
    
    if grep -q "SUPABASE_URL=" .env; then
        echo "✅ Supabase: CONFIGURED"
    else
        echo "❌ Supabase: NOT SET"
    fi
    
    if grep -q "AWS_ACCESS_KEY_ID=" .env; then
        echo "✅ AWS: CONFIGURED"
    else
        echo "⚠️  AWS: NOT SET (optional)"
    fi
else
    echo "❌ .env file: MISSING"
fi

echo ""

# Check dependencies
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules: INSTALLED"
else
    echo "❌ node_modules: MISSING (run 'npm install')"
fi

echo ""

# Check Node.js version
echo "🟢 Node.js:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Version: $NODE_VERSION"
    
    # Check if version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "✅ Compatible version (18+)"
    else
        echo "❌ Requires Node.js 18+"
    fi
else
    echo "❌ Node.js: NOT INSTALLED"
fi

echo ""

# Test endpoints if server is running
if [ -f ".server.pid" ] && ps -p $(cat .server.pid) > /dev/null; then
    echo "🧪 Testing Endpoints:"
    
    # Test basic health
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ /health: RESPONDING"
    else
        echo "❌ /health: NOT RESPONDING"
    fi
    
    # Test API health
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ /api/health: RESPONDING"
    else
        echo "❌ /api/health: NOT RESPONDING"
    fi
    
    # Test root endpoint
    if curl -s http://localhost:3001/ > /dev/null; then
        echo "✅ /: RESPONDING"
    else
        echo "❌ /: NOT RESPONDING"
    fi
else
    echo "🧪 Endpoint Testing: SKIPPED (server not running)"
fi

echo ""
echo "====================================="
echo "💡 Quick Commands:"
echo "  Start: ./start.sh"
echo "  Stop:  ./stop.sh"
echo "  Test:  node test-connection.js"
echo "  Logs:  tail -f nohup.out"
echo "====================================="

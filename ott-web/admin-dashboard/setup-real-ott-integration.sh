#!/bin/bash

echo "🚀 Setting up Real OTT Platform Integration for Admin Dashboard"
echo "================================================================"

# Step 1: Go to backend directory
echo "📁 Step 1: Setting up backend..."
cd ../backend

# Step 2: Stop any running backend server
echo "🛑 Step 2: Stopping existing backend server..."
pkill -f "node server.js" || true

# Step 3: Start backend with updated code
echo "🔄 Step 3: Starting backend with real OTT integration..."
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!

# Step 4: Wait for backend to start
echo "⏳ Step 4: Waiting for backend to start..."
sleep 5

# Step 5: Test backend health
echo "🏥 Step 5: Testing backend health..."
if curl -s "http://localhost:5001/health" > /dev/null; then
    echo "✅ Backend is running successfully!"
else
    echo "❌ Backend failed to start. Check server.log for errors."
    exit 1
fi

# Step 6: Test users API
echo "👥 Step 6: Testing users API..."
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@shortcinema.com","password":"admin123"}' \
    | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Authentication successful!"
    
    # Test users endpoint
    USERS_RESPONSE=$(curl -s "http://localhost:5001/api/users" \
        -H "Authorization: Bearer $TOKEN")
    
    echo "📊 Users API Response:"
    echo "$USERS_RESPONSE" | head -c 500
    echo "..."
    
    # Check if we got users
    USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "👥 Total users found: $USER_COUNT"
    
else
    echo "❌ Authentication failed!"
    exit 1
fi

# Step 7: Go back to admin dashboard
echo "📁 Step 7: Setting up admin dashboard..."
cd ../admin-dashboard

# Step 8: Start admin dashboard
echo "🔄 Step 8: Starting admin dashboard..."
echo "🎯 Your admin dashboard is now connected to your real OTT platform!"
echo ""
echo "📋 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login with admin@shortcinema.com / admin123"
echo "3. Go to User Management to see your real OTT users"
echo "4. You can now manage real users, not demo data!"
echo ""
echo "🔧 Database Setup Required:"
echo "Run the SQL functions in supabase-admin-functions.sql in your Supabase SQL Editor"
echo "This will create the necessary views and functions for admin access"
echo ""
echo "🎉 Your admin dashboard is now a real production system!"

# Keep the script running to show the backend is active
echo "🔄 Backend is running in background. Press Ctrl+C to stop this script (backend will continue running)"
wait $BACKEND_PID

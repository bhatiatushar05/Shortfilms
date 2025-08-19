#!/bin/bash

echo "🚀 Deploying ShortCinema Admin Dashboard to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to admin dashboard directory
cd "$(dirname "$0")"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building admin dashboard..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! Please check for errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "📦 Deploying admin dashboard..."
vercel --prod

echo "✅ Admin dashboard deployment complete!"
echo "🔗 Your admin dashboard is now live!"
echo "📝 Remember to update the API URL in vercel.json with your backend URL"

#!/bin/bash

echo "🚀 Deploying ShortCinema Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one from env.example"
    echo "   Make sure to set your production environment variables:"
    echo "   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    echo "   - AWS credentials if using S3"
    echo "   - JWT_SECRET"
    echo "   - CORS_ORIGINS (your Vercel domains)"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying backend API..."
vercel --prod

echo "✅ Backend deployment complete!"
echo "📝 Note down the API URL from the output above"
echo "🔗 You'll need this URL for your admin dashboard configuration"

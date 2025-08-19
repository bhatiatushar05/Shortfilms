#!/bin/bash

echo "🎬 ShortCinema Complete Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 1: Deploy Backend API
echo ""
print_status "Step 1: Deploying Backend API..."
cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found in backend directory!"
    print_status "Please create a .env file with your production environment variables:"
    echo "   - Copy env.example to .env"
    echo "   - Update with your production values:"
    echo "     * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    echo "     * AWS credentials if using S3"
    echo "     * JWT_SECRET"
    echo "     * CORS_ORIGINS (your Vercel domains)"
    echo ""
    read -p "Press Enter after creating .env file..."
fi

# Deploy backend
print_status "Deploying backend to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Backend deployed successfully!"
    print_status "Note down the backend URL from above output"
    echo ""
    read -p "Enter your backend URL (e.g., https://your-backend.vercel.app): " BACKEND_URL
    
    # Update admin dashboard vercel.json with backend URL
    cd ../admin-dashboard
    sed -i.bak "s|https://your-backend-url.vercel.app|$BACKEND_URL|g" vercel.json
    print_success "Updated admin dashboard API configuration"
    
    cd ..
else
    print_error "Backend deployment failed!"
    exit 1
fi

# Step 2: Deploy Admin Dashboard
echo ""
print_status "Step 2: Deploying Admin Dashboard..."
cd admin-dashboard

# Install dependencies and build
print_status "Installing dependencies..."
npm install

print_status "Building admin dashboard..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed! Please check for errors above."
    exit 1
fi

print_success "Build successful!"

# Deploy admin dashboard
print_status "Deploying admin dashboard to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Admin dashboard deployed successfully!"
else
    print_error "Admin dashboard deployment failed!"
    exit 1
fi

cd ..

# Step 3: Deploy Main OTT Platform
echo ""
print_status "Step 3: Deploying Main OTT Platform..."
cd ott-web

# Install dependencies and build
print_status "Installing dependencies..."
npm install

print_status "Building OTT platform..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Build failed! Please check for errors above."
    exit 1
fi

print_success "Build successful!"

# Deploy main platform
print_status "Deploying main OTT platform to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Main OTT platform deployed successfully!"
else
    print_error "Main OTT platform deployment failed!"
    exit 1
fi

cd ..

# Final Summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
print_success "All components deployed successfully!"
echo ""
echo "📋 Your deployed applications:"
echo "   - Backend API: $BACKEND_URL"
echo "   - Admin Dashboard: [Check Vercel output above]"
echo "   - Main OTT Platform: [Check Vercel output above]"
echo ""
echo "🔗 Next steps:"
echo "   1. Test your admin dashboard login"
echo "   2. Add some content through the admin panel"
echo "   3. Verify content appears on your main OTT platform"
echo "   4. Set up custom domains if desired"
echo ""
print_warning "Remember: Changes in admin dashboard will sync to OTT platform through the shared backend API!"

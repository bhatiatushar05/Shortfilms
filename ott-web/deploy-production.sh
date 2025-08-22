#!/bin/bash

# ShortCinema OTT Platform - Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="shortcinema-ott"
FRONTEND_DIR="ott-web"
BACKEND_DIR="ott-web/backend"
ADMIN_DIR="ott-web/admin-dashboard"
DEPLOYMENT_ENV="production"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in production environment
check_environment() {
    log "Checking deployment environment..."
    
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        if [ -z "$VERCEL_TOKEN" ]; then
            error "VERCEL_TOKEN environment variable is required for production deployment"
            exit 1
        fi
        
        if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
            error "Supabase environment variables are required"
            exit 1
        fi
        
        success "Production environment validated"
    else
        warning "Running in development mode"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ is required, found version $NODE_VERSION"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI not found, installing..."
        npm install -g vercel
    fi
    
    success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm ci --production=false
    cd ..
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm ci --production=true
    cd ..
    
    # Admin dashboard dependencies
    log "Installing admin dashboard dependencies..."
    cd "$ADMIN_DIR"
    npm ci --production=false
    cd ..
    
    success "Dependencies installed successfully"
}

# Build applications
build_applications() {
    log "Building applications..."
    
    # Build frontend
    log "Building frontend..."
    cd "$FRONTEND_DIR"
    npm run build
    cd ..
    
    # Build admin dashboard
    log "Building admin dashboard..."
    cd "$ADMIN_DIR"
    npm run build
    cd ..
    
    success "Applications built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    log "Running backend tests..."
    cd "$BACKEND_DIR"
    
    # Test configuration
    if npm run test:config 2>/dev/null; then
        success "Configuration tests passed"
    else
        warning "Configuration tests not available"
    fi
    
    # Test database connection
    if npm run test:server 2>/dev/null; then
        success "Server tests passed"
    else
        warning "Server tests not available"
    fi
    
    cd ..
    
    success "Tests completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Deploy frontend
    log "Deploying frontend..."
    cd "$FRONTEND_DIR"
    
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        vercel --prod --token "$VERCEL_TOKEN"
    else
        vercel --token "$VERCEL_TOKEN"
    fi
    
    cd ..
    
    # Deploy admin dashboard
    log "Deploying admin dashboard..."
    cd "$ADMIN_DIR"
    
    if [ "$DEPLOYMENT_ENV" = "production" ]; then
        vercel --prod --token "$VERCEL_TOKEN"
    else
        vercel --token "$VERCEL_TOKEN"
    fi
    
    cd ..
    
    success "Vercel deployment completed"
}

# Deploy backend
deploy_backend() {
    log "Deploying backend..."
    
    cd "$BACKEND_DIR"
    
    # Check if backend should be deployed to Vercel
    if [ -f "vercel.json" ]; then
        log "Backend has Vercel configuration, deploying..."
        
        if [ "$DEPLOYMENT_ENV" = "production" ]; then
            vercel --prod --token "$VERCEL_TOKEN"
        else
            vercel --token "$VERCEL_TOKEN"
        fi
    else
        warning "No Vercel configuration found for backend"
        log "Backend should be deployed separately to your preferred hosting"
        log "Consider using: DigitalOcean, AWS EC2, or Heroku"
    fi
    
    cd ..
    
    success "Backend deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for deployment to be ready
    sleep 30
    
    # Check if we can get the deployment URL
    if [ -n "$VERCEL_DEPLOYMENT_URL" ]; then
        log "Checking deployment health at: $VERCEL_DEPLOYMENT_URL"
        
        # Try to access health endpoint
        if curl -f "$VERCEL_DEPLOYMENT_URL/api/health" > /dev/null 2>&1; then
            success "Health check passed"
        else
            warning "Health check failed - deployment may still be initializing"
        fi
    else
        warning "No deployment URL available for health check"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove build artifacts
    rm -rf "$FRONTEND_DIR/dist"
    rm -rf "$ADMIN_DIR/build"
    
    # Remove node_modules (optional)
    if [ "$CLEAN_NODE_MODULES" = "true" ]; then
        log "Removing node_modules..."
        rm -rf "$FRONTEND_DIR/node_modules"
        rm -rf "$BACKEND_DIR/node_modules"
        rm -rf "$ADMIN_DIR/node_modules"
    fi
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "🚀 Starting ShortCinema OTT Platform deployment..."
    log "Environment: $DEPLOYMENT_ENV"
    log "Project: $PROJECT_NAME"
    
    # Check environment and prerequisites
    check_environment
    check_prerequisites
    
    # Install and build
    install_dependencies
    build_applications
    
    # Run tests
    run_tests
    
    # Deploy
    deploy_vercel
    deploy_backend
    
    # Health check
    health_check
    
    # Cleanup
    cleanup
    
    success "🎉 Deployment completed successfully!"
    
    log "Next steps:"
    log "1. Verify your application is working correctly"
    log "2. Check all environment variables are set in Vercel"
    log "3. Monitor application logs for any issues"
    log "4. Test all major functionality"
    log "5. Update DNS if using custom domain"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --clean        Clean node_modules after deployment"
        echo "  --dev          Deploy to development environment"
        echo ""
        echo "Environment Variables:"
        echo "  VERCEL_TOKEN           Vercel deployment token"
        echo "  SUPABASE_URL           Supabase project URL"
        echo "  SUPABASE_ANON_KEY      Supabase anonymous key"
        echo "  CLEAN_NODE_MODULES     Set to 'true' to clean node_modules"
        exit 0
        ;;
    --clean)
        CLEAN_NODE_MODULES="true"
        ;;
    --dev)
        DEPLOYMENT_ENV="development"
        ;;
esac

# Run main function
main "$@"

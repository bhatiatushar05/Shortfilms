#!/bin/bash

# ShortCinema OTT Platform - Quick Start Script
# This script helps developers get the project running quickly

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ShortCinema OTT Platform"
FRONTEND_DIR="ott-web"
BACKEND_DIR="ott-web/backend"
ADMIN_DIR="ott-web/admin-dashboard"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
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

# Check if running from correct directory
check_directory() {
    if [ ! -d "$FRONTEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
        error "Please run this script from the project root directory"
        error "Expected structure: ./ott-web/, ./ott-web/backend/"
        exit 1
    fi
    success "Directory structure validated"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
        error "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ is required, found version $NODE_VERSION"
        error "Please upgrade Node.js: https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    success "Prerequisites check passed (Node.js $(node --version), npm $(npm --version))"
}

# Check environment files
check_environment() {
    log "Checking environment configuration..."
    
    # Check frontend environment
    if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
        warning "Frontend .env.local file not found"
        log "Creating from template..."
        cp "$FRONTEND_DIR/env.example" "$FRONTEND_DIR/.env.local" 2>/dev/null || {
            warning "Could not create .env.local from template"
            log "Please create $FRONTEND_DIR/.env.local manually with your Supabase credentials"
        }
    else
        success "Frontend environment file found"
    fi
    
    # Check backend environment
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        warning "Backend .env file not found"
        log "Creating from template..."
        cp "$BACKEND_DIR/env.example" "$BACKEND_DIR/.env" 2>/dev/null || {
            warning "Could not create .env from template"
            log "Please create $BACKEND_DIR/.env manually with your credentials"
        }
    else
        success "Backend environment file found"
    fi
    
    warning "⚠️  IMPORTANT: Please update your environment files with your actual credentials before continuing!"
    warning "   - Supabase URL and API keys"
    warning "   - AWS credentials (if using AWS storage)"
    warning "   - JWT secret"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    cd ..
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install
    cd ..
    
    # Admin dashboard dependencies
    log "Installing admin dashboard dependencies..."
    cd "$ADMIN_DIR"
    npm install
    cd ..
    
    success "Dependencies installed successfully"
}

# Start development servers
start_servers() {
    log "Starting development servers..."
    
    # Start backend server
    log "Starting backend server..."
    cd "$BACKEND_DIR"
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend server
    log "Starting frontend server..."
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Start admin dashboard
    log "Starting admin dashboard..."
    cd "$ADMIN_DIR"
    npm start &
    ADMIN_PID=$!
    cd ..
    
    success "All servers started!"
    
    # Show server information
    echo ""
    echo "🌐 Server Information:"
    echo "======================"
    echo "Frontend:     http://localhost:5173"
    echo "Backend:      http://localhost:3001"
    echo "Admin Panel:  http://localhost:3000"
    echo "Health Check: http://localhost:3001/health"
    echo "======================"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Wait for user to stop
    wait
}

# Stop all servers
stop_servers() {
    log "Stopping all servers..."
    
    # Kill all background processes
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    
    success "All servers stopped"
}

# Test configuration
test_configuration() {
    log "Testing configuration..."
    
    cd "$BACKEND_DIR"
    
    # Test if server can start
    if timeout 10s npm run dev > /dev/null 2>&1; then
        success "Backend server test passed"
    else
        warning "Backend server test failed - check your configuration"
    fi
    
    cd ..
}

# Show help
show_help() {
    echo "ShortCinema OTT Platform - Quick Start"
    echo "======================================"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all development servers (default)"
    echo "  stop        Stop all development servers"
    echo "  install     Install dependencies only"
    echo "  test        Test configuration"
    echo "  help        Show this help message"
    echo ""
    echo "Environment Setup:"
    echo "  1. Create .env.local in ott-web/ with your Supabase credentials"
    echo "  2. Create .env in ott-web/backend/ with your backend credentials"
    echo "  3. Run '$0 install' to install dependencies"
    echo "  4. Run '$0 start' to start all servers"
    echo ""
    echo "Documentation:"
    echo "  - PROJECT_SETUP.md - Complete setup guide"
    echo "  - env.example - Environment variable templates"
    echo ""
}

# Main function
main() {
    case "${1:-start}" in
        start)
            echo "🚀 Starting $PROJECT_NAME..."
            check_directory
            check_prerequisites
            check_environment
            install_dependencies
            start_servers
            ;;
        stop)
            stop_servers
            ;;
        install)
            echo "📦 Installing dependencies..."
            check_directory
            check_prerequisites
            install_dependencies
            ;;
        test)
            echo "🧪 Testing configuration..."
            check_directory
            check_prerequisites
            test_configuration
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap 'echo ""; log "Received interrupt signal"; stop_servers; exit 0' INT

# Run main function
main "$@"

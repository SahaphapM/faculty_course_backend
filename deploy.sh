#!/bin/bash

# Production Deployment Script for Skill Mapping Backend
# This script handles the complete deployment process with error handling

set -e # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
NODE_ENV=${NODE_ENV:-production}
PM2_APP_NAME=${PM2_APP_NAME:-skill-mapping-backend}

# Function to print header
print_header() {
    echo -e "${MAGENTA}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               🚀 Skill Mapping Backend                       ║"
    echo "║                 Production Deployment                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to log steps
log_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    log_step "1" "Checking Node.js version..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_success "Node.js ${NODE_VERSION} detected"
        
        # Check if Node.js version is >= 18
        NODE_MAJOR_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            log_success "Node.js version is compatible (>= 18.0.0)"
        else
            log_warning "Node.js version ${NODE_VERSION} detected. Recommended: >= 18.0.0"
        fi
    else
        log_error "Node.js is not installed!"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    log_step "2" "Installing production dependencies..."
    
    # Check if package-lock.json exists (npm) or yarn.lock (yarn)
    if [ -f "package-lock.json" ]; then
        log_success "Using npm for dependency installation"
        npm ci --only=production
    elif [ -f "yarn.lock" ]; then
        log_success "Using yarn for dependency installation"
        yarn install --production --frozen-lockfile
    else
        log_warning "No lockfile found, using npm install"
        npm install --only=production
    fi
    
    log_success "Dependencies installed successfully"
}

# Function to build application
build_application() {
    log_step "3" "Building application..."
    
    if npm run build; then
        log_success "Application built successfully"
    else
        log_error "Build failed!"
        exit 1
    fi
    
    # Verify build output
    if [ -f "dist/src/main.js" ]; then
        log_success "Build output verified: dist/src/main.js exists"
    else
        log_error "Build output not found: dist/src/main.js missing"
        exit 1
    fi
}

# Function to setup Prisma
setup_prisma() {
    log_step "4" "Setting up Prisma..."
    
    # Generate Prisma client
    log_success "Generating Prisma client..."
    if npx prisma generate; then
        log_success "Prisma client generated successfully"
    else
        log_error "Prisma client generation failed!"
        exit 1
    fi
    
    # Run database migrations
    log_success "Running database migrations..."
    if npx prisma migrate deploy; then
        log_success "Database migrations completed successfully"
    else
        log_error "Database migration failed!"
        exit 1
    fi
    
    # Check migration status
    log_success "Checking migration status..."
    npx prisma migrate status || log_warning "Migration status check completed with warnings"
}

# Function to stop existing PM2 process
stop_existing_process() {
    log_step "5" "Managing PM2 processes..."
    
    if command_exists pm2; then
        if pm2 list | grep -q "$PM2_APP_NAME"; then
            log_success "Stopping existing PM2 process: $PM2_APP_NAME"
            pm2 stop "$PM2_APP_NAME" || log_warning "Failed to stop existing process"
            pm2 delete "$PM2_APP_NAME" || log_warning "Failed to delete existing process"
        else
            log_success "No existing PM2 process found for $PM2_APP_NAME"
        fi
    else
        log_error "PM2 is not installed!"
        exit 1
    fi
}

# Function to start application with PM2
start_application() {
    log_step "6" "Starting application with PM2..."
    
    # Check if ecosystem.config.js exists
    if [ -f "ecosystem.config.js" ]; then
        log_success "Using ecosystem.config.js for PM2 configuration"
        pm2 start ecosystem.config.js --env production
    else
        log_success "Starting with default PM2 configuration"
        pm2 start dist/src/main.js --name "$PM2_APP_NAME" --env production
    fi
    
    # Save PM2 configuration
    if pm2 save; then
        log_success "PM2 configuration saved"
    else
        log_warning "Failed to save PM2 configuration"
    fi
    
    # Show PM2 status
    log_success "PM2 process status:"
    pm2 list
}

# Function to verify deployment
verify_deployment() {
    log_step "7" "Verifying deployment..."
    
    # Wait a moment for the application to start
    sleep 3
    
    # Check if PM2 process is running
    if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
        log_success "Application is running in PM2"
    else
        log_error "Application failed to start!"
        pm2 logs "$PM2_APP_NAME" --lines 10
        exit 1
    fi
    
    # Show recent logs
    log_success "Recent application logs:"
    pm2 logs "$PM2_APP_NAME" --lines 5 --nostream
}

# Function to cleanup
cleanup() {
    log_step "8" "Cleaning up..."
    
    # Remove development dependencies if they were installed
    if [ -f "package-lock.json" ]; then
        npm prune --production || log_warning "Failed to prune npm dependencies"
    fi
    
    log_success "Cleanup completed"
}

# Function to show deployment summary
show_summary() {
    echo -e "${GREEN}${BOLD}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}${BOLD}📊 Deployment Summary:${NC}"
    echo -e "${CYAN}• Environment: ${BOLD}${NODE_ENV}${NC}"
    echo -e "${CYAN}• PM2 App Name: ${BOLD}${PM2_APP_NAME}${NC}"
    echo -e "${CYAN}• Build Output: ${BOLD}dist/src/main.js${NC}"
    echo -e "${CYAN}• Prisma Status: ${BOLD}Migrated & Generated${NC}"
    echo ""
    echo -e "${BLUE}${BOLD}🔧 Useful Commands:${NC}"
    echo -e "${BLUE}• Check logs: ${BOLD}pm2 logs ${PM2_APP_NAME}${NC}"
    echo -e "${BLUE}• Restart app: ${BOLD}pm2 restart ${PM2_APP_NAME}${NC}"
    echo -e "${BLUE}• Stop app: ${BOLD}pm2 stop ${PM2_APP_NAME}${NC}"
    echo -e "${BLUE}• Monitor: ${BOLD}pm2 monit${NC}"
    echo -e "${BLUE}• Status: ${BOLD}pm2 list${NC}"
}

# Main deployment function
main() {
    print_header
    
    # Set environment to production
    export NODE_ENV=production
    
    # Run deployment steps
    check_node_version
    install_dependencies
    build_application
    setup_prisma
    stop_existing_process
    start_application
    verify_deployment
    cleanup
    show_summary
}

# Handle script interruption
trap 'log_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"

#!/bin/bash

# Team Developer Setup Script
# This script helps new team members set up the backend project quickly

set -e

echo "🚀 Setting up Skill Mapping Backend for team development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 Step $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Step 1: Check Node.js version
print_step "1" "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION detected (✓)"
    else
        print_error "Node.js $NODE_VERSION detected. Please upgrade to Node.js 18+ (recommended: 22+)"
        echo "Visit https://nodejs.org/ or use nvm to install a newer version"
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18+ (recommended: 22+)"
    exit 1
fi

# Step 2: Use .nvmrc if available
print_step "2" "Setting up Node.js environment..."
if [ -f ".nvmrc" ] && command -v nvm &> /dev/null; then
    print_success "Using Node.js version from .nvmrc"
    nvm use
else
    print_warning "NVM not found or .nvmrc missing. Using system Node.js version."
fi

# Step 3: Install dependencies
print_step "3" "Installing dependencies..."

# Check if user prefers yarn or npm
if command -v yarn &> /dev/null; then
    echo "Both npm and yarn are available. Which package manager would you like to use?"
    echo "1) npm (default)"
    echo "2) yarn"
    echo ""
    read -p "Enter your choice (1-2): " pm_choice
    
    case $pm_choice in
        2)
            PACKAGE_MANAGER="yarn"
            print_success "Using yarn for package management"
            if yarn install; then
                print_success "Dependencies installed successfully with yarn"
            else
                print_error "Failed to install dependencies with yarn"
                exit 1
            fi
            ;;
        *)
            PACKAGE_MANAGER="npm"
            print_success "Using npm for package management"
            if npm install; then
                print_success "Dependencies installed successfully with npm"
            else
                print_error "Failed to install dependencies with npm"
                exit 1
            fi
            ;;
    esac
else
    PACKAGE_MANAGER="npm"
    print_success "Using npm for package management"
    if npm install; then
        print_success "Dependencies installed successfully with npm"
    else
        print_error "Failed to install dependencies with npm"
        exit 1
    fi
fi

# Step 4: Environment setup
print_step "4" "Setting up environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please edit .env file with your database credentials"
    else
        print_warning ".env.example not found. You'll need to create .env manually"
    fi
else
    print_success ".env file already exists"
fi

# Step 5: Check database connection
print_step "5" "Checking database connection..."
echo "Please ensure your database is running and .env is configured correctly"
echo "Database URL should be in format: mysql://user:password@localhost:3306/database_name"

# Step 6: Database setup options
print_step "6" "Database setup options..."
echo "Choose database setup option:"
echo "1) Quick setup (recommended for first-time setup)"
echo "2) Just run migrations"
echo "3) Skip database setup (I'll do it manually)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_step "6a" "Running quick database setup..."
        if $PACKAGE_MANAGER run db:setup; then
            print_success "Database setup completed with seed data"
        else
            print_warning "Database setup failed. You may need to configure your database connection"
            echo "Try running: $PACKAGE_MANAGER run prisma:migrate:dev"
        fi
        ;;
    2)
        print_step "6b" "Running database migrations..."
        if $PACKAGE_MANAGER run prisma:migrate:dev; then
            print_success "Database migrations completed"
        else
            print_warning "Database migrations failed. Check your database connection"
        fi
        ;;
    3)
        print_warning "Skipping database setup. Remember to run migrations before starting the server"
        echo "Commands to run manually:"
        echo "  $PACKAGE_MANAGER run prisma:migrate:dev  # Apply migrations"
        echo "  $PACKAGE_MANAGER run prisma:seed         # Seed database"
        ;;
    *)
        print_warning "Invalid choice. Skipping database setup"
        ;;
esac

# Step 7: Generate Prisma client
print_step "7" "Generating Prisma client..."
if $PACKAGE_MANAGER run prisma:generate; then
    print_success "Prisma client generated successfully"
else
    print_warning "Failed to generate Prisma client"
fi

# Final instructions
echo ""
echo "🎉 Setup completed!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env file with your database credentials (if not done already)"
echo "2. Start development server: ${GREEN}$PACKAGE_MANAGER run start:dev${NC}"
echo "3. Open Prisma Studio: ${GREEN}$PACKAGE_MANAGER run prisma:studio${NC}"
echo ""
echo "📖 Documentation:"
echo "• Package manager guide: ./PACKAGE_MANAGER_GUIDE.md"
echo "• Database operations: ./DATABASE_SETUP.md"
echo "• Cross-platform setup: ./CROSS_PLATFORM_SETUP.md"
echo "• Project overview: ./README.md"
echo ""
echo "🆘 Need help?"
echo "• Check migration status: ${BLUE}$PACKAGE_MANAGER run prisma:migrate:status${NC}"
echo "• Reset database: ${BLUE}$PACKAGE_MANAGER run db:reset${NC}"
echo "• View available scripts: ${BLUE}$PACKAGE_MANAGER run${NC}"

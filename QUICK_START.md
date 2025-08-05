# 🚀 Quick Start Guide for Team Developers

## ⚡ TL;DR - Start Development in 3 Commands

```bash
# 1. Setup everything
./setup-dev.sh

# 2. Start development server  
npm run start:dev

# 3. Open database GUI (optional)
npm run prisma:studio
```

## 📋 Available NPM Scripts

### 🏃‍♂️ Development Scripts
```bash
npm run start:dev        # Start development server with auto-reload
npm run start           # Start production server
npm run build           # Build for production
```

### 🗄️ Database Scripts
```bash
# Quick setup
npm run db:setup        # Migrate + seed (for new setup)
npm run db:reset        # Reset + migrate + seed (fresh start)

# Migrations
npm run prisma:migrate:dev      # Create/apply new migration
npm run prisma:migrate:deploy   # Deploy migrations (production)
npm run prisma:migrate:reset    # Reset all migrations
npm run prisma:migrate:status   # Check migration status

# Database sync
npm run prisma:db:pull    # Pull schema from database
npm run prisma:db:push    # Push schema to database (dev only)

# Tools
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Seed database with data
```

### 🔧 Utility Scripts
```bash
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
```

## 🔄 Daily Development Workflow

### First Time Setup
```bash
# 1. Clone and install
git clone <repo-url>
cd skill-mapping-backend
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your database credentials

# 3. Database setup
npm run db:setup

# 4. Start development
npm run start:dev
```

### Daily Workflow
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install

# 3. Check for new migrations
npm run prisma:migrate:status

# 4. Apply new migrations (if any)
npm run prisma:migrate:dev

# 5. Start development
npm run start:dev
```

## 🆘 Common Issues & Solutions

### ❌ Migration Issues
```bash
# Check what's wrong
npm run prisma:migrate:status

# Reset everything (development only)
npm run db:reset

# Manual reset if needed
npm run prisma:migrate:reset --force
npm run prisma:seed
```

### ❌ Database Connection Issues
```bash
# Check if database is running
# Verify .env DATABASE_URL

# Test connection
npm run prisma:db:pull
```

### ❌ Prisma Client Issues
```bash
# Regenerate client
npm run prisma:generate

# If still issues, clear and regenerate
rm -rf node_modules/.prisma
npm run prisma:generate
```

### ❌ Dependency Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
skill-mapping-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.ts           # Seed data
├── src/
│   ├── modules/          # Feature modules
│   ├── auth/            # Authentication
│   ├── generated/       # Auto-generated DTOs
│   └── main.ts          # App entry point
├── .env.example         # Environment template
├── setup-dev.sh         # Automated setup script
├── DATABASE_SETUP.md    # Detailed database guide
└── package.json         # Dependencies & scripts
```

## 🔗 Important Files & Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Comprehensive database operations guide
- **[CROSS_PLATFORM_SETUP.md](./CROSS_PLATFORM_SETUP.md)** - Cross-platform development setup
- **[DEPENDENCY_UPDATE_SUMMARY.md](./DEPENDENCY_UPDATE_SUMMARY.md)** - Recent dependency updates
- **[.env.example](./.env.example)** - Environment variables template

## 🎯 Most Used Commands

```bash
# Development
npm run start:dev         # Start development (most used)
npm run prisma:studio     # View/edit database
npm run prisma:migrate:dev # Create migrations

# Troubleshooting  
npm run db:reset          # Nuclear option (reset everything)
npm run prisma:migrate:status # Check migrations
```

## 💡 Tips

- **Use `npm run prisma:studio`** to visualize and edit your database
- **Always check migration status** after pulling changes
- **Use `db:reset`** when local database gets corrupted
- **Commit migration files** to git
- **Never use `db:push`** in production

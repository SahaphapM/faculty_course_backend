# 🎯 Complete Database Scripts Reference

## ✅ Available Database Scripts

All scripts are now configured and ready to use with npm. Here's the complete reference:

### 🔄 Daily Development Scripts
```bash
npm run start:dev        # Start development server (includes prisma:generate)
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:generate  # Generate Prisma client
```

### 🗄️ Migration Management Scripts
```bash
npm run prisma:migrate:dev     # Create and apply new migration (development)
npm run prisma:migrate:deploy  # Apply migrations (production deployment)
npm run prisma:migrate:reset   # Reset all migrations (destructive)
npm run prisma:migrate:status  # Check migration status
```

### 🔄 Database Synchronization Scripts
```bash
npm run prisma:db:pull   # Pull database schema to Prisma schema file
npm run prisma:db:push   # Push Prisma schema to database (development only)
```

### 🌱 Data Management Scripts
```bash
npm run prisma:seed      # Seed database with initial data
npm run seed:complete    # Run complete curriculum seeding
```

### ⚡ Convenience Scripts (Combined Operations)
```bash
npm run db:setup         # Apply migrations + seed data (first-time setup)
npm run db:reset         # Reset + migrate + seed (complete reset)
```

## 📋 When to Use Each Script

### 🚀 **First Time Setup (New Developer)**
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:setup

# 4. Start development
npm run start:dev
```

### 📅 **Daily Development Workflow**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for new migrations
npm run prisma:migrate:status

# 3. Apply new migrations (if any)
npm run prisma:migrate:dev

# 4. Start development
npm run start:dev
```

### 🔨 **Creating Database Changes**
```bash
# 1. Modify prisma/schema.prisma
# 2. Create and apply migration
npm run prisma:migrate:dev
# Enter migration name when prompted

# 3. The Prisma client will be auto-generated
# 4. Commit the migration files to git
```

### 🆘 **Troubleshooting Database Issues**
```bash
# Check migration status
npm run prisma:migrate:status

# Reset everything (development only)
npm run db:reset

# Pull current database schema
npm run prisma:db:pull

# Regenerate Prisma client
npm run prisma:generate
```

### 🎯 **Working with Database GUI**
```bash
# Open Prisma Studio
npm run prisma:studio
# Opens at http://localhost:5555
```

### 🚀 **Production Deployment**
```bash
# Apply migrations in production
npm run prisma:migrate:deploy

# Generate Prisma client
npm run prisma:generate
```

## ⚠️ Important Notes

### ✅ **Safe for Development**
- `npm run prisma:migrate:dev` - Creates migrations
- `npm run prisma:db:push` - Quick schema push (prototyping only)
- `npm run prisma:migrate:reset` - Reset database
- `npm run db:reset` - Complete reset with seed data

### ❌ **NEVER Use in Production**
- `npm run prisma:migrate:reset` - Will delete all data
- `npm run prisma:db:push` - Can cause data loss
- `npm run db:reset` - Will wipe everything

### 🔒 **Production Only**
- `npm run prisma:migrate:deploy` - Apply migrations safely

### 📝 **Always Commit to Git**
- Migration files in `prisma/migrations/`
- Changes to `prisma/schema.prisma`

## 🔧 Environment Variables Required

Ensure your `.env` file contains:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

## 🆘 Common Error Solutions

### "Migration file not found"
```bash
npm run prisma:migrate:status
npm run prisma:migrate:dev
```

### "Database connection failed"
```bash
# Check your .env DATABASE_URL
# Ensure database server is running
npm run prisma:db:pull  # Test connection
```

### "Prisma Client not found"
```bash
npm run prisma:generate
```

### "Migration conflicts"
```bash
# Development only - reset and start fresh
npm run db:reset
```

## 🎉 Quick Reference Card

| Need to... | Run this command |
|------------|------------------|
| Start development | `npm run start:dev` |
| View/edit database | `npm run prisma:studio` |
| Create migration | `npm run prisma:migrate:dev` |
| Check migration status | `npm run prisma:migrate:status` |
| Reset everything | `npm run db:reset` |
| Setup new environment | `npm run db:setup` |
| Test database connection | `npm run prisma:db:pull` |

---

📚 **More Documentation:**
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Comprehensive database setup
- [CROSS_PLATFORM_SETUP.md](./CROSS_PLATFORM_SETUP.md) - Cross-platform development

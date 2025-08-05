# Database Setup Guide for Team Developers

## 🚀 Quick Start for New Developers

### 1. Initial Project Setup
```bash
# Clone the repository and install dependencies
git clone <repository-url>
cd skill-mapping-backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file with your database credentials
```

### 2. Database Setup (Choose one option)

#### Option A: Fresh Database Setup
```bash
# Run database migrations and seed data
npm run db:setup
```

#### Option B: Manual Step-by-Step Setup
```bash
# Apply all pending migrations
npm run prisma:migrate:dev

# Seed the database with initial data
npm run prisma:seed
```

### 3. Start Development Server
```bash
# Start the application (includes Prisma client generation)
npm run start:dev
```

## 📋 Available Database Scripts

### Migration Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `npm run prisma:migrate:dev` | `npx prisma migrate dev` | Create and apply new migration in development |
| `npm run prisma:migrate:deploy` | `npx prisma migrate deploy` | Apply migrations in production |
| `npm run prisma:migrate:reset` | `npx prisma migrate reset` | Reset database and apply all migrations |
| `npm run prisma:migrate:status` | `npx prisma migrate status` | Check migration status |

### Database Sync Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `npm run prisma:db:pull` | `npx prisma db pull` | Pull schema from database to Prisma schema |
| `npm run prisma:db:push` | `npx prisma db push` | Push Prisma schema to database (dev only) |

### Development Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `npm run prisma:generate` | `bunx prisma generate` | Generate Prisma client |
| `npm run prisma:studio` | `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:seed` | `npx prisma db seed` | Seed database with initial data |

### Convenience Scripts
| Script | Command | Description |
|--------|---------|-------------|
| `npm run db:setup` | Combined | Run migrations + seed data |
| `npm run db:reset` | Combined | Reset database + seed data |

## 🔄 Common Development Workflows

### Starting Development (Daily Workflow)
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Check migration status
npm run prisma:migrate:status

# 4. Apply any new migrations (if needed)
npm run prisma:migrate:dev

# 5. Start development server
npm run start:dev
```

### When Schema Changes Are Made
```bash
# 1. Create and apply migration
npm run prisma:migrate:dev
# Enter migration name when prompted

# 2. Regenerate Prisma client (auto-runs in start:dev)
npm run prisma:generate
```

### When Database Gets Out of Sync
```bash
# Option 1: Reset everything (destructive)
npm run db:reset

# Option 2: Pull current database schema
npm run prisma:db:pull
```

### When Working with Database GUI
```bash
# Open Prisma Studio in browser
npm run prisma:studio
```

## ⚠️ Important Notes

### Development Environment
- **Always use migrations** in development: `npm run prisma:migrate:dev`
- **Never use** `db:push` in production - it's for prototyping only
- **Commit migration files** to version control

### Production Environment
- Use `npm run prisma:migrate:deploy` for production deployments
- Never use `migrate:reset` in production
- Always backup database before major changes

### Team Collaboration
- **Pull before push**: Always pull latest changes before creating new migrations
- **Migration conflicts**: If migration conflicts occur, reset and re-create migrations
- **Schema changes**: Communicate major schema changes with the team

## 🔧 Environment Variables

Ensure your `.env` file contains:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/skill_mapping_db"

# Optional: For database seeding
NODE_ENV="development"
```

## 🆘 Troubleshooting

### Migration Issues
```bash
# Check migration status
npm run prisma:migrate:status

# Reset migrations (development only)
npm run prisma:migrate:reset

# Force reset database
npm run db:reset
```

### Client Generation Issues
```bash
# Regenerate Prisma client
npm run prisma:generate

# If issues persist, delete generated folder and regenerate
rm -rf node_modules/.prisma
npm run prisma:generate
```

### Database Connection Issues
```bash
# Check database connection
npx prisma db pull

# Verify environment variables
echo $DATABASE_URL
```

## 📚 Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)

## 🎯 Quick Reference Commands

```bash
# Most common commands for daily development
npm run start:dev              # Start development server
npm run prisma:migrate:dev     # Create/apply migrations
npm run prisma:studio          # Open database GUI
npm run db:setup               # Full database setup
npm run db:reset               # Reset everything
```

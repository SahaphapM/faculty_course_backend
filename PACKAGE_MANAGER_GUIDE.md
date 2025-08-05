# 📦 Package Manager Support Guide

This project supports both **npm** and **yarn** for developer flexibility. Choose the package manager you prefer!

## 🎯 Quick Start for Both Package Managers

### Using npm
```bash
npm install
npm run start:dev
```

### Using Yarn
```bash
yarn install
yarn start:dev
```

## 📋 Package Manager Commands Comparison

### Installation
| Task | npm | yarn |
|------|-----|------|
| Install dependencies | `npm install` | `yarn install` or `yarn` |
| Add dependency | `npm install package` | `yarn add package` |
| Add dev dependency | `npm install -D package` | `yarn add -D package` |
| Remove dependency | `npm uninstall package` | `yarn remove package` |

### Running Scripts
| Task | npm | yarn |
|------|-----|------|
| Start development | `npm run start:dev` | `yarn start:dev` |
| Build project | `npm run build` | `yarn build` |
| Run tests | `npm run test` | `yarn test` |
| Any script | `npm run <script>` | `yarn <script>` |

### Database Operations
| Task | npm | yarn |
|------|-----|------|
| Setup database | `npm run db:setup` | `yarn db:setup` |
| Create migration | `npm run prisma:migrate:dev` | `yarn prisma:migrate:dev` |
| Open Prisma Studio | `npm run prisma:studio` | `yarn prisma:studio` |
| Reset database | `npm run db:reset` | `yarn db:reset` |

## 🚀 Quick Setup Instructions

### For npm users:
```bash
# 1. Clone and setup
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

### For yarn users:
```bash
# 1. Clone and setup
git clone <repo-url>
cd skill-mapping-backend
yarn install

# 2. Environment setup
cp .env.example .env
# Edit .env with your database credentials

# 3. Database setup
yarn db:setup

# 4. Start development
yarn start:dev
```

## 🔧 Project Configuration

The project is configured to work with both package managers:

### Package Manager Detection
- **yarn.lock** present - Yarn users will get Yarn benefits
- **package-lock.json** present - npm users will get npm benefits
- Both can coexist for team flexibility

### Engine Requirements
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">= 8.0.0",
    "yarn": ">= 1.22.0"
  },
  "packageManager": "yarn@4.9.2"
}
```

## 📝 Team Workflow Guidelines

### 🎯 Recommended Approach
- **Choose one per developer** - Don't mix package managers in your local development
- **Commit both lock files** - yarn.lock AND package-lock.json (for team flexibility)
- **Use the setup script** - `./setup-dev.sh` works with both package managers

### 🔄 Lock Files
- **yarn.lock** - Generated/updated by Yarn
- **package-lock.json** - Generated/updated by npm
- **Both should be committed** to support team member preferences

### ⚠️ Important Notes
- Don't delete the other package manager's lock file
- If you prefer npm, use npm consistently
- If you prefer yarn, use yarn consistently
- Both package managers will respect the same `package.json` scripts

## 🛠️ IDE/Editor Integration

### VS Code
Both package managers work with VS Code. The editor will:
- Detect which package manager you're using
- Suggest the appropriate commands
- Work with both yarn.lock and package-lock.json

### Terminal Integration
```bash
# Check which package manager you're using
which npm    # Shows npm path
which yarn   # Shows yarn path

# Version checks
npm --version   # npm version
yarn --version  # yarn version
```

## 🆘 Troubleshooting

### Mixed Package Manager Issues
If you accidentally mixed package managers:

**Reset for npm:**
```bash
rm -rf node_modules yarn.lock
npm install
```

**Reset for yarn:**
```bash
rm -rf node_modules package-lock.json
yarn install
```

### Version Mismatches
```bash
# For npm users
npm install
npm run prisma:generate

# For yarn users  
yarn install
yarn prisma:generate
```

### Cache Issues
```bash
# Clear npm cache
npm cache clean --force

# Clear yarn cache
yarn cache clean
```

## 🎯 Script Reference

All scripts work identically with both package managers:

| Script | Description |
|--------|-------------|
| `start:dev` | Start development server |
| `build` | Build for production |
| `test` | Run tests |
| `lint` | Run ESLint |
| `format` | Format code with Prettier |
| `prisma:studio` | Open database GUI |
| `db:setup` | Setup database (migrate + seed) |
| `db:reset` | Reset database completely |

## 💡 Pro Tips

### For npm users:
- Use `npm ci` in CI/CD for faster, reliable installs
- Use `npm run` to see all available scripts
- Use `npm outdated` to check for updates

### For yarn users:
- Use `yarn` instead of `yarn install` (shorter)
- Use `yarn why package` to see why a package is installed
- Use `yarn upgrade-interactive` for guided updates

## 🔗 Documentation Links

- **npm documentation**: https://docs.npmjs.com/
- **Yarn documentation**: https://yarnpkg.com/getting-started
- **Project setup**: [QUICK_START.md](./QUICK_START.md)
- **Database operations**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

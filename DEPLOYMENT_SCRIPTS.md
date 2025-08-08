# Deployment Scripts Guide

This repository contains multiple deployment scripts for different environments:

## Scripts Overview

### 1. `deploy-local.sh` - Local Development
- **Purpose**: Local development environment setup
- **Features**: 
  - Hot reloading
  - Development database setup
  - PM2 with watch mode
  - Auto-rebuild capabilities
- **Usage**: `./deploy-local.sh`

### 2. `deploy.sh` - Production Server
- **Purpose**: Production deployment (general production server)
- **Features**: 
  - Production build
  - Database migrations
  - PM2 production mode
  - Optimized for performance
- **Usage**: `./deploy.sh`

### 3. `deploy-buu.sh` - BUU University Server
- **Purpose**: Deployment to BUU university server via SSH
- **Features**: 
  - SSH file upload
  - Remote deployment
  - Source code packaging
  - Excludes node_modules and build artifacts
- **Usage**: `./deploy-buu.sh`

## BUU Server Deployment Setup

### Prerequisites
- SSH access to BUU server
- Node.js installed on BUU server
- PM2 installed on BUU server

### Configuration
Before first use, configure the BUU deployment script:

```bash
./deploy-buu.sh --configure
```

Then edit the script and set these variables:
```bash
BUU_HOST="your-server.buu.ac.th"
BUU_USER="your-username" 
BUU_SSH_KEY="~/.ssh/id_rsa"  # Optional
BUU_REMOTE_PATH="/home/username/skill-mapping-backend"
BUU_PORT="22"
```

### What gets uploaded to BUU server:
- ✅ Source code (`src/`)
- ✅ Prisma schema and migrations (`prisma/`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Documentation (`docs/`, `README.md`, etc.)
- ✅ Deployment scripts (`deploy.sh`, etc.)
- ❌ Dependencies (`node_modules/`)
- ❌ Build artifacts (`dist/`)
- ❌ Lock files (`package-lock.json`, `bun.lockb`)
- ❌ Environment files (`.env`)
- ❌ Cache and temporary files

### Deployment Process:
1. **Validation**: Checks SSH configuration
2. **Archive Creation**: Packages source files (excludes node_modules)
3. **Upload**: Transfers archive to BUU server via SSH/SCP
4. **Extract**: Unpacks files on remote server
5. **Setup**: Prepares environment on server
6. **Deploy**: Runs production deployment script remotely
7. **Verify**: Checks deployment status

### Example Usage:
```bash
# Configure the script (first time only)
./deploy-buu.sh --configure

# Deploy to BUU server
./deploy-buu.sh

# Get help
./deploy-buu.sh --help
```

### Remote Management:
After deployment, you can manage the application remotely:

```bash
# Connect to server
ssh -p 22 username@server.buu.ac.th

# Check application status
ssh username@server.buu.ac.th 'pm2 list'

# View logs
ssh username@server.buu.ac.th 'pm2 logs skill-mapping-backend'

# Restart application
ssh username@server.buu.ac.th 'pm2 restart skill-mapping-backend'
```

## Environment Files

Make sure to create and configure `.env` file on the target server with:
- Database connection strings
- API keys
- JWT secrets
- Other environment-specific configurations

The deployment script will create a `.env` file from `.env.example` if it doesn't exist.

## Troubleshooting

### SSH Connection Issues
- Verify SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
- Test SSH connection manually: `ssh username@server.buu.ac.th`
- Check firewall settings and SSH port

### Deployment Failures
- Check server logs: `pm2 logs skill-mapping-backend`
- Verify Node.js version on server: `node --version`
- Ensure PM2 is installed: `npm install -g pm2`
- Check database connectivity

### Permission Issues
- Ensure deployment directory has write permissions
- Check script execution permissions: `chmod +x deploy-buu.sh`

## Security Notes

- Never commit `.env` files to git
- Use SSH keys instead of passwords when possible
- Regularly update server dependencies
- Monitor application logs for security issues

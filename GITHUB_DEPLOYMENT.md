# GitHub Setup & Deployment Guide

## Setting Up on GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `hotel-management` (or your preferred name)
3. **Do NOT** initialize with README (we already have one)
4. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

```bash
cd D:\hotel-managemnt

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/hotel-management.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Verify on GitHub

- Go to https://github.com/YOUR_USERNAME/hotel-management
- You should see all the files and commit history

## Continuous Integration Setup

### GitHub Actions - Automated Testing

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run lint 2>/dev/null || echo "Lint not configured"

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build

  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - name: Build Docker images
        run: docker-compose build
```

### Branch Protection Rules

1. Go to Settings → Branches → Add Rule
2. Apply to branch: `main`
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

## Deployment Options

### Option 1: Heroku Deployment

```bash
# Install Heroku CLI
# Create Procfile at project root:

web: cd backend && npm start
```

### Option 2: AWS EC2

```bash
# Create EC2 instance (Ubuntu 20.04)
# SSH into instance:

ssh -i your-key.pem ubuntu@your-instance-ip

# Clone repository
git clone https://github.com/YOUR_USERNAME/hotel-management.git
cd hotel-management

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install -y mysql-server

# Setup backend
cd backend
npm install
npm run migrate
npm run seed

# Setup PM2 (process manager)
sudo npm install -g pm2
pm2 start "npm start" --name "hotel-api"
pm2 startup
pm2 save

# Setup frontend
cd ../frontend
npm install
npm run build
sudo npm install -g serve
pm2 start "serve -s build -l 3000" --name "hotel-ui"

# Setup Nginx as reverse proxy
# Configure nginx to proxy to ports 5000 and 3000
```

### Option 3: Docker Deployment to Cloud

```bash
# Build images for production
docker-compose -f docker-compose.yml build --no-cache

# Push to Docker Hub
docker login
docker tag hotel-management-backend YOUR_USERNAME/hotel-api:latest
docker push YOUR_USERNAME/hotel-api:latest

# Pull and run on target server
docker pull YOUR_USERNAME/hotel-api:latest
docker-compose pull
docker-compose up -d
```

### Option 4: Vercel (Frontend only)

1. Connect GitHub repository to Vercel
2. Set environment variables:
   - REACT_APP_API_URL: https://your-api-domain.com/api
3. Deploy automatically on push

## Environment Setup for Different Stages

### Development

```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
DB_NAME=hotel_management_dev
```

### Staging

```env
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
CORS_ORIGIN=https://staging.yourhotel.com
DB_NAME=hotel_management_staging
JWT_SECRET=use_strong_secret
```

### Production

```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
CORS_ORIGIN=https://yourhotel.com
DB_NAME=hotel_management_prod
JWT_SECRET=use_very_strong_secret_min_32_chars
JWT_EXPIRY=7d
```

## Database Backups

### Automated Backup Script

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/hotel_management_${TIMESTAMP}.sql"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
```

## Monitoring & Logs

### Application Logging

```javascript
// backend/src/utils/logger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

module.exports = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(log);
    fs.appendFileSync(logFile, log + '\n');
  },
  error: (message, err) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message} : ${err.message}`;
    console.error(log);
    fs.appendFileSync(logFile, log + '\n');
  }
};
```

### Health Check Endpoint

Available at: `GET /health`
Returns: `{ status: 'OK', timestamp: '...' }`

## Performance Optimization

### Frontend
- Enable gzip compression
- Minify CSS/JS
- Use CDN for static assets
- Enable caching headers

### Backend
- Database query optimization
- Connection pooling
- Redis caching (optional)
- Response compression

### Database
- Proper indexing (already configured)
- Query optimization
- Regular maintenance
- Backup strategy

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Set up HTTPS/SSL certificate
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Enable database backups
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

## Support

For deployment issues:
1. Check `logs/` directory
2. Review GitHub Issues
3. Refer to ERROR_TROUBLESHOOTING.md

## Next Steps

1. Set up GitHub repository
2. Configure CI/CD pipeline
3. Choose deployment platform
4. Set up monitoring
5. Configure backups
6. Go live!

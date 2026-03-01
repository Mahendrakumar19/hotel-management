# Troubleshooting & Error Guide

## Common Issues & Solutions

### Database Connection Errors

#### Error: "Access denied for user 'root'@'localhost'"

**Solution:**
1. Verify MySQL is running: `mysql -u root -p`
2. Update `backend/.env` with correct credentials
3. If MySQL isn't installed:
   - Windows: Download from https://dev.mysql.com/downloads/mysql/
   - Mac: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server`

#### Error: "Can't connect to MySQL server"

**Solution:**
1. Check if MySQL service is running:
   - Windows: Services app → Look for MySQL
   - Mac: `brew services list | grep mysql`
   - Linux: `sudo systemctl status mysql`
2. Start MySQL if not running:
   - Windows: `net start MySQL80` (adjust version number)
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

#### Error: "Unknown database 'hotel_management'"

**Solution:**
1. Create database manually:
   ```sql
   mysql -u root -p
   CREATE DATABASE hotel_management;
   ```
2. Run migration: `cd backend && npm run migrate`

### Backend (Node.js) Errors

#### Error: "Port 5000 already in use"

**Solution:**
Kill the process using port 5000:

```bash
# Linux/Mac
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell as Administrator)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

Then restart backend: `npm run dev`

#### Error: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
npm install
```

#### Error: "EACCES: permission denied"

**Solution (Linux/Mac):**
```bash
sudo chown -R $(whoami) .
npm install
```

### Frontend (React) Errors

#### Error: "Port 3000 already in use"

**Solution:**
```bash
# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Error: "Cannot find module 'react-router-dom'"

**Solution:**
```bash
cd frontend
npm install
```

#### Error: "Blank white screen after login"

**Solutions:**
1. Check browser console (F12) for errors
2. Verify REACT_APP_API_URL in `frontend/.env`
3. Check that backend is running on port 5000
4. Clear browser cache: Ctrl+Shift+Delete

### API Connection Issues

#### Error: "Failed to fetch from API"

**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check CORS configuration in `backend/server.js`
3. Verify REACT_APP_API_URL is correct in frontend
4. Check network tab in browser DevTools

#### Error: "401 Unauthorized"

**Solutions:**
1. Ensure valid login credentials
2. Check JWT token in localStorage: `localStorage.getItem('authToken')`
3. Verify JWT_SECRET in backend .env matches
4. Token may have expired - try logging out and back in

### Docker Issues

#### Error: "Docker command not found"

**Solution:**
Install Docker from https://www.docker.com/products/docker-desktop

#### Error: "MySQL container won't start"

**Solution:**
```bash
# Check logs
docker-compose logs mysql

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### NPM/Node Issues

#### Error: "npm: command not found"

**Solution:**
Install Node.js from https://nodejs.org/ (which includes npm)

#### Error: "node-gyp rebuild failed"

**Solution:**
```bash
# Install build tools
# Windows: Install Visual Studio Build Tools
# Mac: xcode-select --install
# Linux: sudo apt-get install build-essential

npm rebuild
```

## Performance Issues

### Application is slow

**Solutions:**
1. Check database indexes are created:
   ```bash
   cd backend && npm run migrate
   ```
2. Increase MySQL max_connections:
   ```sql
   SET GLOBAL max_connections = 1000;
   ```
3. Check available disk space
4. Monitor system RAM usage

### Database queries are slow

**Solutions:**
1. Run ANALYZE TABLE:
   ```sql
   ANALYZE TABLE rooms;
   ANALYZE TABLE reservations;
   -- etc for all tables
   ```
2. Check missing indexes in database schema
3. Verify connection pooling is configured
4. Check slow query log:
   ```sql
   SET GLOBAL slow_query_log = ON;
   SET GLOBAL long_query_time = 2; -- queries > 2 seconds
   ```

## Deployment Issues

### Application crashes after deployment

**Solutions:**
1. Check application logs in `logs/` folder
2. Verify environment variables are set correctly
3. Ensure database is accessible from server
4. Check disk space on server
5. Review PM2 logs: `pm2 logs`

### Permission denied errors

**Solution:**
```bash
# Fix file permissions
chmod -R 755 /path/to/app
chmod -R 755 /path/to/app/logs
```

### Database migrations failed on production

**Solution:**
```bash
# Backup database first
mysqldump -u user -p database > backup.sql

# Run migration manually
npm run migrate

# Verify data integrity
```

## Getting Help

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm start

# Frontend
REACT_APP_DEBUG=true npm start
```

### Check Logs

```bash
# Backend logs
tail -f backend/logs/app-*.log

# Browser console
F12 → Console tab → Check for errors
```

### System Information for Support

When reporting issues, provide:
```bash
# OS Info
uname -a  # Linux/Mac
systeminfo  # Windows

# Node/npm versions
node --version
npm --version

# Database version
mysql --version

# Git status
git status
git log --oneline -5
```

## Getting Professional Help

- Create an issue on GitHub with:
  - Exact error message
  - Steps to reproduce
  - System information
  - Log files
  - Screenshots

- Email: support@hotelmanagement.com
- Community Forum: https://forum.hotelmanagement.com

---

**Last Updated:** 2024
**Version:** 1.0.0

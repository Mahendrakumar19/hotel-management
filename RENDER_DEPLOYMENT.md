# Hotel Management System - Render Deployment Guide

## Deployment Steps

### 1. Backend Deployment (API Server)

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: hotel-management-api
   - **Environment**: Node
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Build Command**: `npm run build:backend`
   - **Start Command**: `npm start:backend`
   - **Plan**: Free tier (or paid for production)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<generate-a-secure-secret>
   DATABASE_PATH=./hotel_management.db
   CORS_ORIGIN=<your-frontend-url>
   ```

6. Deploy and note the service URL (e.g., `https://hotel-management-api.onrender.com`)

### 2. Frontend Deployment (React App)

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: hotel-management-web
   - **Branch**: main
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://hotel-management-api.onrender.com/api
   ```

6. Deploy and note the service URL (e.g., `https://hotel-management-web.onrender.com`)

### 3. Update Backend CORS

After frontend deployment, update your backend environment variable:
- Go to backend web service settings
- Update `CORS_ORIGIN` to match your frontend URL
- Redeploy

## Important Notes

- **Database**: The system uses SQLite with the database file stored in the service. For production, consider migrating to PostgreSQL.
- **Environment Variables**: Always use Render's environment variable feature, never commit `.env` files
- **Build Command**: Must install dependencies for both backend and frontend
- **Cold Starts**: Free tier services spin down after 15 minutes of inactivity

## Database Backup

With SQLite on Render's free tier, data persists in the instance file system, but you may want to:
1. Export data regularly
2. Consider PostgreSQL for production reliability
3. Implement backup scripts

## Troubleshooting

### Build Failed
- Check that npm scripts are correct in `package.json`
- Verify all dependencies are listed in `package.json`
- Check Node version compatibility (>= 20.0.0)

### CORS Errors
- Ensure `CORS_ORIGIN` environment variable matches frontend URL exactly (including protocol)
- Check backend middleware configuration

### Database Not Persisting
- SQLite data persists in the service instance
- For production, migrate to PostgreSQL
- Use Render PostgreSQL add-on for data persistence

## Scaling to Production

For production deployment:
1. Use PostgreSQL instead of SQLite
2. Add Redis for caching
3. Configure custom domain
4. Set up SSL/TLS certificates
5. Enable auto-scaling
6. Implement monitoring and logging
7. Regular backups and disaster recovery

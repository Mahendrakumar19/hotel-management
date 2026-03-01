# Quick Start Guide - Hotel Management System

## 5-Minute Setup

### Prerequisites
- Node.js 16+ installed
- MySQL running locally

### Step 1: Prepare Database (2 min)
```bash
# Open MySQL command line / MySQL Workbench and run:
CREATE DATABASE hotel_management;
```

### Step 2: Setup Backend (2 min)
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

**✓ Backend ready at http://localhost:5000**

### Step 3: Setup Frontend (1 min)
```bash
# In a NEW terminal/PowerShell window
cd frontend
npm install
npm run dev
```

**✓ Frontend ready at http://localhost:3000**

---

## Login with Demo Credentials

### Admin User
- Email: `admin@hotel.com`
- Password: `admin@123`
- Access: All features

### Front Desk User
- Email: `frontdesk1@hotel.com`
- Password: `frontdesk@123`
- Access: Reservations, Check-in/out, Rooms

### F&B Manager
- Email: `fb@hotel.com`
- Password: `fb@123`
- Access: Billing, Bill settlement

---

## Testing Core Workflows

### 1. Create a Reservation
1. Login with Front Desk credentials
2. Go to Reservations
3. Click "New Reservation"
4. Fill: Name, Phone, Check-in/out dates
5. Click "Create Reservation"

### 2. Check-In Guest
1. Go to Check-In/Out
2. Click "New Check-In"
3. Enter reservation number (shown in reservations)
4. Click "Check In"

### 3. Create F&B Bill
1. Login with F&B Manager
2. Go to Billing
3. Click "Load Open Bills"
4. Select a guest
5. Add items (e.g., "Biryani", qty: 2, rate: 300)
6. Click "Settle Bill"

### 4. View Reports
1. Login with Admin
2. Go to Reports
3. Select report type (Daily/Monthly/Revenue)
4. Click "Generate Report"

---

## API Testing (Postman / cURL)

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"admin@123"}'
```

**Note:** Use returned `token` in Authorization header for other requests:
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Rooms
```bash
curl http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Daily Report
```bash
curl "http://localhost:5000/api/reports/daily?date=2024-02-11" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Migration & Seeding

The system includes two npm scripts:

```bash
npm run migrate   # Creates all database tables
npm run seed      # Adds demo users and 20 rooms
```

**Database includes:**
- 20 rooms (10 standard @ ₹1500, 10 deluxe @ ₹2500)
- 3 demo users with different roles

---

## Project Structure Quick Reference

```
backend/
├── src/
│   ├── controllers/    ← Request handlers
│   ├── services/       ← Business logic
│   ├── routes/         ← API endpoints  
│   ├── database/       ← MySQL setup
│   └── middleware/     ← Auth & validation
│
frontend/
├── src/
│   ├── pages/         ← Login, Dashboard
│   ├── components/    ← Room, Reservation, Billing, Reports
│   ├── services/      ← API client (api.js)
│   └── styles/        ← CSS files
```

---

## Common Issues & Fixes

### ❌ Port 5000 already in use
```bash
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID 12345 /F
```

### ❌ Database connection failed
- Ensure MySQL is **running**
- Check `/backend/.env` credentials match your setup
- Run: `CREATE DATABASE hotel_management;`

### ❌ "Cannot POST /api/auth/login"
- Ensure backend is running on port 5000
- Check frontend `.env` has: `REACT_APP_API_URL=http://localhost:5000/api`

### ❌ Blank login page
- Check browser console for errors (F12)
- Ensure npm packages installed: `npm install`
- Clear browser cache and reload

---

## Next Steps After Setup

1. **Explore Dashboard** - Check room stats and occupancy
2. **Test Workflows** - Try reservation → check-in → billing flow
3. **Review Reports** - Verify daily revenue and occupancy metrics
4. **Database** - Connect DBeaver/pgAdmin to review data
5. **Customize** - Modify rates, policies, add your branding

---

## Performance Expected

- API responses: < 200ms
- Checkout process: < 10 seconds
- Room status updates: Real-time
- Concurrent users supported: 50+

---

## Production Deployment Checklist

- [ ] Change `.env` passwords and secrets
- [ ] Set `NODE_ENV=production`
- [ ] Use production database with backups
- [ ] Configure SSL certificates
- [ ] Setup monitoring & alerting
- [ ] Enable CORS with specific origins
- [ ] Implement rate limiting
- [ ] Setup CDN for static assets
- [ ] Enable database query logging
- [ ] Create operational procedures

---

## Support & Documentation

See `README.md` for:
- Full API documentation
- Architecture details
- Deployment guide
- Database schema
- Operational best practices

---

**Ready to use!** Your hotel management system is now live. 🏨

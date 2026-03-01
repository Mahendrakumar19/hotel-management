# Hotel Operations & F&B Management System

A production-ready, performance-oriented hotel management system designed for small to mid-sized Indian hospitality environments.

## Overview

This system provides:
- **Guest Reservations** - Advance bookings, walk-in guests
- **Check-In/Check-Out** - Guest arrival and departure management
- **Room Status Engine** - Real-time room tracking (Occupied, Dirty, Vacant)
- **F&B Billing** - Restaurant/Bar bill integration with guest ledger
- **Guest Ledger** - Running financial record of guest stay
- **Operational Reporting** - Daily, monthly, and analytical reports
- **Role-Based Access** - Admin, Front Desk, F&B Manager roles

## Tech Stack

- **Backend**: Node.js + Express.js (lightweight, high-performance)
- **Database**: MySQL (ACID compliance, superior performance)
- **Frontend**: React 18 (modern, efficient UI)
- **Authentication**: JWT tokens with role-based authorization

## Project Structure

```
hotel-managemnt/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, validation
│   │   ├── database/         # DB connection, migrations
│   │   └── server.js         # Main Express app
│   ├── package.json
│   └── .env                  # Environment variables
└── frontend/
    ├── src/
    │   ├── pages/            # Page components
    │   ├── components/       # Reusable components
    │   ├── services/         # API calls
    │   ├── styles/           # CSS files
    │   ├── App.js            # Main app
    │   └── index.js          # Entry point
    ├── public/
    │   └── index.html        # HTML template
    ├── package.json
    └── .env                  # Environment variables
```

## Prerequisites

- Node.js 16+ (https://nodejs.org/)
- MySQL 8.0+ (https://dev.mysql.com/downloads/mysql/)

## Installation & Setup

### 1. MySQL Setup

Create a new database:

```sql
CREATE DATABASE hotel_management;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed demo data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

**Demo Credentials after seeding:**
- Admin: admin@hotel.com / admin@123
- Front Desk: frontdesk1@hotel.com / frontdesk@123
- F&B Manager: fb@hotel.com / fb@123

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `GET /api/rooms/statistics` - Room statistics
- `GET /api/rooms/available` - Get available rooms for dates
- `PATCH /api/rooms/:id/status` - Update room status

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/:id` - Get reservation
- `GET /api/reservations/search` - Search reservations
- `GET /api/reservations/upcoming` - Upcoming reservations
- `PATCH /api/reservations/:id/status` - Update status
- `DELETE /api/reservations/:id/cancel` - Cancel reservation

### Guests
- `POST /api/guests` - Create guest
- `GET /api/guests/:id` - Get guest details
- `GET /api/guests/search` - Search guests
- `PATCH /api/guests/:id` - Update guest
- `GET /api/guests/:id/history` - Guest stay history

### Check-In/Check-Out
- `POST /api/check-ins` - Check in guest
- `POST /api/check-ins/checkout` - Check out guest
- `GET /api/check-ins/active` - Get active check-ins
- `GET /api/check-ins/:id` - Get check-in details
- `GET /api/check-ins/:id/summary` - Check-in summary
- `GET /api/check-ins/:id/ledger` - Guest ledger entries

### Billing
- `POST /api/bills` - Create bill
- `GET /api/bills/:id` - Get bill
- `GET /api/bills/open` - Get open bills
- `POST /api/bills/settle` - Settle bill
- `POST /api/bills/:id/item` - Add item to bill

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/guests/statistics` - Guest statistics

## Database Schema

### Core Tables
1. **users** - System users with roles
2. **guests** - Guest information
3. **rooms** - Room inventory
4. **reservations** - Guest reservations
5. **check_ins** - Guest stays
6. **bills** - F&B billing
7. **bill_items** - Individual bill line items
8. **guest_ledger** - Running guest account
9. **daily_reports** - Cached daily metrics
10. **audit_logs** - System activities

## Key Features

### Room Management
- Real-time room status tracking
- Occupancy rate calculations
- Available room queries for date ranges
- Room capacity and pricing

### Operational Workflow
```
Reservation → Check-In → Room Occupied
                             ↓
                        F&B Billing (optional)
                             ↓
                        Check-Out → Room Dirty → Staff Cleaning → Vacant
```

### Guest Ledger
- Automatic room charges on check-in
- F&B bill integration
- Payment tracking
- Balance calculation

### Reporting
- Daily occupancy and revenue reports
- Monthly trend analysis
- Guest analytics
- Payment method breakdown

## Performance Optimizations

1. **Database Indexes** - Optimized for fast queries
2. **Connection Pooling** - MySQL connection pool (max 10)
3. **Efficient Queries** - Aggregations and joins optimized
4. **API Response Caching** - Strategic data caching
5. **Frontend Lazy Loading** - Component and route splitting

## Security Features

1. **JWT Authentication** - Token-based auth with expiry
2. **Password Hashing** - bcryptjs for secure storage
3. **Role-Based Access** - Three-tier authorization
4. **Input Validation** - Express-validator on all inputs
5. **Error Handling** - Proper error messages without data leaks
6. **Audit Logging** - All critical actions logged

## Deployment Guide

### Backend Deployment (AWS/Azure/DigitalOcean)

```bash
# Production environment variables
NODE_ENV=production
PORT=5000
DB_HOST=production-database-host
DB_USER=production-user
DB_PASSWORD=secure-password
JWT_SECRET=strong-secret-key

# Start production server
npm start
```

### Frontend Deployment (Netlify/Vercel)

```bash
npm run build
```

Deploy the `build/` directory to your hosting platform.

## Performance Metrics (Target)

- **API Response Time**: <200ms (p95)
- **Database Query**: <100ms (p95)
- **Checkout Process**: <10 seconds
- **Concurrent Users**: 50+

## Maintenance

### Database Backups
```bash
pg_dump -U postgres hotel_management > backup.sql
```

### Log Rotation
Implement log rotation for production logs.

### Updates
```bash
npm update
npm audit fix
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Database Connection Issues
- Verify MySQL is running
- Check credentials in .env
- Verify firewall rules

### API CORS Errors
- Check frontend .env for correct API_URL
- Verify CORS headers in backend server.js

## Testing

```bash
# Backend
npm test

# Frontend
npm test
```

## License

Proprietary - For authorized use only.

## Support

For issues or feature requests, contact the development team.

---

## Operational Best Practices

1. **Daily Reconciliation** - Run daily reports at EOD
2. **Room Status** - Update status immediately after housekeeping
3. **Ledger Reviews** - Audit guest ledgers weekly
4. **Backup Schedule** - Daily database backups
5. **User Management** - Audit user access monthly

## Next Steps (Phase 2)

- OTA Integration (Booking.com, Agoda)
- SMS/Email Automation
- Advanced Analytics & Forecasting
- Multi-property Support
- Accounting Software Integration

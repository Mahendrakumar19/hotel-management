# Production Deployment & Setup Guide

## Hotel Management System - Complete Production Setup

A comprehensive hotel management solution for small to mid-sized hotels with complete F&B integration, room management, guest tracking, and financial reporting.

## Features

### Core Features
- ✅ **Room Management**: Real-time room status tracking (occupied, dirty, vacant)
- ✅ **Reservations**: Advance bookings, walk-in guest management
- ✅ **Guest Management**: Complete guest profiles with stay history
- ✅ **Check-in/Check-out**: Streamlined guest arrival and departure
- ✅ **F&B Billing**: Restaurant/bar bill integration
- ✅ **Payment Processing**: Multiple payment modes (cash, card, UPI, room charge)
- ✅ **Guest Ledger**: Running financial records
- ✅ **Reports**: Daily, monthly, occupancy, revenue, and guest analytics
- ✅ **Role-Based Access Control**: Admin, Front Desk, F&B Manager roles
- ✅ **Audit Logging**: Complete transaction tracking

## Quick Start

### Prerequisites
- Node.js 14+ 
- MySQL 5.7+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations and seed
npm run migrate
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies  
npm install

# Configure API URL
cp .env.example .env
# Edit .env - set REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Default Login Credentials

After seeding the database, use these credentials:

- **Admin**: admin@hotel.com / admin@123
- **Front Desk**: frontdesk1@hotel.com / frontdesk@123
- **F&B Manager**: fb@hotel.com / fb@123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get room details
- `PATCH /api/rooms/:id/status` - Update room status
- `GET /api/rooms/available` - Get available rooms

### Reservations
- `GET /api/reservations/upcoming` - Get upcoming reservations
- `GET /api/reservations/search` - Search reservations
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id/status` - Update reservation status
- `DELETE /api/reservations/:id/cancel` - Cancel reservation

### Guests
- `GET /api/guests` - List guests
- `POST /api/guests` - Create guest
- `GET /api/guests/:id` - Get guest details
- `PATCH /api/guests/:id` - Update guest
- `GET /api/guests/:id/history` - Get guest stay history

### Check-in/Check-out
- `POST /api/check-ins` - Check-in guest
- `POST /api/check-ins/checkout` - Check-out guest
- `GET /api/check-ins/active` - Get active check-ins
- `GET /api/check-ins/:id/ledger` - Get guest ledger

### Billing
- `GET /api/bills` - Get bills
- `POST /api/bills` - Create bill
- `POST /api/bills/settle` - Settle bill
- `GET /api/bills/open` - Get open bills

### Reports
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/revenue` - Revenue report

## Database Schema

The system uses MySQL with the following main tables:
- `users` - Staff accounts
- `guests` - Guest information
- `rooms` - Room inventory
- `reservations` - Booking records
- `check_ins` - Guest stays
- `bills` - F&B bills
- `bill_items` - Bill line items
- `guest_ledger` - Financial transactions
- `daily_reports` - Daily summaries
- `audit_logs` - System audit trail

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### AWS Deployment
Refer to DEPLOYMENT_AWS.md for step-by-step AWS deployment guide.

### Azure Deployment
Refer to DEPLOYMENT_AZURE.md for step-by-step Azure deployment guide.

## Configuration

### Environment Variables

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://your-api.com/api
```

## Project Structure

```
hotel-management/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation
│   │   ├── database/        # DB setup, migrations
│   │   └── server.js        # Express app
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # UI components
│   │   ├── services/        # API client
│   │   ├── styles/          # CSS
│   │   └── index.js
│   ├── package.json
│   └── .env
└── docker-compose.yml
```

## Development

### Adding New Features

1. **Backend**:
   - Create service in `src/services/`
   - Create controller in `src/controllers/`
   - Create routes in `src/routes/`

2. **Frontend**:
   - Create component in `src/components/`
   - Add API service in `src/services/api.js`
   - Add styling in `src/styles/`

### Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Performance Optimization

1. **Database Indexing**: All critical columns are indexed
2. **Connection Pooling**: MySQL connection pool configured
3. **Caching**: Frontend caching enabled
4. **API Response**: Paginated large responses
5. **Bundle Size**: Frontend optimized for production

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcryptjs
- SQL injection prevention (parameterized queries)
- CORS configuration
- Rate limiting ready
- Audit logging for all operations

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in .env
- Ensure database exists: `CREATE DATABASE hotel_management;`

### Frontend API Errors
- Check REACT_APP_API_URL in frontend .env
- Verify backend is running on correct port
- Check browser console for specific errors

### Port Already in Use
```bash
# Linux/Mac: Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## API Documentation

Full API documentation available at `/api-docs` when server is running (with Swagger setup).

## Support & Contributing

See CONTRIBUTING.md for guidelines

## License

MIT License - See LICENSE file

## Contact

For support or inquiries, contact: support@hotelmanagement.com

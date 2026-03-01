require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const guestRoutes = require('./routes/guestRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportingRoutes = require('./routes/reportingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/check-ins', checkInRoutes);
app.use('/api/bills', billingRoutes);
app.use('/api/reports', reportingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  Hotel Management System API          ║`);
  console.log(`║  Server running on port ${PORT}           ║`);
  const NODE_ENV = (process.env.NODE_ENV || 'development').toUpperCase();
  console.log(`║  Environment: ${NODE_ENV}           ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/rooms');
  console.log('  POST   /api/reservations');
  console.log('  GET    /api/guests');
  console.log('  POST   /api/check-ins');
  console.log('  POST   /api/bills');
  console.log('  GET    /api/reports/daily\n');
});

module.exports = app;

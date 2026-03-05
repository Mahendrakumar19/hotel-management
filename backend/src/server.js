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
const storeRequisitionRoutes = require('./routes/storeRequisitionRoutes');
const purchaseGrnRoutes = require('./routes/purchaseGrnRoutes');

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
app.use('/api/store-requisitions', storeRequisitionRoutes);
app.use('/api/purchase-grn', purchaseGrnRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server with error handling for EADDRINUSE
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
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
  console.log('  GET    /api/reports/daily');
  console.log('  POST   /api/store-requisitions');
  console.log('  GET    /api/store-requisitions');
  console.log('  POST   /api/purchase-grn');
  console.log('  GET    /api/purchase-grn\n');
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another server may be running.`);
    console.error('Resolve by stopping the process holding the port, or set PORT env variable to a free port.');
    process.exit(1);
  }
  console.error('Server error:', err);
});

module.exports = app;

const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const reportingController = require('../controllers/reportingController');

const router = express.Router();

// All reporting routes require authentication
router.use(authMiddleware);

// Reporting requires admin or specific roles
router.get('/daily', roleMiddleware('admin', 'front_desk'), reportingController.getDailyReport);

router.get('/monthly', roleMiddleware('admin', 'front_desk'), reportingController.getMonthlyReport);

router.get('/occupancy', roleMiddleware('admin', 'front_desk'), reportingController.getOccupancyReport);

router.get('/revenue', roleMiddleware('admin', 'front_desk'), reportingController.getRevenueReport);

router.get('/guests/statistics', roleMiddleware('admin', 'front_desk'), reportingController.getGuestStatistics);

router.get('/guests/top-spenders', roleMiddleware('admin', 'front_desk'), reportingController.getTopSpendingGuests);

module.exports = router;

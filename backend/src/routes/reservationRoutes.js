const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

// All reservation routes require authentication
router.use(authMiddleware);

// Search reservations
router.get('/search', reservationController.searchReservations);

// Get reservation by reservation number
router.get('/by-number/:number', reservationController.getReservationByNumber);

// Get upcoming reservations
router.get('/upcoming', reservationController.getUpcomingReservations);

// Create new reservation (front desk and admin only)
router.post('/', roleMiddleware('front_desk', 'admin'), reservationController.createReservation);

// Get single reservation
router.get('/:id', reservationController.getReservationById);

// Update reservation status (front desk and admin only)
router.patch('/:id/status', roleMiddleware('front_desk', 'admin'), reservationController.updateReservationStatus);

// Cancel reservation (front desk and admin only)
router.delete('/:id/cancel', roleMiddleware('front_desk', 'admin'), reservationController.cancelReservation);

module.exports = router;

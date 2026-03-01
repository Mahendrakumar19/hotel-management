const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const guestController = require('../controllers/guestController');

const router = express.Router();

// All guest routes require authentication
router.use(authMiddleware);

// Search guests
router.get('/search', guestController.searchGuests);

// Get frequent guests
router.get('/frequent', guestController.getFrequentGuests);

// Create new guest (front desk and admin only)
router.post('/', roleMiddleware('front_desk', 'admin'), guestController.createGuest);

// Get single guest
router.get('/:id', guestController.getGuestById);

// Get guest history
router.get('/:id/history', guestController.getGuestHistory);

// Update guest (front desk and admin only)
router.patch('/:id', roleMiddleware('front_desk', 'admin'), guestController.updateGuest);

module.exports = router;

const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

const router = express.Router();

// All billing routes require authentication
router.use(authMiddleware);

// Get open bills
router.get('/open', billingController.getOpenBills);

// Get daily billing report
router.get('/report/daily', billingController.getDailyBillingReport);

// Create new bill (F&B and admin only)
router.post('/', roleMiddleware('f_and_b', 'admin'), billingController.createBill);

// Get single bill
router.get('/:id', billingController.getBillById);

// Get guest bills
router.get('/guest/:guestId', billingController.getGuestBills);

// Settle bill (F&B and admin only)
router.post('/settle', roleMiddleware('f_and_b', 'admin'), billingController.settleBill);

// Add item to bill (F&B and admin only)
router.post('/:billId/item', roleMiddleware('f_and_b', 'admin'), billingController.addItemToBill);

module.exports = router;

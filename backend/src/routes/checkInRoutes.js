const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const checkInController = require('../controllers/checkInController');

const router = express.Router();

// All check-in routes require authentication
router.use(authMiddleware);

// Get active check-ins
router.get('/active', checkInController.getActiveCheckIns);

// Check-in guest (front desk only)
router.post('/', roleMiddleware('front_desk', 'admin'), checkInController.checkInGuest);

// Check-out guest (front desk only)
router.post('/checkout', roleMiddleware('front_desk', 'admin'), checkInController.checkOutGuest);

// Get specific check-in
router.get('/:id', checkInController.getCheckInById);

// Get check-in summary
router.get('/:checkInId/summary', checkInController.getCheckInSummary);

// Get guest ledger for check-in
router.get('/:checkInId/ledger', checkInController.getGuestLedger);

// Add ledger entry
router.post('/ledger/entry', roleMiddleware('front_desk', 'admin'), checkInController.addLedgerEntry);

module.exports = router;

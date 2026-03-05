const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const roomController = require('../controllers/roomController');

const router = express.Router();

// All room routes require authentication
router.use(authMiddleware);

// Get all rooms or filtered by status
router.get('/', roomController.getAllRooms);

// Get room statistics
router.get('/statistics', roomController.getRoomStatistics);

// Get available rooms for specific dates
router.get('/available', roomController.getAvailableRooms);

// Create new room (admin only)
router.post('/', roleMiddleware('admin'), roomController.createRoom);

// Get single room
router.get('/:id', roomController.getRoomById);

// Update room status (admin and front desk only)
router.patch('/:id/status', roleMiddleware('admin', 'front_desk'), roomController.updateRoomStatus);

module.exports = router;

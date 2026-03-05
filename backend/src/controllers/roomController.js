const roomService = require('../services/roomService');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const { roomNumber, roomType, capacity, baseRate, status } = req.body;

      if (!roomNumber || !roomType || !capacity || !baseRate) {
        return res.status(400).json({ error: 'roomNumber, roomType, capacity and baseRate are required' });
      }

      const room = await roomService.createRoom(
        roomNumber,
        roomType,
        parseInt(capacity, 10),
        parseFloat(baseRate),
        status || 'vacant'
      );

      res.status(201).json({ message: 'Room created successfully', room });
    } catch (error) {
      next(error);
    }
  }
  async getAllRooms(req, res, next) {
    try {
      const { status } = req.query;
      const rooms = await roomService.getAllRooms(status);
      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);
      res.status(200).json(room);
    } catch (error) {
      if (error.message === 'Room not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async updateRoomStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const room = await roomService.updateRoomStatus(id, status);
      res.status(200).json(room);
    } catch (error) {
      if (error.message === 'Invalid room status' || error.message === 'Room not found') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  async getRoomStatistics(req, res, next) {
    try {
      const stats = await roomService.getRoomStatistics();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableRooms(req, res, next) {
    try {
      const { checkInDate, checkOutDate, capacity } = req.query;

      if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ error: 'Check-in and check-out dates required' });
      }

      const rooms = await roomService.getAvailableRooms(checkInDate, checkOutDate, capacity || 1);
      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();

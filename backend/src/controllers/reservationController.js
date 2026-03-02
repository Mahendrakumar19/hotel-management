const reservationService = require('../services/reservationService');
const guestService = require('../services/guestService');

class ReservationController {
  async createReservation(req, res, next) {
    try {
      const { guestId, roomId, checkInDate, checkOutDate, numberOfGuests, advancePayment, notes } = req.body;

      if (!guestId || !checkInDate || !checkOutDate || !roomId) {
        return res.status(400).json({ error: 'Missing required fields: guestId, roomId, checkInDate, checkOutDate' });
      }

      if (roomId.trim() === '') {
        return res.status(400).json({ error: 'Room selection is required' });
      }

      const reservation = await reservationService.createReservation(
        guestId,
        roomId,
        checkInDate,
        checkOutDate,
        numberOfGuests || 1,
        advancePayment || 0,
        req.user.id,
        notes
      );

      res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
      next(error);
    }
  }

  async getReservationById(req, res, next) {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservationById(id);
      res.status(200).json(reservation);
    } catch (error) {
      if (error.message === 'Reservation not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async searchReservations(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const reservations = await reservationService.searchReservations(query);
      res.status(200).json(reservations);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingReservations(req, res, next) {
    try {
      const { days } = req.query;
      const reservations = await reservationService.getUpcomingReservations(days || 7);
      res.status(200).json(reservations);
    } catch (error) {
      next(error);
    }
  }

  async updateReservationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const reservation = await reservationService.updateReservationStatus(id, status);
      res.status(200).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelReservation(req, res, next) {
    try {
      const { id } = req.params;
      const reservation = await reservationService.cancelReservation(id);
      res.status(200).json({ message: 'Reservation cancelled', reservation });
    } catch (error) {
      next(error);
    }
  }

  async getReservationByNumber(req, res, next) {
    try {
      const { number } = req.params;
      const reservation = await reservationService.getReservationByNumber(number);
      res.status(200).json(reservation);
    } catch (error) {
      if (error.message === 'Reservation not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new ReservationController();

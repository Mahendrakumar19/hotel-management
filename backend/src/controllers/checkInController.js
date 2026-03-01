const checkInService = require('../services/checkInService');

class CheckInController {
  async checkInGuest(req, res, next) {
    try {
      const { reservationId, roomId, guestId, notes } = req.body;

      if (!reservationId || !roomId || !guestId) {
        return res.status(400).json({ error: 'Reservation ID, room ID, and guest ID required' });
      }

      const checkIn = await checkInService.checkInGuest(reservationId, roomId, guestId, req.user.id, notes);
      res.status(201).json({ message: 'Guest checked in successfully', checkIn });
    } catch (error) {
      next(error);
    }
  }

  async checkOutGuest(req, res, next) {
    try {
      const { checkInId } = req.body;

      if (!checkInId) {
        return res.status(400).json({ error: 'Check-in ID required' });
      }

      const result = await checkInService.checkOutGuest(checkInId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getActiveCheckIns(req, res, next) {
    try {
      const checkIns = await checkInService.getActiveCheckIns();
      res.status(200).json(checkIns);
    } catch (error) {
      next(error);
    }
  }

  async getCheckInById(req, res, next) {
    try {
      const { id } = req.params;
      const checkIn = await checkInService.getCheckInById(id);
      res.status(200).json(checkIn);
    } catch (error) {
      if (error.message === 'Check-in record not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async getGuestLedger(req, res, next) {
    try {
      const { checkInId } = req.params;
      const ledger = await checkInService.getGuestLedger(checkInId);
      res.status(200).json(ledger);
    } catch (error) {
      next(error);
    }
  }

  async addLedgerEntry(req, res, next) {
    try {
      const { checkInId, guestId, roomId, entryType, description, amount } = req.body;

      if (!checkInId || !guestId || !roomId || !entryType || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const entry = await checkInService.addLedgerEntry(
        checkInId,
        guestId,
        roomId,
        entryType,
        description,
        amount
      );

      res.status(201).json({ message: 'Ledger entry added', entry });
    } catch (error) {
      next(error);
    }
  }

  async getCheckInSummary(req, res, next) {
    try {
      const { checkInId } = req.params;
      const summary = await checkInService.getCheckInSummary(checkInId);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckInController();

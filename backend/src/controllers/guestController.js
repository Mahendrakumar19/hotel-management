const guestService = require('../services/guestService');

class GuestController {
  async createGuest(req, res, next) {
    try {
      const { firstName, lastName, phone, email, idType, idNumber, address, city, state, country } = req.body;

      if (!firstName || !lastName || !phone) {
        return res.status(400).json({ error: 'First name, last name, and phone required' });
      }

      const guest = await guestService.createGuest(
        firstName,
        lastName,
        phone,
        email,
        idType,
        idNumber,
        address,
        city,
        state,
        country
      );

      res.status(201).json({ message: 'Guest created successfully', guest });
    } catch (error) {
      next(error);
    }
  }

  async getGuestById(req, res, next) {
    try {
      const { id } = req.params;
      const guest = await guestService.getGuestById(id);
      res.status(200).json(guest);
    } catch (error) {
      if (error.message === 'Guest not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async searchGuests(req, res, next) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const guests = await guestService.searchGuests(query);
      res.status(200).json(guests);
    } catch (error) {
      next(error);
    }
  }

  async getGuestHistory(req, res, next) {
    try {
      const { id } = req.params;
      const history = await guestService.getGuestHistory(id);
      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  async updateGuest(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No data to update' });
      }

      const guest = await guestService.updateGuest(id, updateData);
      res.status(200).json({ message: 'Guest updated successfully', guest });
    } catch (error) {
      next(error);
    }
  }

  async getFrequentGuests(req, res, next) {
    try {
      const { limit } = req.query;
      const guests = await guestService.getFrequentGuests(limit || 10);
      res.status(200).json(guests);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GuestController();

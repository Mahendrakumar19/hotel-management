const billingService = require('../services/billingService');

class BillingController {
  async createBill(req, res, next) {
    try {
      const { guestId, roomId, settlementMode, items } = req.body;

      if (!guestId || !roomId || !settlementMode) {
        return res.status(400).json({ error: 'Guest ID, room ID, and settlement mode required' });
      }

      const bill = await billingService.createBill(guestId, roomId, settlementMode, req.user.id, items || []);
      res.status(201).json({ message: 'Bill created successfully', bill });
    } catch (error) {
      next(error);
    }
  }

  async getBillById(req, res, next) {
    try {
      const { id } = req.params;
      const bill = await billingService.getBillById(id);
      res.status(200).json(bill);
    } catch (error) {
      if (error.message === 'Bill not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async settleBill(req, res, next) {
    try {
      const { billId } = req.body;

      if (!billId) {
        return res.status(400).json({ error: 'Bill ID required' });
      }

      const bill = await billingService.settleBill(billId, req.user.id);
      res.status(200).json({ message: 'Bill settled successfully', bill });
    } catch (error) {
      next(error);
    }
  }

  async getOpenBills(req, res, next) {
    try {
      const { guestId } = req.query;
      const bills = await billingService.getOpenBills(guestId);
      res.status(200).json(bills);
    } catch (error) {
      next(error);
    }
  }

  async getGuestBills(req, res, next) {
    try {
      const { guestId } = req.params;
      const bills = await billingService.getGuestBills(guestId);
      res.status(200).json(bills);
    } catch (error) {
      next(error);
    }
  }

  async addItemToBill(req, res, next) {
    try {
      const { billId, itemName, quantity, rate } = req.body;

      if (!billId || !itemName || !quantity || !rate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await billingService.addItemToBill(billId, itemName, quantity, rate);
      res.status(200).json({ message: 'Item added to bill', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getDailyBillingReport(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date required' });
      }

      const report = await billingService.getDailyBillingReport(date);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillingController();

const reportingService = require('../services/reportingService');

class ReportingController {
  async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date required' });
      }

      const report = await reportingService.getDailyReport(date);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month required' });
      }

      const report = await reportingService.getMonthlyReport(year, month);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getOccupancyReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date required' });
      }

      const report = await reportingService.getOccupancyReport(startDate, endDate);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date required' });
      }

      const report = await reportingService.getRevenueReport(startDate, endDate);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  async getGuestStatistics(req, res, next) {
    try {
      const stats = await reportingService.getGuestStatistics();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getTopSpendingGuests(req, res, next) {
    try {
      const { limit } = req.query;
      const guests = await reportingService.getTopSpendingGuests(limit || 10);
      res.status(200).json(guests);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportingController();

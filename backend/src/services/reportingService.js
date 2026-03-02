const pool = require('../database/connection');

class ReportingService {
  async getDailyReport(date) {
    try {
      // Get room statistics
      const roomStats = await pool.query(
        `SELECT 
          COUNT(*) as total_rooms,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
          SUM(CASE WHEN status = 'dirty' THEN 1 ELSE 0 END) as dirty_rooms,
          ROUND(
            SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2
          ) as occupancy_rate
         FROM rooms`
      );

      // Get revenue data
      const revenueData = await pool.query(
        `SELECT 
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END), 0) as cash_revenue,
          COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END), 0) as card_revenue,
          COALESCE(SUM(CASE WHEN payment_method = 'upi' THEN total ELSE 0 END), 0) as upi_revenue,
          COALESCE(SUM(CASE WHEN payment_method = 'other' THEN total ELSE 0 END), 0) as other_revenue,
          COUNT(*) as total_bills
         FROM bills
         WHERE DATE(created_at) = ?`,
        [date]
      );

      // Get check-in/out data for the day
      const occupancyData = await pool.query(
        `SELECT 
          COUNT(CASE WHEN DATE(check_in_time) = ? THEN 1 END) as check_ins_today,
          COUNT(CASE WHEN DATE(check_out_time) = ? THEN 1 END) as check_outs_today
         FROM check_ins
         WHERE DATE(check_in_time) = ? OR DATE(check_out_time) = ?`,
        [date, date, date, date]
      );

      return {
        date,
        rooms: roomStats[0][0],
        revenue: revenueData[0][0],
        occupancy: occupancyData[0][0]
      };
    } catch (error) {
      throw error;
    }
  }

  async getMonthlyReport(year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      const result = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(total), 0) as total_revenue,
          COUNT(*) as bills_count
         FROM bills
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      // Calculate totals
      const totals = await pool.query(
        `SELECT 
          COALESCE(SUM(total), 0) as total_revenue,
          COUNT(*) as total_bills,
          AVG(total) as average_bill_amount
         FROM bills
         WHERE created_at >= ? AND created_at <= ?`,
        [startDate, endDate]
      );

      return {
        month,
        year,
        daily_breakdown: result[0],
        totals: totals[0][0]
      };
    } catch (error) {
      throw error;
    }
  }

  async getOccupancyReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
          DATE(check_in_time) as date,
          COUNT(CASE WHEN check_out_time IS NULL THEN 1 END) as currently_occupied,
          COUNT(CASE WHEN DATE(check_in_time) = DATE(check_in_time) THEN 1 END) as daily_check_ins
         FROM check_ins
         WHERE check_in_time >= ? AND check_in_time <= ?
         GROUP BY DATE(check_in_time)
         ORDER BY date ASC`,
        [startDate, endDate]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getRevenueReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
          DATE(created_at) as date,
          payment_method,
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as transaction_count
         FROM bills
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY DATE(created_at), payment_method
         ORDER BY date DESC, payment_method ASC`,
        [startDate, endDate]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getGuestStatistics() {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_guests,
          COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL 30 DAY THEN id END) as guests_last_30_days,
          (SELECT COUNT(DISTINCT guest_id) FROM reservations WHERE status = 'confirmed') as upcoming_guests
         FROM guests`
      );

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getTopSpendingGuests(limit = 10) {
    try {
      const result = await pool.query(
        `SELECT 
          g.id, g.first_name, g.last_name, g.phone,
          COUNT(r.id) as stay_count,
          COALESCE(SUM(gl.amount), 0) as total_spent
         FROM guests g
         LEFT JOIN reservations r ON r.guest_id = g.id
         LEFT JOIN guest_ledger gl ON gl.guest_id = g.id
         GROUP BY g.id
         ORDER BY total_spent DESC
         LIMIT ?`,
        [limit]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReportingService();

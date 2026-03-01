const pool = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class BillingService {
  async createBill(guestId, roomId, settlementMode, userId, items = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const billId = uuidv4();
      let totalAmount = 0;

      // Create bill
      await conn.query(
        `INSERT INTO bills (id, bill_number, guest_id, room_id, settlement_mode, bill_status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [billId, billNumber, guestId, roomId, settlementMode, 'open', userId]
      );

      const billResult = await conn.query(
        'SELECT * FROM bills WHERE id = ?',
        [billId]
      );

      // Add bill items
      for (const item of items) {
        const itemTotal = item.quantity * item.rate;
        totalAmount += itemTotal;

        await conn.query(
          `INSERT INTO bill_items (bill_id, item_name, quantity, rate, total)
           VALUES (?, ?, ?, ?, ?)`,
          [billId, item.itemName, item.quantity, item.rate, itemTotal]
        );
      }

      // Update bill total
      await conn.query(
        `UPDATE bills SET total_amount = ? WHERE id = ?`,
        [totalAmount, billId]
      );

      await conn.commit();
      return { ...billResult[0][0], total_amount: totalAmount };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getBillById(billId) {
    try {
      const billResult = await pool.query(
        'SELECT * FROM bills WHERE id = ?',
        [billId]
      );

      if (billResult[0].length === 0) {
        throw new Error('Bill not found');
      }

      const bill = billResult[0][0];

      const itemsResult = await pool.query(
        'SELECT * FROM bill_items WHERE bill_id = ?',
        [billId]
      );

      bill.items = itemsResult[0];
      return bill;
    } catch (error) {
      throw error;
    }
  }

  async settleBill(billId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE bills
         SET bill_status = ?, settled_by = ?, settled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        ['settled', userId, billId]
      );

      const result = await conn.query(
        'SELECT * FROM bills WHERE id = ?',
        [billId]
      );

      if (result[0].length === 0) {
        throw new Error('Bill not found');
      }

      await conn.commit();
      return result[0][0];
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getOpenBills(guestId = null) {
    try {
      let query = 'SELECT * FROM bills WHERE bill_status = ?';
      const params = ['open'];

      if (guestId) {
        query += ' AND guest_id = ?';
        params.push(guestId);
      }

      query += ' ORDER BY created_at DESC';
      const result = await pool.query(query, params);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getGuestBills(guestId) {
    try {
      const result = await pool.query(
        `SELECT b.*, u.name as created_by_name
         FROM bills b
         LEFT JOIN users u ON u.id = b.created_by
         WHERE b.guest_id = ?
         ORDER BY b.created_at DESC`,
        [guestId]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async addItemToBill(billId, itemName, quantity, rate) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const itemTotal = quantity * rate;

      // Add item
      await conn.query(
        `INSERT INTO bill_items (bill_id, item_name, quantity, rate, total)
         VALUES (?, ?, ?, ?, ?)`,
        [billId, itemName, quantity, rate, itemTotal]
      );

      // Recalculate bill total
      const totalResult = await conn.query(
        'SELECT SUM(total) FROM bill_items WHERE bill_id = ?',
        [billId]
      );

      const newTotal = totalResult[0][0].sum || 0;

      await conn.query(
        'UPDATE bills SET total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newTotal, billId]
      );

      await conn.commit();
      return { success: true, newTotal };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getDailyBillingReport(date) {
    try {
      const result = await pool.query(
        `SELECT 
          SUM(total_amount) as total_revenue,
          COUNT(*) as total_bills,
          SUM(CASE WHEN settlement_mode = 'cash' THEN total_amount ELSE 0 END) as cash_revenue,
          SUM(CASE WHEN settlement_mode = 'card' THEN total_amount ELSE 0 END) as card_revenue,
          SUM(CASE WHEN settlement_mode = 'upi' THEN total_amount ELSE 0 END) as upi_revenue,
          SUM(CASE WHEN settlement_mode = 'room_charge' THEN total_amount ELSE 0 END) as room_charge_revenue
         FROM bills
         WHERE DATE(created_at) = ?`,
        [date]
      );

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BillingService();

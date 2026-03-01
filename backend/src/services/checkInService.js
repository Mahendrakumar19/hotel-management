const pool = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class CheckInService {
  async checkInGuest(reservationId, roomId, guestId, userId, notes = '') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create check-in record
      const checkInId = uuidv4();
      await conn.query(
        `INSERT INTO check_ins (id, reservation_id, room_id, guest_id, check_in_time, checked_in_by, notes)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)`,
        [checkInId, reservationId, roomId, guestId, userId, notes]
      );

      const checkInResult = await conn.query(
        'SELECT * FROM check_ins WHERE id = ?',
        [checkInId]
      );

      // Update room status to occupied
      await conn.query(
        'UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['occupied', roomId]
      );

      // Update reservation status to checked_in
      await conn.query(
        'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['checked_in', reservationId]
      );

      // Get room rate for ledger entry
      const roomResult = await conn.query(
        'SELECT base_rate FROM rooms WHERE id = ?',
        [roomId]
      );

      const roomRate = roomResult[0][0]?.base_rate || 0;

      // Create initial ledger entry for room charge
      await conn.query(
        `INSERT INTO guest_ledger (check_in_id, guest_id, room_id, entry_type, description, amount, balance, source_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [checkInId, guestId, roomId, 'room_charge', 'Room charge - 1 night', roomRate, roomRate, 'room_charge']
      );

      await conn.commit();
      return checkInResult[0][0];
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async checkOutGuest(checkInId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Get check-in details
      const checkInResult = await conn.query(
        'SELECT * FROM check_ins WHERE id = ?',
        [checkInId]
      );

      if (checkInResult[0].length === 0) {
        throw new Error('Check-in record not found');
      }

      const checkIn = checkInResult[0][0];

      // Update check-in record
      await conn.query(
        `UPDATE check_ins 
         SET check_out_time = CURRENT_TIMESTAMP, actual_checkout_date = CURDATE(), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [checkInId]
      );

      // Update room status to dirty
      await conn.query(
        'UPDATE rooms SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['dirty', checkIn.room_id]
      );

      // Update reservation status to checked_out
      await conn.query(
        'UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['checked_out', checkIn.reservation_id]
      );

      await conn.commit();
      return { success: true, message: 'Guest checked out successfully' };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getActiveCheckIns() {
    try {
      const result = await pool.query(
        `SELECT ci.*, g.first_name, g.last_name, g.phone, rm.room_number, rm.base_rate
         FROM check_ins ci
         INNER JOIN guests g ON g.id = ci.guest_id
         INNER JOIN rooms rm ON rm.id = ci.room_id
         WHERE ci.check_out_time IS NULL
         ORDER BY ci.check_in_time ASC`
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getCheckInById(checkInId) {
    try {
      const result = await pool.query(
        `SELECT ci.*, g.first_name, g.last_name, g.phone, g.email, rm.room_number, rm.base_rate
         FROM check_ins ci
         INNER JOIN guests g ON g.id = ci.guest_id
         INNER JOIN rooms rm ON rm.id = ci.room_id
         WHERE ci.id = ?`,
        [checkInId]
      );

      if (result[0].length === 0) {
        throw new Error('Check-in record not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getGuestLedger(checkInId) {
    try {
      const result = await pool.query(
        `SELECT * FROM guest_ledger
         WHERE check_in_id = ?
         ORDER BY created_at ASC`,
        [checkInId]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async addLedgerEntry(checkInId, guestId, roomId, entryType, description, amount, sourceId = null, sourceType = null) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Get current balance
      const balanceResult = await conn.query(
        `SELECT balance FROM guest_ledger
         WHERE check_in_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [checkInId]
      );

      const currentBalance = balanceResult[0][0]?.balance || 0;
      let newBalance = currentBalance;

      if (entryType === 'payment') {
        newBalance = currentBalance - amount;
      } else {
        newBalance = currentBalance + amount;
      }

      const entryId = require('uuid').v4();
      await conn.query(
        `INSERT INTO guest_ledger (id, check_in_id, guest_id, room_id, entry_type, description, amount, balance, source_id, source_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [entryId, checkInId, guestId, roomId, entryType, description, amount, newBalance, sourceId, sourceType]
      );

      await conn.commit();
      
      const result = await pool.query(
        'SELECT * FROM guest_ledger WHERE id = ?',
        [entryId]
      );
      return result[0][0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCheckInSummary(checkInId) {
    try {
      const result = await pool.query(
        `SELECT 
          ci.id,
          g.first_name, g.last_name, g.phone,
          rm.room_number, rm.base_rate,
          ci.check_in_time,
          ci.check_out_time,
          (SELECT SUM(amount) FROM guest_ledger WHERE check_in_id = ci.id AND entry_type != 'payment') as total_charges,
          (SELECT SUM(amount) FROM guest_ledger WHERE check_in_id = ci.id AND entry_type = 'payment') as total_payments,
          (SELECT balance FROM guest_ledger WHERE check_in_id = ci.id ORDER BY created_at DESC LIMIT 1) as current_balance
         FROM check_ins ci
         INNER JOIN guests g ON g.id = ci.guest_id
         INNER JOIN rooms rm ON rm.id = ci.room_id
         WHERE ci.id = ?`,
        [checkInId]
      );

      if (result[0].length === 0) {
        throw new Error('Check-in not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CheckInService();

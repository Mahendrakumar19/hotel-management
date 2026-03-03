const pool = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class ReservationService {
  async createReservation(guestId, roomId, checkInDate, checkOutDate, numberOfGuests, advancePayment, userId, notes = '') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Validate user exists only if userId is provided
      if (userId) {
        console.log('DEBUG: Validating user with ID:', userId);
        const userExists = await conn.query('SELECT id FROM users WHERE id = ?', [userId]);
        console.log('DEBUG: User query result:', userExists);
        
        if (!userExists[0] || userExists[0].length === 0) {
          throw new Error(`Invalid user ID - user does not exist (ID: ${userId})`);
        }
      } else {
        console.log('DEBUG: No userId provided, using system/anonymous creator');
      }

      // Validate room exists and is available
      if (roomId && roomId.trim() !== '') {
        const roomExists = await conn.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
        if (!roomExists[0] || roomExists[0].length === 0) {
          throw new Error('Invalid room ID - room does not exist');
        }
      }

      // Generate reservation number
      const reservationNumber = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const reservationId = uuidv4();

      await conn.query(
        `INSERT INTO reservations 
         (id, guest_id, room_id, check_in_date, check_out_date, number_of_guests, advance_payment, reservation_number, status, created_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reservationId, guestId, roomId, checkInDate, checkOutDate, numberOfGuests, advancePayment, reservationNumber, 'confirmed', userId, notes]
      );

      await conn.commit();

      const result = await pool.query(
        `SELECT r.*, g.first_name, g.last_name, g.email, g.phone, rm.room_number, rm.base_rate
         FROM reservations r
         INNER JOIN guests g ON g.id = r.guest_id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.id = ?`,
        [reservationId]
      );

      return result[0][0];
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getReservationById(reservationId) {
    try {
      const result = await pool.query(
        `SELECT r.*, g.first_name, g.last_name, g.email, g.phone, rm.room_number, rm.base_rate
         FROM reservations r
         INNER JOIN guests g ON g.id = r.guest_id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.id = ?`,
        [reservationId]
      );

      if (result[0].length === 0) {
        throw new Error('Reservation not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getReservationByNumber(reservationNumber) {
    try {
      const result = await pool.query(
        `SELECT r.*, g.first_name, g.last_name, g.email, g.phone, rm.room_number, rm.base_rate
         FROM reservations r
         INNER JOIN guests g ON g.id = r.guest_id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.reservation_number = ?`,
        [reservationNumber]
      );

      if (result[0].length === 0) {
        throw new Error('Reservation not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingReservations(days = 7) {
    try {
      const result = await pool.query(
        `SELECT r.*, g.first_name, g.last_name, g.phone, rm.room_number
         FROM reservations r
         INNER JOIN guests g ON g.id = r.guest_id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.check_in_date >= CURRENT_DATE
         AND r.check_in_date <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
         AND r.status != 'cancelled'
         ORDER BY r.check_in_date ASC`,
        [days]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateReservationStatus(reservationId, newStatus) {
    try {
      const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid reservation status');
      }

      await pool.query(
        `UPDATE reservations
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newStatus, reservationId]
      );

      const result = await pool.query(
        'SELECT * FROM reservations WHERE id = ?',
        [reservationId]
      );

      if (result[0].length === 0) {
        throw new Error('Reservation not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async cancelReservation(reservationId) {
    try {
      return await this.updateReservationStatus(reservationId, 'cancelled');
    } catch (error) {
      throw error;
    }
  }

  async searchReservations(query) {
    try {
      const searchQuery = `%${query}%`;
      const result = await pool.query(
        `SELECT r.*, g.first_name, g.last_name, g.phone, rm.room_number
         FROM reservations r
         INNER JOIN guests g ON g.id = r.guest_id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.reservation_number LIKE ?
         OR g.first_name LIKE ?
         OR g.last_name LIKE ?
         OR g.phone LIKE ?
         ORDER BY r.created_at DESC
         LIMIT 20`,
        [searchQuery, searchQuery, searchQuery, searchQuery]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReservationService();

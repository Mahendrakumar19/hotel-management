const pool = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class GuestService {
  async createGuest(firstName, lastName, phone, email = null, idType = 'passport', idNumber = null, address = null, city = null, state = null, country = null) {
    try {
      const guestId = uuidv4();

      await pool.query(
        `INSERT INTO guests (id, first_name, last_name, email, phone, id_type, id_number, address, city, state, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [guestId, firstName, lastName, email, phone, idType, idNumber, address, city, state, country]
      );

      const result = await pool.query(
        'SELECT * FROM guests WHERE id = ?',
        [guestId]
      );

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getGuestById(guestId) {
    try {
      const result = await pool.query(
        'SELECT * FROM guests WHERE id = ?',
        [guestId]
      );

      if (result[0].length === 0) {
        throw new Error('Guest not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async searchGuests(query) {
    try {
      const searchQuery = `%${query}%`;
      const result = await pool.query(
        `SELECT * FROM guests
         WHERE first_name LIKE ?
         OR last_name LIKE ?
         OR email LIKE ?
         OR phone LIKE ?
         OR id_number LIKE ?
         ORDER BY created_at DESC
         LIMIT 20`,
        [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getGuestHistory(guestId) {
    try {
      const result = await pool.query(
        `SELECT 
          r.id, r.reservation_number, r.check_in_date, r.check_out_date,
          r.number_of_guests, r.status,
          ci.check_in_time, ci.check_out_time,
          rm.room_number
         FROM reservations r
         LEFT JOIN check_ins ci ON ci.reservation_id = r.id
         LEFT JOIN rooms rm ON rm.id = r.room_id
         WHERE r.guest_id = ?
         ORDER BY r.check_in_date DESC`,
        [guestId]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async updateGuest(guestId, updateData) {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(guestId);

      await pool.query(
        `UPDATE guests
         SET ${fields.join(', ')}
         WHERE id = ?`,
        values
      );

      const result = await pool.query(
        'SELECT * FROM guests WHERE id = ?',
        [guestId]
      );

      if (result[0].length === 0) {
        throw new Error('Guest not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getFrequentGuests(limit = 10) {
    try {
      const result = await pool.query(
        `SELECT 
          g.*, 
          COUNT(r.id) as reservation_count,
          SUM(CASE WHEN r.status = 'checked_out' THEN 1 ELSE 0 END) as completed_stays
         FROM guests g
         LEFT JOIN reservations r ON r.guest_id = g.id
         GROUP BY g.id
         ORDER BY completed_stays DESC
         LIMIT ?`,
        [limit]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new GuestService();

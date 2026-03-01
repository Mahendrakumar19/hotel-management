const pool = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class RoomService {
  async getAllRooms(status = null) {
    try {
      let query = 'SELECT * FROM rooms';
      const params = [];

      if (status) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY room_number ASC';
      const result = await pool.query(query, params);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getRoomById(roomId) {
    try {
      const result = await pool.query(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      if (result[0].length === 0) {
        throw new Error('Room not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getRoomByNumber(roomNumber) {
    try {
      const result = await pool.query(
        'SELECT * FROM rooms WHERE room_number = ?',
        [roomNumber]
      );

      if (result[0].length === 0) {
        throw new Error('Room not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async updateRoomStatus(roomId, newStatus) {
    try {
      const validStatuses = ['occupied', 'dirty', 'vacant'];

      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid room status');
      }

      await pool.query(
        `UPDATE rooms
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newStatus, roomId]
      );

      const result = await pool.query(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      if (result[0].length === 0) {
        throw new Error('Room not found');
      }

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getRoomStatistics() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_rooms,
          SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
          SUM(CASE WHEN status = 'dirty' THEN 1 ELSE 0 END) as dirty_rooms,
          SUM(CASE WHEN status = 'vacant' THEN 1 ELSE 0 END) as vacant_rooms,
          ROUND(
            SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) / 
            COUNT(*) * 100, 
            2
          ) as occupancy_rate
        FROM rooms
      `);

      return result[0][0];
    } catch (error) {
      throw error;
    }
  }

  async getAvailableRooms(checkInDate, checkOutDate, capacity = 1) {
    try {
      const result = await pool.query(`
        SELECT r.* FROM rooms r
        WHERE r.status = 'vacant'
        AND r.capacity >= ?
        AND r.id NOT IN (
          SELECT DISTINCT r2.id FROM rooms r2
          INNER JOIN check_ins ci ON ci.room_id = r2.id
          INNER JOIN reservations res ON res.id = ci.reservation_id
          WHERE res.check_in_date <= ?
          AND res.check_out_date >= ?
        )
        ORDER BY r.base_rate ASC
      `, [capacity, checkOutDate, checkInDate]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RoomService();

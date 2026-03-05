const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { formatDate } = require('../utils/dateUtils');

class StoreRequisitionService {
  /**
   * Create a new store requisition
   */
  static createRequisition(data) {
    try {
      const id = uuidv4();
      const requisitionNumber = `REQ-${Date.now()}`;

      const stmt = db.prepare(`
        INSERT INTO store_requisitions (
          id, requisition_number, item_name, quantity, unit, 
          priority, description, status, requested_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = formatDate(new Date());
      stmt.run(
        id,
        requisitionNumber,
        data.item_name,
        data.quantity,
        data.unit || 'PCS',
        data.priority || 'routine',
        data.description || '',
        'pending',
        data.requested_by,
        now,
        now
      );

      return this.getRequisitionById(id);
    } catch (error) {
      throw new Error(`Failed to create requisition: ${error.message}`);
    }
  }

  /**
   * Get requisition by ID
   */
  static getRequisitionById(id) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM store_requisitions WHERE id = ?
      `);
      return stmt.get(id);
    } catch (error) {
      throw new Error(`Failed to fetch requisition: ${error.message}`);
    }
  }

  /**
   * Get all requisitions with optional filtering
   */
  static getAllRequisitions(filters = {}) {
    try {
      let query = 'SELECT * FROM store_requisitions WHERE 1=1';
      const params = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.priority) {
        query += ' AND priority = ?';
        params.push(filters.priority);
      }

      if (filters.requested_by) {
        query += ' AND requested_by = ?';
        params.push(filters.requested_by);
      }

      query += ' ORDER BY created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      throw new Error(`Failed to fetch requisitions: ${error.message}`);
    }
  }

  /**
   * Approve a requisition
   */
  static approveRequisition(id, approvedBy) {
    try {
      const now = formatDate(new Date());

      const stmt = db.prepare(`
        UPDATE store_requisitions 
        SET status = 'approved', 
            approved_by = ?, 
            approved_at = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(approvedBy, now, now, id);
      return this.getRequisitionById(id);
    } catch (error) {
      throw new Error(`Failed to approve requisition: ${error.message}`);
    }
  }

  /**
   * Reject a requisition
   */
  static rejectRequisition(id, approvedBy) {
    try {
      const now = formatDate(new Date());

      const stmt = db.prepare(`
        UPDATE store_requisitions 
        SET status = 'rejected', 
            approved_by = ?, 
            approved_at = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(approvedBy, now, now, id);
      return this.getRequisitionById(id);
    } catch (error) {
      throw new Error(`Failed to reject requisition: ${error.message}`);
    }
  }

  /**
   * Update requisition details
   */
  static updateRequisition(id, data) {
    try {
      // Only allow updates on pending requisitions
      const req = this.getRequisitionById(id);
      if (req.status !== 'pending') {
        throw new Error('Can only update pending requisitions');
      }

      const now = formatDate(new Date());
      const updates = [];
      const params = [];

      if (data.item_name !== undefined) {
        updates.push('item_name = ?');
        params.push(data.item_name);
      }
      if (data.quantity !== undefined) {
        updates.push('quantity = ?');
        params.push(data.quantity);
      }
      if (data.unit !== undefined) {
        updates.push('unit = ?');
        params.push(data.unit);
      }
      if (data.priority !== undefined) {
        updates.push('priority = ?');
        params.push(data.priority);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }

      updates.push('updated_at = ?');
      params.push(now);
      params.push(id);

      const query = `UPDATE store_requisitions SET ${updates.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...params);

      return this.getRequisitionById(id);
    } catch (error) {
      throw new Error(`Failed to update requisition: ${error.message}`);
    }
  }

  /**
   * Delete a requisition
   */
  static deleteRequisition(id) {
    try {
      const stmt = db.prepare('DELETE FROM store_requisitions WHERE id = ?');
      stmt.run(id);
      return { success: true, message: 'Requisition deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete requisition: ${error.message}`);
    }
  }

  /**
   * Get requisition statistics
   */
  static getStatistics() {
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM store_requisitions
      `).get();

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  /**
   * Get pending requisitions count
   */
  static getPendingCount() {
    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count FROM store_requisitions WHERE status = 'pending'
      `).get();
      return result.count || 0;
    } catch (error) {
      throw new Error(`Failed to get pending count: ${error.message}`);
    }
  }
}

module.exports = StoreRequisitionService;

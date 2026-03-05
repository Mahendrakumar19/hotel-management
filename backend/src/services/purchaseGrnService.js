const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');
const { formatDate } = require('../utils/dateUtils');

class PurchaseGrnService {
  /**
   * Create a new GRN (Goods Receipt Note)
   */
  static createGrn(data) {
    try {
      const id = uuidv4();
      const grnNumber = `GRN-${Date.now()}`;

      const stmt = db.prepare(`
        INSERT INTO purchase_grn (
          id, grn_number, invoice_number, vendor_name, item_name, 
          quantity, received_quantity, unit, quality, status, 
          received_by, remarks, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = formatDate(new Date());
      stmt.run(
        id,
        grnNumber,
        data.invoice_number,
        data.vendor_name,
        data.item_name,
        data.quantity,
        data.received_quantity || data.quantity,
        data.unit || 'PCS',
        data.quality || 'good',
        'pending_approval',
        data.received_by,
        data.remarks || '',
        now,
        now
      );

      return this.getGrnById(id);
    } catch (error) {
      throw new Error(`Failed to create GRN: ${error.message}`);
    }
  }

  /**
   * Get GRN by ID
   */
  static getGrnById(id) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM purchase_grn WHERE id = ?
      `);
      return stmt.get(id);
    } catch (error) {
      throw new Error(`Failed to fetch GRN: ${error.message}`);
    }
  }

  /**
   * Get all GRNs with optional filtering
   */
  static getAllGrns(filters = {}) {
    try {
      let query = 'SELECT * FROM purchase_grn WHERE 1=1';
      const params = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.vendor_name) {
        query += ' AND vendor_name LIKE ?';
        params.push(`%${filters.vendor_name}%`);
      }

      if (filters.received_by) {
        query += ' AND received_by = ?';
        params.push(filters.received_by);
      }

      if (filters.quality) {
        query += ' AND quality = ?';
        params.push(filters.quality);
      }

      query += ' ORDER BY created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      throw new Error(`Failed to fetch GRNs: ${error.message}`);
    }
  }

  /**
   * Get GRN by invoice number (for matching with purchase orders)
   */
  static getGrnByInvoice(invoiceNumber) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM purchase_grn WHERE invoice_number = ? ORDER BY created_at DESC
      `);
      return stmt.all(invoiceNumber);
    } catch (error) {
      throw new Error(`Failed to fetch GRN by invoice: ${error.message}`);
    }
  }

  /**
   * Get GRNs by vendor
   */
  static getGrnsByVendor(vendorName) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM purchase_grn WHERE vendor_name = ? ORDER BY created_at DESC
      `);
      return stmt.all(vendorName);
    } catch (error) {
      throw new Error(`Failed to fetch GRNs by vendor: ${error.message}`);
    }
  }

  /**
   * Approve a GRN
   */
  static approveGrn(id, approvedBy) {
    try {
      const now = formatDate(new Date());

      const stmt = db.prepare(`
        UPDATE purchase_grn 
        SET status = 'approved', 
            approved_by = ?, 
            approved_at = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(approvedBy, now, now, id);
      return this.getGrnById(id);
    } catch (error) {
      throw new Error(`Failed to approve GRN: ${error.message}`);
    }
  }

  /**
   * Reject a GRN
   */
  static rejectGrn(id, approvedBy) {
    try {
      const now = formatDate(new Date());

      const stmt = db.prepare(`
        UPDATE purchase_grn 
        SET status = 'rejected', 
            approved_by = ?, 
            approved_at = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(approvedBy, now, now, id);
      return this.getGrnById(id);
    } catch (error) {
      throw new Error(`Failed to reject GRN: ${error.message}`);
    }
  }

  /**
   * Mark GRN as received
   */
  static markAsReceived(id) {
    try {
      const now = formatDate(new Date());

      const stmt = db.prepare(`
        UPDATE purchase_grn 
        SET status = 'received',
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(now, id);
      return this.getGrnById(id);
    } catch (error) {
      throw new Error(`Failed to mark GRN as received: ${error.message}`);
    }
  }

  /**
   * Update GRN details
   */
  static updateGrn(id, data) {
    try {
      const grn = this.getGrnById(id);
      if (grn.status === 'approved' || grn.status === 'received') {
        throw new Error('Cannot update approved or received GRNs');
      }

      const now = formatDate(new Date());
      const updates = [];
      const params = [];

      if (data.received_quantity !== undefined) {
        updates.push('received_quantity = ?');
        params.push(data.received_quantity);
      }
      if (data.quality !== undefined) {
        updates.push('quality = ?');
        params.push(data.quality);
      }
      if (data.remarks !== undefined) {
        updates.push('remarks = ?');
        params.push(data.remarks);
      }

      updates.push('updated_at = ?');
      params.push(now);
      params.push(id);

      const query = `UPDATE purchase_grn SET ${updates.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(query);
      stmt.run(...params);

      return this.getGrnById(id);
    } catch (error) {
      throw new Error(`Failed to update GRN: ${error.message}`);
    }
  }

  /**
   * Get quantity variance (expected vs received)
   */
  static getVariance(id) {
    try {
      const grn = this.getGrnById(id);
      const variance = grn.received_quantity - grn.quantity;
      const variancePercent = ((variance / grn.quantity) * 100).toFixed(2);

      return {
        expected: grn.quantity,
        received: grn.received_quantity,
        variance,
        variancePercent,
        status: variance === 0 ? 'match' : variance > 0 ? 'over' : 'short'
      };
    } catch (error) {
      throw new Error(`Failed to calculate variance: ${error.message}`);
    }
  }

  /**
   * Get GRN statistics
   */
  static getStatistics() {
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM purchase_grn
      `).get();

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  /**
   * Get pending GRNs count
   */
  static getPendingCount() {
    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count FROM purchase_grn WHERE status = 'pending_approval'
      `).get();
      return result.count || 0;
    } catch (error) {
      throw new Error(`Failed to get pending count: ${error.message}`);
    }
  }

  /**
   * Get vendors list
   */
  static getVendorsList() {
    try {
      const vendors = db.prepare(`
        SELECT DISTINCT vendor_name FROM purchase_grn ORDER BY vendor_name
      `).all();
      return vendors.map(v => v.vendor_name);
    } catch (error) {
      throw new Error(`Failed to fetch vendors: ${error.message}`);
    }
  }

  /**
   * Delete a GRN
   */
  static deleteGrn(id) {
    try {
      const stmt = db.prepare('DELETE FROM purchase_grn WHERE id = ?');
      stmt.run(id);
      return { success: true, message: 'GRN deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete GRN: ${error.message}`);
    }
  }
}

module.exports = PurchaseGrnService;

import React, { useState, useEffect } from 'react';
import { purchaseGrnService } from '../services/api';
import '../styles/components.css';

export default function PurchaseGRN() {
  const [grns, setGRNs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, received: 0, rejected: 0 });
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor_name: '',
    item_name: '',
    quantity: 1,
    received_quantity: 1,
    unit: 'PCS',
    quality: 'good',
    remarks: ''
  });

  useEffect(() => {
    loadGRNs();
    loadStatistics();
  }, []);

  const loadGRNs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseGrnService.getAllGrns();
      setGRNs(response.data || []);
    } catch (err) {
      setError('Failed to load GRNs');
      console.error(err);
      setGRNs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await purchaseGrnService.getStatistics();
      setStats(response.data || { total: 0, pending: 0, approved: 0, received: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.invoice_number || !formData.vendor_name || !formData.item_name || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await purchaseGrnService.createGrn(formData);
      setFormData({
        invoice_number: '',
        vendor_name: '',
        item_name: '',
        quantity: 1,
        received_quantity: 1,
        unit: 'PCS',
        quality: 'good',
        remarks: ''
      });
      setShowForm(false);
      await loadGRNs();
      await loadStatistics();
      alert('GRN created successfully');
    } catch (err) {
      alert('Failed to create GRN: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await purchaseGrnService.approveGrn(id);
      await loadGRNs();
      await loadStatistics();
      alert('GRN approved');
    } catch (err) {
      alert('Failed to approve GRN: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await purchaseGrnService.rejectGrn(id);
      await loadGRNs();
      await loadStatistics();
      alert('GRN rejected');
    } catch (err) {
      alert('Failed to reject GRN: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received': return '📦';
      case 'pending_approval': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '?';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'good': return '#27ae60';
      case 'damaged': return '#e74c3c';
      case 'partial': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="module-container purchase-grn">
      <div className="room-management-header">
        <h2>📋 Purchase GRN (Goods Receipt Note)</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '✕ Cancel' : '➕ New GRN'}
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Stats */}
      <div className="room-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <p className="stat-label">Total GRNs</p>
            <p className="stat-count">{stats.total || 0}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏳</span>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-count">{stats.pending || 0}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-count">{stats.approved || 0}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📦</span>
          <div className="stat-content">
            <p className="stat-label">Received</p>
            <p className="stat-count">{stats.received || 0}</p>
          </div>
        </div>
      </div>

      {/* New GRN Form */}
      {showForm && (
        <div className="form-card">
          <h3>Create New GRN</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row">
              <div className="form-group">
                <label>Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                  placeholder="e.g., INV-1001"
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                  placeholder="Vendor/Supplier Name"
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                placeholder="Item to be received"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expected Qty *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Received Qty *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.received_quantity}
                  onChange={(e) => setFormData({...formData, received_quantity: parseFloat(e.target.value)})}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="PCS">Pieces</option>
                  <option value="BAG">Bag</option>
                  <option value="BOX">Box</option>
                  <option value="LITER">Liter</option>
                  <option value="KG">Kilogram</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Quality Condition</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({...formData, quality: e.target.value})}
                className="input-field"
                disabled={loading}
              >
                <option value="good">Good Condition</option>
                <option value="partial">Partial Damage</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                placeholder="Additional notes"
                className="input-field"
                rows="2"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Creating...' : '✓ Create GRN'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRNs List */}
      <div className="grns-table-section">
        <h3>GRN List</h3>
        {loading && grns.length === 0 ? (
          <p className="loading-state">Loading...</p>
        ) : grns.length === 0 ? (
          <p className="empty-state">No GRNs created</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>GRN No.</th>
                <th>Invoice</th>
                <th>Vendor</th>
                <th>Item</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Quality</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grns.map(grn => (
                <tr key={grn.id} className={`status-${grn.status}`}>
                  <td className="font-bold">{grn.grn_number}</td>
                  <td>{grn.invoice_number}</td>
                  <td>{grn.vendor_name}</td>
                  <td>{grn.item_name}</td>
                  <td>{grn.quantity} {grn.unit}</td>
                  <td>{grn.received_quantity} {grn.unit}</td>
                  <td>
                    <span 
                      className="quality-badge"
                      style={{ backgroundColor: getQualityColor(grn.quality) }}
                    >
                      {grn.quality.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge">
                      {getStatusIcon(grn.status)} {grn.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{grn.created_at?.split('T')[0]}</td>
                  <td>
                    {grn.status === 'pending_approval' && (
                      <>
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleApprove(grn.id)}
                          title="Approve"
                          disabled={loading}
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleReject(grn.id)}
                          title="Reject"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

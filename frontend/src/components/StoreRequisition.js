import React, { useState, useEffect } from 'react';
import { storeRequisitionService } from '../services/api';
import '../styles/components.css';

export default function StoreRequisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 1,
    unit: 'PCS',
    description: '',
    priority: 'routine'
  });

  useEffect(() => {
    loadRequisitions();
    loadStatistics();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeRequisitionService.getAllRequisitions();
      setRequisitions(response.data || []);
    } catch (err) {
      setError('Failed to load requisitions');
      console.error(err);
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await storeRequisitionService.getStatistics();
      setStats(response.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await storeRequisitionService.createRequisition(formData);
      setFormData({
        item_name: '',
        quantity: 1,
        unit: 'PCS',
        description: '',
        priority: 'routine'
      });
      setShowForm(false);
      await loadRequisitions();
      await loadStatistics();
      alert('Requisition created successfully');
    } catch (err) {
      alert('Failed to create requisition: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await storeRequisitionService.approveRequisition(id);
      await loadRequisitions();
      await loadStatistics();
      alert('Requisition approved');
    } catch (err) {
      alert('Failed to approve requisition: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await storeRequisitionService.rejectRequisition(id);
      await loadRequisitions();
      await loadStatistics();
      alert('Requisition rejected');
    } catch (err) {
      alert('Failed to reject requisition: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '?';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e74c3c';
      case 'routine': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="module-container store-requisition">
      <div className="room-management-header">
        <h2>📦 Store Requisition</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '✕ Cancel' : '➕ New Requisition'}
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Stats */}
      <div className="room-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <p className="stat-label">Total</p>
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
          <span className="stat-icon">❌</span>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-count">{stats.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* New Requisition Form */}
      {showForm && (
        <div className="form-card">
          <h3>Create New Requisition</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                placeholder="e.g., Rice, Flour, Oil"
                className="input-field"
                disabled={loading}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
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
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="input-field"
                disabled={loading}
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional notes"
                className="input-field"
                rows="2"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Creating...' : '✓ Create Requisition'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requisitions List */}
      <div className="requisitions-table-section">
        <h3>Requisition List</h3>
        {loading && requisitions.length === 0 ? (
          <p className="loading-state">Loading...</p>
        ) : requisitions.length === 0 ? (
          <p className="empty-state">No requisitions yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Req No.</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map(req => (
                <tr key={req.id} className={`status-${req.status}`}>
                  <td className="font-bold">{req.requisition_number}</td>
                  <td>{req.item_name}</td>
                  <td>{req.quantity}</td>
                  <td>{req.unit}</td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(req.priority) }}
                    >
                      {req.priority.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge">
                      {getStatusIcon(req.status)} {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{req.created_at?.split('T')[0]}</td>
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleApprove(req.id)}
                          title="Approve"
                          disabled={loading}
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleReject(req.id)}
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

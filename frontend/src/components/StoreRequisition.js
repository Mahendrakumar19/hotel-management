import React, { useState, useEffect } from 'react';
import '../styles/components.css';

export default function StoreRequisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 1,
    unit: 'PCS',
    description: '',
    priority: 'normal'
  });

  const mockRequisitions = [
    {
      id: 1,
      requisitionNumber: 'REQ-2026-001',
      itemName: 'Rice (20kg)',
      quantity: 5,
      unit: 'BAG',
      status: 'approved',
      priority: 'high',
      createdAt: '2026-03-04',
      approvedBy: 'Admin User'
    },
    {
      id: 2,
      requisitionNumber: 'REQ-2026-002',
      itemName: 'Dal (10kg)',
      quantity: 3,
      unit: 'BAG',
      status: 'pending',
      priority: 'normal',
      createdAt: '2026-03-05',
      approvedBy: null
    }
  ];

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = () => {
    setRequisitions(mockRequisitions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }

    const newRequisition = {
      id: mockRequisitions.length + 1,
      requisitionNumber: `REQ-2026-${String(mockRequisitions.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      approvedBy: null
    };

    setRequisitions([...requisitions, newRequisition]);
    setFormData({
      itemName: '',
      quantity: 1,
      unit: 'PCS',
      description: '',
      priority: 'normal'
    });
    setShowForm(false);
    alert('Requisition created successfully');
  };

  const handleApprove = (id) => {
    setRequisitions(requisitions.map(r => 
      r.id === id ? { ...r, status: 'approved', approvedBy: 'Admin User' } : r
    ));
    alert('Requisition approved');
  };

  const handleReject = (id) => {
    setRequisitions(requisitions.map(r => 
      r.id === id ? { ...r, status: 'rejected' } : r
    ));
    alert('Requisition rejected');
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
      case 'high': return '#e74c3c';
      case 'normal': return '#3498db';
      case 'low': return '#27ae60';
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
        >
          {showForm ? '✕ Cancel' : '➕ New Requisition'}
        </button>
      </div>

      {/* Stats */}
      <div className="room-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <p className="stat-label">Total</p>
            <p className="stat-count">{requisitions.length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏳</span>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-count">{requisitions.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-count">{requisitions.filter(r => r.status === 'approved').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">❌</span>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-count">{requisitions.filter(r => r.status === 'rejected').length}</p>
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
                value={formData.itemName}
                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                placeholder="e.g., Rice, Flour, Oil"
                className="input-field"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="input-field"
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
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
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
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">✓ Create Requisition</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Requisitions List */}
      <div className="requisitions-table-section">
        <h3>Requisition List</h3>
        {requisitions.length === 0 ? (
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
                  <td className="font-bold">{req.requisitionNumber}</td>
                  <td>{req.itemName}</td>
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
                  <td>{req.createdAt}</td>
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleApprove(req.id)}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleReject(req.id)}
                          title="Reject"
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

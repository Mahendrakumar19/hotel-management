import React, { useState, useEffect } from 'react';
import '../styles/components.css';

export default function PurchaseGRN() {
  const [grns, setGRNs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [formData, setFormData] = useState({
    grnNumber: '',
    itemName: '',
    quantity: 1,
    unit: 'PCS',
    invoiceNumber: '',
    vendorName: '',
    receivedQuantity: 1,
    quality: 'good',
    notes: ''
  });

  const mockGRNs = [
    {
      id: 1,
      grnNumber: 'GRN-2026-001',
      invoiceNumber: 'INV-1001',
      vendorName: 'ABC Food Supplies',
      itemName: 'Rice (20kg)',
      quantity: 5,
      receivedQuantity: 5,
      unit: 'BAG',
      quality: 'good',
      status: 'received',
      receivedAt: '2026-03-04',
      approvedAt: '2026-03-04'
    },
    {
      id: 2,
      grnNumber: 'GRN-2026-002',
      invoiceNumber: 'INV-1002',
      vendorName: 'XYZ Vendors',
      itemName: 'Dal (10kg)',
      quantity: 3,
      receivedQuantity: 3,
      unit: 'BAG',
      quality: 'good',
      status: 'pending_approval',
      receivedAt: '2026-03-05',
      approvedAt: null
    }
  ];

  useEffect(() => {
    loadGRNs();
  }, []);

  const loadGRNs = () => {
    setGRNs(mockGRNs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.quantity || !formData.vendorName) {
      alert('Please fill all required fields');
      return;
    }

    const newGRN = {
      id: mockGRNs.length + 1,
      grnNumber: `GRN-2026-${String(mockGRNs.length + 1).padStart(3, '0')}`,
      ...formData,
      status: 'pending_approval',
      receivedAt: new Date().toISOString().split('T')[0],
      approvedAt: null
    };

    setGRNs([...grns, newGRN]);
    setFormData({
      grnNumber: '',
      itemName: '',
      quantity: 1,
      unit: 'PCS',
      invoiceNumber: '',
      vendorName: '',
      receivedQuantity: 1,
      quality: 'good',
      notes: ''
    });
    setShowForm(false);
    alert('GRN created successfully');
  };

  const handleApprove = (id) => {
    setGRNs(grns.map(g => 
      g.id === id ? { ...g, status: 'approved', approvedAt: new Date().toISOString().split('T')[0] } : g
    ));
    alert('GRN approved');
  };

  const handleReject = (id) => {
    setGRNs(grns.map(g => 
      g.id === id ? { ...g, status: 'rejected' } : g
    ));
    alert('GRN rejected');
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
        >
          {showForm ? '✕ Cancel' : '➕ New GRN'}
        </button>
      </div>

      {/* Stats */}
      <div className="room-stats">
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <p className="stat-label">Total GRNs</p>
            <p className="stat-count">{grns.length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏳</span>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-count">{grns.filter(g => g.status === 'pending_approval').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-count">{grns.filter(g => g.status === 'approved').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📦</span>
          <div className="stat-content">
            <p className="stat-label">Received</p>
            <p className="stat-count">{grns.filter(g => g.status === 'received').length}</p>
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
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  placeholder="e.g., INV-1001"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.vendorName}
                  onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                  placeholder="Vendor/Supplier Name"
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                required
                value={formData.itemName}
                onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                placeholder="Item to be received"
                className="input-field"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expected Qty *</label>
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
                <label>Received Qty *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.receivedQuantity}
                  onChange={(e) => setFormData({...formData, receivedQuantity: parseInt(e.target.value)})}
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
              <label>Quality Condition</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({...formData, quality: e.target.value})}
                className="input-field"
              >
                <option value="good">Good Condition</option>
                <option value="partial">Partial Damage</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes"
                className="input-field"
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">✓ Create GRN</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* GRNs List */}
      <div className="grns-table-section">
        <h3>GRN List</h3>
        {grns.length === 0 ? (
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
                  <td className="font-bold">{grn.grnNumber}</td>
                  <td>{grn.invoiceNumber}</td>
                  <td>{grn.vendorName}</td>
                  <td>{grn.itemName}</td>
                  <td>{grn.quantity} {grn.unit}</td>
                  <td>{grn.receivedQuantity} {grn.unit}</td>
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
                  <td>{grn.receivedAt}</td>
                  <td>
                    {grn.status === 'pending_approval' && (
                      <>
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleApprove(grn.id)}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleReject(grn.id)}
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

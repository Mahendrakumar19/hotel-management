import React, { useState, useEffect } from 'react';
import { billingService } from '../services/api';
import '../styles/components.css';

export default function BillingCenter() {
  const [openBills, setOpenBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [newItem, setNewItem] = useState({ itemName: '', quantity: 1, rate: 0 });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [filterStatus, setFilterStatus] = useState('open');

  useEffect(() => {
    loadOpenBills();
  }, []);

  const loadOpenBills = async () => {
    try {
      setLoading(true);
      const bills = await billingService.getOpenBills();
      setOpenBills(bills);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedBill || !newItem.itemName || !newItem.quantity || !newItem.rate) {
      alert('Please fill all fields');
      return;
    }

    try {
      await billingService.addItemToBill(selectedBill.id, newItem.itemName, newItem.quantity, newItem.rate);
      
      // Reload bill
      const bill = await billingService.getBillById(selectedBill.id);
      setSelectedBill(bill);
      setNewItem({ itemName: '', quantity: 1, rate: 0 });
    } catch (error) {
      alert('Error adding item: ' + error.message);
    }
  };

  const handleSettleBill = async () => {
    if (!selectedBill) return;

    if (!window.confirm(`Settle bill ${selectedBill.bill_number} with ${paymentMethod} payment for ₹${selectedBill.total_amount}?`)) {
      return;
    }

    try {
      await billingService.settleBill(selectedBill.id, { paymentMethod });
      alert('Bill settled successfully');
      setSelectedBill(null);
      setPaymentMethod('cash');
      loadOpenBills();
    } catch (error) {
      alert('Error settling bill: ' + error.message);
    }
  };

  const billSummary = selectedBill ? {
    subtotal: selectedBill.items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0,
    tax: selectedBill.total_amount - (selectedBill.items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0),
    total: selectedBill.total_amount
  } : null;

  return (
    <div className="module-container billing-center">
      <h2>F&B Billing Center</h2>

      <div className="billing-controls">
        <button className="btn-primary" onClick={loadOpenBills}>
          🔄 Refresh Bills
        </button>
      </div>

      <div className="billing-layout">
        {/* Bills List Panel */}
        <div className="bills-list-panel">
          <div className="bills-header">
            <h3>Open Bills</h3>
            <span className="bill-count">{openBills.length}</span>
          </div>
          
          {loading ? (
            <p className="loading-text">Loading bills...</p>
          ) : openBills.length === 0 ? (
            <p className="empty-text">No open bills</p>
          ) : (
            <div className="bills-container">
              {openBills.map((bill) => (
                <div 
                  key={bill.id}
                  className={`bill-item ${selectedBill?.id === bill.id ? 'active' : ''}`}
                  onClick={() => setSelectedBill(bill)}
                >
                  <div className="bill-item-header">
                    <strong className="bill-number">{bill.bill_number}</strong>
                  </div>
                  <div className="bill-item-amount">₹{bill.total_amount}</div>
                  <div className="bill-item-meta">
                    <span className="bill-time">{new Date(bill.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bill Editor Panel */}
        {selectedBill && (
          <div className="bill-editor-panel">
            <div className="bill-header-section">
              <div>
                <h3>Bill #{selectedBill.bill_number}</h3>
                <p className="bill-date">{new Date(selectedBill.created_at).toLocaleString()}</p>
              </div>
              <div className="bill-status">
                <span className={`status-badge status-${selectedBill.status}`}>
                  {selectedBill.status?.toUpperCase() || 'OPEN'}
                </span>
              </div>
            </div>

            {/* Bill Items Table */}
            <div className="bill-items-section">
              <h4>Items</h4>
              {selectedBill.items && selectedBill.items.length > 0 ? (
                <table className="bill-items-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.item_name}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">₹{item.rate}</td>
                        <td className="text-right">₹{(item.quantity * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-items-text">No items in this bill</p>
              )}
            </div>

            {/* Add Item Section */}
            <div className="add-item-section">
              <h4>Add Item to Bill</h4>
              <div className="add-item-form">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  min="0"
                  step="0.01"
                  value={newItem.rate}
                  onChange={(e) => setNewItem({...newItem, rate: parseFloat(e.target.value) || 0})}
                  className="input-field"
                />
                <button onClick={handleAddItem} className="btn-primary">+ Add Item</button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bill-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{billSummary.subtotal.toFixed(2)}</span>
              </div>
              {billSummary.tax > 0 && (
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>₹{billSummary.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span className="amount">₹{billSummary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-method-section">
              <h4>Payment Method</h4>
              <div className="payment-methods">
                {[
                  { value: 'cash', label: '💵 Cash' },
                  { value: 'credit_card', label: '💳 Credit Card' },
                  { value: 'debit_card', label: '🏦 Debit Card' },
                  { value: 'upi', label: '📱 UPI' },
                  { value: 'bill_to_company', label: '🏢 Bill to Company' }
                ].map(method => (
                  <label key={method.value} className="payment-option">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bill Actions */}
            <div className="bill-actions">
              <button 
                onClick={handleSettleBill} 
                className="btn-settle"
                title="Confirm settlement to close this bill"
              >
                ✓ Settle Bill
              </button>
              <button 
                onClick={() => setSelectedBill(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { billingService } from '../services/api';
import '../styles/components.css';

export default function BillingCenter() {
  const [openBills, setOpenBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [newItem, setNewItem] = useState({ itemName: '', quantity: 1, rate: 0 });
  const [loading, setLoading] = useState(false);

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

    try {
      await billingService.settleBill(selectedBill.id);
      alert('Bill settled successfully');
      setSelectedBill(null);
      loadOpenBills();
    } catch (error) {
      alert('Error settling bill: ' + error.message);
    }
  };

  return (
    <div className="module-container">
      <h2>F&B Billing Center</h2>

      <button className="btn-primary" onClick={loadOpenBills}>
        Load Open Bills
      </button>

      <div className="billing-layout">
        <div className="bills-list">
          <h3>Open Bills</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bills-container">
              {openBills.map((bill) => (
                <div 
                  key={bill.id}
                  className={`bill-item ${selectedBill?.id === bill.id ? 'active' : ''}`}
                  onClick={() => setSelectedBill(bill)}
                >
                  <p><strong>{bill.bill_number}</strong></p>
                  <p>₹ {bill.total_amount}</p>
                  <p className="small-text">{bill.settlement_mode}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBill && (
          <div className="bill-editor">
            <h3>Bill: {selectedBill.bill_number}</h3>

            <div className="bill-details">
              <p><strong>Total Amount:</strong> ₹ {selectedBill.total_amount}</p>
              <p><strong>Mode:</strong> {selectedBill.settlement_mode}</p>
              <p><strong>Status:</strong> {selectedBill.bill_status}</p>

              <h4>Items:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹ {item.rate}</td>
                      <td>₹ {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="add-item-section">
                <h4>Add Item</h4>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                />
                <input
                  type="number"
                  placeholder="Rate"
                  min="0"
                  step="0.01"
                  value={newItem.rate}
                  onChange={(e) => setNewItem({...newItem, rate: parseFloat(e.target.value)})}
                />
                <button onClick={handleAddItem} className="btn-primary">Add Item</button>
              </div>

              <div className="bill-actions">
                <button onClick={handleSettleBill} className="btn-settle">Settle Bill</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

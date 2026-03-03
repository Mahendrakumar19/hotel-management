import React, { useState, useEffect } from 'react';
import { reportingService } from '../services/api';
import '../styles/components.css';

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Auto-generate daily report on load
    handleGenerateReport();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let data;
      
      switch (reportType) {
        case 'daily':
          data = await reportingService.getDailyReport(reportDate);
          break;
        case 'monthly':
          data = await reportingService.getMonthlyReport(reportYear, reportMonth);
          break;
        case 'occupancy':
          data = await reportingService.getOccupancyReport(startDate, endDate);
          break;
        case 'revenue':
          data = await reportingService.getRevenueReport(startDate, endDate);
          break;
        case 'statistics':
          data = await reportingService.getGuestStatistics();
          break;
        default:
          break;
      }
      
      setReportData(data);
    } catch (error) {
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const csv = convertToCSV(reportData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const convertToCSV = (data) => {
    const array = [Object.keys(data[0])].concat(data);
    return array.map(it => Object.values(it).toString()).join('\n');
  };

  const calculateKPI = (label, value, color) => ({
    label,
    value,
    color
  });

  return (
    <div className="module-container reports-container">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        {reportData && (
          <button onClick={exportReport} className="btn-export">
            📥 Export Report
          </button>
        )}
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => { setReportType(e.target.value); setReportData(null); }}>
            <option value="daily">📆 Daily Report</option>
            <option value="monthly">📅 Monthly Report</option>
            <option value="occupancy">🏢 Occupancy Report</option>
            <option value="revenue">💰 Revenue Report</option>
            <option value="statistics">👥 Guest Statistics</option>
          </select>
        </div>

        {reportType === 'daily' && (
          <div className="control-group">
            <label>Date:</label>
            <input 
              type="date" 
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="control-group">
            <label>Month/Year:</label>
            <div className="month-year-inputs">
              <input 
                type="number" 
                min="1" 
                max="12" 
                value={reportMonth}
                onChange={(e) => setReportMonth(parseInt(e.target.value))}
                placeholder="MM"
              />
              <span>/</span>
              <input 
                type="number" 
                min="2020" 
                value={reportYear}
                onChange={(e) => setReportYear(parseInt(e.target.value))}
                placeholder="YYYY"
              />
            </div>
          </div>
        )}

        {(reportType === 'occupancy' || reportType === 'revenue') && (
          <div className="control-group">
            <label>Date Range:</label>
            <div className="date-range-inputs">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
              />
              <span>to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleGenerateReport} 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : '🔄 Generate Report'}
        </button>
      </div>

      {!reportData && !loading && (
        <div className="empty-report">
          <p>👉 Select report type and parameters above to generate a report</p>
        </div>
      )}

      {reportData && (
        <div className="report-content">
          {reportType === 'daily' && (
            <div className="report-section">
              <h3>📊 Daily Report - {new Date(reportDate).toLocaleDateString()}</h3>
              
              <div className="kpi-cards">
                <div className="kpi-card">
                  <h5 className="kpi-label">Total Revenue</h5>
                  <p className="kpi-value" style={{ color: '#27ae60' }}>₹{reportData.revenue?.total_revenue || 0}</p>
                  <div className="kpi-bar" style={{ backgroundColor: '#27ae60', width: '100%' }}></div>
                </div>

                <div className="kpi-card">
                  <h5 className="kpi-label">Occupancy Rate</h5>
                  <p className="kpi-value" style={{ color: '#f39c12' }}>{reportData.rooms?.occupancy_rate || 0}%</p>
                  <div className="kpi-bar" style={{ backgroundColor: '#f39c12', width: `${reportData.rooms?.occupancy_rate || 0}%` }}></div>
                </div>

                <div className="kpi-card">
                  <h5 className="kpi-label">Occupied Rooms</h5>
                  <p className="kpi-value" style={{ color: '#e74c3c' }}>{reportData.rooms?.occupied_rooms || 0} / {reportData.rooms?.total_rooms || 0}</p>
                </div>

                <div className="kpi-card">
                  <h5 className="kpi-label">Check-ins Today</h5>
                  <p className="kpi-value" style={{ color: '#3498db' }}>{reportData.occupancy?.check_ins_today || 0}</p>
                </div>

                <div className="kpi-card">
                  <h5 className="kpi-label">Check-outs Today</h5>
                  <p className="kpi-value" style={{ color: '#9b59b6' }}>{reportData.occupancy?.check_outs_today || 0}</p>
                </div>

                <div className="kpi-card">
                  <h5 className="kpi-label">Dirty Rooms</h5>
                  <p className="kpi-value" style={{ color: '#e67e22' }}>{reportData.rooms?.dirty_rooms || 0}</p>
                </div>
              </div>

              <div className="report-cards">
                <div className="report-card">
                  <h4>💳 Payment Breakdown</h4>
                  <div className="payment-breakdown">
                    <p><span>Cash:</span> <strong>₹{reportData.revenue?.cash_revenue || 0}</strong></p>
                    <p><span>Card:</span> <strong>₹{reportData.revenue?.card_revenue || 0}</strong></p>
                    <p><span>UPI:</span> <strong>₹{reportData.revenue?.upi_revenue || 0}</strong></p>
                  </div>
                </div>

                <div className="report-card">
                  <h4>🛏️ Room Revenue</h4>
                  <div className="revenue-breakdown">
                    <p><span>Room Charges:</span> <strong>₹{reportData.revenue?.room_charge_revenue || 0}</strong></p>
                    <p><span>Other Revenue:</span> <strong>₹{(reportData.revenue?.total_revenue || 0) - (reportData.revenue?.room_charge_revenue || 0)}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="report-section">
              <h3>📅 Monthly Report - {reportMonth}/{reportYear}</h3>
              
              <div className="report-summary-card">
                <h4>Monthly Summary</h4>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">₹{reportData.totals?.total_revenue || 0}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Total Bills</span>
                    <span className="stat-value">{reportData.totals?.total_bills || 0}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Average Bill</span>
                    <span className="stat-value">₹{reportData.totals?.average_bill_amount || 0}</span>
                  </div>
                </div>
              </div>

              {reportData.daily_breakdown && reportData.daily_breakdown.length > 0 && (
                <div className="report-table-section">
                  <h4>Daily Breakdown</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="text-right">Revenue</th>
                        <th className="text-right">Bills Count</th>
                        <th className="text-right">Avg Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.daily_breakdown.map((day, idx) => (
                        <tr key={idx}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td className="text-right font-bold">₹{day.daily_revenue || 0}</td>
                          <td className="text-right">{day.bills_count || 0}</td>
                          <td className="text-right">₹{day.bills_count ? Math.round(day.daily_revenue / day.bills_count) : 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {reportType === 'statistics' && (
            <div className="report-section">
              <h3>👥 Guest Statistics</h3>
              <div className="kpi-cards">
                <div className="kpi-card">
                  <h5 className="kpi-label">Total Guests</h5>
                  <p className="kpi-value" style={{ color: '#667eea' }}>{reportData.total_guests || 0}</p>
                </div>
                <div className="kpi-card">
                  <h5 className="kpi-label">Last 30 Days</h5>
                  <p className="kpi-value" style={{ color: '#1abc9c' }}>{reportData.guests_last_30_days || 0}</p>
                </div>
                <div className="kpi-card">
                  <h5 className="kpi-label">Upcoming</h5>
                  <p className="kpi-value" style={{ color: '#f39c12' }}>{reportData.upcoming_guests || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

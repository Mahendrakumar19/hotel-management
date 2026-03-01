import React, { useState } from 'react';
import { reportingService } from '../services/api';
import '../styles/components.css';

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

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
          data = await reportingService.getOccupancyReport(reportDate, reportDate);
          break;
        case 'revenue':
          data = await reportingService.getRevenueReport(reportDate, reportDate);
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

  return (
    <div className="module-container">
      <h2>Reports & Analytics</h2>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="occupancy">Occupancy Report</option>
            <option value="revenue">Revenue Report</option>
            <option value="statistics">Guest Statistics</option>
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
            <label>Month:</label>
            <input 
              type="number" 
              min="1" 
              max="12" 
              value={reportMonth}
              onChange={(e) => setReportMonth(parseInt(e.target.value))}
            />
            <label>Year:</label>
            <input 
              type="number" 
              min="2020" 
              value={reportYear}
              onChange={(e) => setReportYear(parseInt(e.target.value))}
            />
          </div>
        )}

        <button onClick={handleGenerateReport} className="btn-primary">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="report-content">
          {reportType === 'daily' && (
            <div className="report-section">
              <h3>Daily Report - {reportDate}</h3>
              
              <div className="report-cards">
                <div className="report-card">
                  <h4>Room Statistics</h4>
                  <p>Total Rooms: {reportData.rooms?.total_rooms}</p>
                  <p>Occupied: {reportData.rooms?.occupied_rooms}</p>
                  <p>Dirty: {reportData.rooms?.dirty_rooms}</p>
                  <p>Occupancy Rate: {reportData.rooms?.occupancy_rate}%</p>
                </div>

                <div className="report-card">
                  <h4>Revenue</h4>
                  <p>Total: ₹ {reportData.revenue?.total_revenue}</p>
                  <p>Cash: ₹ {reportData.revenue?.cash_revenue}</p>
                  <p>Card: ₹ {reportData.revenue?.card_revenue}</p>
                  <p>UPI: ₹ {reportData.revenue?.upi_revenue}</p>
                  <p>Room Charges: ₹ {reportData.revenue?.room_charge_revenue}</p>
                </div>

                <div className="report-card">
                  <h4>Activity</h4>
                  <p>Check-ins Today: {reportData.occupancy?.check_ins_today}</p>
                  <p>Check-outs Today: {reportData.occupancy?.check_outs_today}</p>
                </div>
              </div>
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="report-section">
              <h3>Monthly Report - {reportMonth}/{reportYear}</h3>
              
              <div className="report-summary">
                <h4>Summary</h4>
                <p>Total Revenue: ₹ {reportData.totals?.total_revenue}</p>
                <p>Total Bills: {reportData.totals?.total_bills}</p>
                <p>Average Bill: ₹ {reportData.totals?.average_bill_amount}</p>
              </div>

              <div className="report-table">
                <h4>Daily Breakdown</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Revenue</th>
                      <th>Bills Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.daily_breakdown?.map((day, idx) => (
                      <tr key={idx}>
                        <td>{day.date}</td>
                        <td>₹ {day.daily_revenue}</td>
                        <td>{day.bills_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'statistics' && (
            <div className="report-section">
              <h3>Guest Statistics</h3>
              <div className="report-cards">
                <div className="report-card">
                  <p><strong>Total Guests:</strong> {reportData.total_guests}</p>
                  <p><strong>Last 30 Days:</strong> {reportData.guests_last_30_days}</p>
                  <p><strong>Upcoming:</strong> {reportData.upcoming_guests}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

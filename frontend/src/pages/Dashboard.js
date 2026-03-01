import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { authService, roomService, reportingService } from '../services/api';
import Navigation from '../components/Navigation';
import RoomManagement from '../components/RoomManagement';
import ReservationManagement from '../components/ReservationManagement';
import CheckInCheckOut from '../components/CheckInCheckOut';
import BillingCenter from '../components/BillingCenter';
import Reports from '../components/Reports';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardStats();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      const roomStats = await roomService.getRoomStatistics();
      const today = new Date().toISOString().split('T')[0];
      const dailyReport = await reportingService.getDailyReport(today);
      
      setStats({
        rooms: roomStats,
        revenue: dailyReport.revenue,
        occupancy: dailyReport.occupancy
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Navigation user={user} onLogout={handleLogout} />
      
      <div className="dashboard-content">
        {!loading && (
          <div className="dashboard-header">
            <h1>Welcome, {user.name}</h1>
            <div className="quick-stats">
              <div className="stat-card">
                <h3>Total Rooms</h3>
                <p className="stat-value">{stats?.rooms?.total_rooms}</p>
              </div>
              <div className="stat-card occupied">
                <h3>Occupied</h3>
                <p className="stat-value">{stats?.rooms?.occupied_rooms}</p>
              </div>
              <div className="stat-card">
                <h3>Occupancy Rate</h3>
                <p className="stat-value">{stats?.rooms?.occupancy_rate}%</p>
              </div>
              <div className="stat-card revenue">
                <h3>Today's Revenue</h3>
                <p className="stat-value">₹ {stats?.revenue?.total_revenue}</p>
              </div>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/reservations" element={<ReservationManagement />} />
          <Route path="/check-in" element={<CheckInCheckOut />} />
          <Route path="/billing" element={<BillingCenter />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<div className="welcome-panel">Select an option from the menu</div>} />
        </Routes>
      </div>
    </div>
  );
}

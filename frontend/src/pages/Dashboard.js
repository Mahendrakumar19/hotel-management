import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { authService, roomService, reportingService, checkInService, reservationService } from '../services/api';
import Navigation from '../components/Navigation';
import RoomManagement from '../components/RoomManagement';
import ReservationManagement from '../components/ReservationManagement';
import CheckInCheckOut from '../components/CheckInCheckOut';
import BillingCenter from '../components/BillingCenter';
import Reports from '../components/Reports';
import StoreRequisition from '../components/StoreRequisition';
import PurchaseGRN from '../components/PurchaseGRN';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [todayCheckOuts, setTodayCheckOuts] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardStats();
  }, [navigate]);

  // Auto-refresh stats every 5 minutes
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    
    const interval = setInterval(() => {
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        loadDashboardStats();
      }
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, location]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const roomStats = await roomService.getRoomStatistics();
      const today = new Date().toISOString().split('T')[0];
      const dailyReport = await reportingService.getDailyReport(today);
      
      // Get today's check-ins and check-outs
      try {
        const checkIns = await checkInService.getActiveCheckIns();
        const todayCheckInCount = checkIns.filter(c => 
          new Date(c.check_in_time).toDateString() === new Date().toDateString()
        ).length;
        setTodayCheckIns(todayCheckInCount);
      } catch (e) {
        console.log('Could not load check-ins');
      }

      // Get pending reservations
      try {
        const reservations = await reservationService.getUpcomingReservations(1);
        const pending = reservations.filter(r => r.status === 'pending').length;
        setPendingReservations(pending);
      } catch (e) {
        console.log('Could not load reservations');
      }
      
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

  const occupancyPercentage = stats?.rooms?.occupancy_rate || 0;
  const occupancyColor = occupancyPercentage > 80 ? '#e74c3c' : occupancyPercentage > 50 ? '#f39c12' : '#27ae60';

  return (
    <div className="dashboard-container">
      <Navigation user={user} onLogout={handleLogout} />
      
      <div className="dashboard-content">
        {!loading && (
          <div className="dashboard-header">
            <div className="header-top">
              <div>
                <h1>Welcome, {user.name}</h1>
                <p className="header-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="refresh-controls">
                <button 
                  className="btn-refresh"
                  onClick={loadDashboardStats}
                  title="Refresh stats"
                >
                  ↻ Refresh
                </button>
                <label className="auto-refresh-toggle">
                  <input 
                    type="checkbox" 
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  />
                  Auto-refresh
                </label>
              </div>
            </div>
            
            <div className="quick-stats">
              {/* Occupied Rooms Card */}
              <div className="stat-card occupied-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Occupied Rooms</h3>
                  <p className="stat-value">{stats?.rooms?.occupied_rooms}/{stats?.rooms?.total_rooms}</p>
                  <button 
                    className="stat-action"
                    onClick={() => navigate('/dashboard/rooms')}
                  >
                    View Rooms
                  </button>
                </div>
              </div>

              {/* Occupancy Rate Card */}
              <div className="stat-card occupancy-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Occupancy Rate</h3>
                  <div className="occupancy-bar">
                    <div 
                      className="occupancy-fill" 
                      style={{ 
                        width: `${occupancyPercentage}%`,
                        backgroundColor: occupancyColor
                      }}
                    ></div>
                  </div>
                  <p className="stat-value">{occupancyPercentage}%</p>
                </div>
              </div>

              {/* Today's Revenue Card */}
              <div className="stat-card revenue-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Today's Revenue</h3>
                  <p className="stat-value">₹{stats?.revenue?.total_revenue || 0}</p>
                  <button 
                    className="stat-action"
                    onClick={() => navigate('/dashboard/billing')}
                  >
                    View Billing
                  </button>
                </div>
              </div>

              {/* Pending Reservations Card */}
              <div className="stat-card pending-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Pending Today</h3>
                  <p className="stat-value">{pendingReservations}</p>
                  <button 
                    className="stat-action"
                    onClick={() => navigate('/dashboard/reservations')}
                  >
                    View Reservations
                  </button>
                </div>
              </div>

              {/* Today's Check-Ins Card */}
              <div className="stat-card checkin-card">
                <div className="stat-icon">🔑</div>
                <div className="stat-content">
                  <h3>Today's Check-Ins</h3>
                  <p className="stat-value">{todayCheckIns}</p>
                  <button 
                    className="stat-action"
                    onClick={() => navigate('/dashboard/check-in')}
                  >
                    Check In Guest
                  </button>
                </div>
              </div>

              {/* Available Rooms Card */}
              <div className="stat-card available-card">
                <div className="stat-icon">🛏️</div>
                <div className="stat-content">
                  <h3>Available Rooms</h3>
                  <p className="stat-value">{(stats?.rooms?.total_rooms || 0) - (stats?.rooms?.occupied_rooms || 0)}</p>
                  <button 
                    className="stat-action"
                    onClick={() => navigate('/dashboard/reservations')}
                  >
                    New Reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading-spinner">Loading dashboard...</div>}

        <Routes>
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/reservations" element={<ReservationManagement />} />
          <Route path="/check-in" element={<CheckInCheckOut />} />
          <Route path="/billing" element={<BillingCenter />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/store-requisition" element={<StoreRequisition />} />
          <Route path="/purchase-grn" element={<PurchaseGRN />} />
          <Route path="/" element={<div className="welcome-panel">📊 Dashboard loaded. Select an option from the menu to continue.</div>} />
        </Routes>
      </div>
    </div>
  );
}

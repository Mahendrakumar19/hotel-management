import React, { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/api';
import '../styles/components.css';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0,
    dirty: 0
  });

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomService.getAllRooms(filter);
      setRooms(data);
      
      // Calculate stats
      if (!filter) {
        setStats({
          total: data.length,
          occupied: data.filter(r => r.status === 'occupied').length,
          vacant: data.filter(r => r.status === 'vacant').length,
          dirty: data.filter(r => r.status === 'dirty').length
        });
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await roomService.updateRoomStatus(roomId, newStatus);
      setSelectedRoom(null);
      loadRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'occupied': return '👥';
      case 'dirty': return '🧹';
      case 'vacant': return '✓';
      default: return '?';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return '#e74c3c';
      case 'dirty': return '#f39c12';
      case 'vacant': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const filterStats = [
    { label: 'All Rooms', value: null, count: stats.total, icon: '🏢' },
    { label: 'Occupied', value: 'occupied', count: stats.occupied, icon: '👥', color: '#e74c3c' },
    { label: 'Vacant', value: 'vacant', count: stats.vacant, icon: '✓', color: '#27ae60' },
    { label: 'Dirty', value: 'dirty', count: stats.dirty, icon: '🧹', color: '#f39c12' }
  ];

  return (
    <div className="module-container room-management">
      <div className="room-management-header">
        <h2>🛏️ Room Management</h2>
        <button 
          className="btn-primary"
          onClick={loadRooms}
          title="Refresh room list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Room Statistics */}
      <div className="room-stats">
        {filterStats.map((stat) => (
          <div 
            key={stat.label}
            className={`stat-item ${filter === stat.value ? 'active' : ''}`}
            onClick={() => setFilter(stat.value)}
          >
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-count">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        {filterStats.map((stat) => (
          <button 
            key={stat.label}
            className={`filter-btn ${filter === stat.value ? 'active' : ''}`}
            onClick={() => setFilter(stat.value)}
          >
            {stat.icon} {stat.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="loading-state">
          <p>⏳ Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <p>No rooms found</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div 
              key={room.id} 
              className={`room-card ${room.status}`}
              onClick={() => setSelectedRoom(room.id)}
            >
              <div className="room-card-header">
                <h3 className="room-number">{room.room_number}</h3>
                <span 
                  className="room-status-badge" 
                  style={{ backgroundColor: getStatusColor(room.status) }}
                  title={room.status.toUpperCase()}
                >
                  <span className="status-icon">{getStatusIcon(room.status)}</span>
                  <span className="status-text">{room.status.toUpperCase()}</span>
                </span>
              </div>

              <div className="room-info">
                <div className="room-detail">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{room.room_type}</span>
                </div>
                <div className="room-detail">
                  <span className="detail-label">Capacity:</span>
                  <span className="detail-value">{room.capacity} 👤</span>
                </div>
                <div className="room-detail">
                  <span className="detail-label">Rate:</span>
                  <span className="detail-value">₹{room.base_rate}/night</span>
                </div>
              </div>

              <div className="room-actions">
                <button 
                  className="status-btn vacant"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(room.id, 'vacant'); }}
                  title="Mark as Vacant"
                >
                  ✓ Vacant
                </button>
                <button 
                  className="status-btn occupied"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(room.id, 'occupied'); }}
                  title="Mark as Occupied"
                >
                  👥 Occupied
                </button>
                <button 
                  className="status-btn dirty"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(room.id, 'dirty'); }}
                  title="Mark as Dirty"
                >
                  🧹 Dirty
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Room Modal */}
      {selectedRoom && (
        <div className="room-modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="room-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal content can be added later */}
            <button 
              className="modal-close"
              onClick={() => setSelectedRoom(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/api';
import '../styles/components.css';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomService.getAllRooms(filter);
      setRooms(data);
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
      loadRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room status');
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

  return (
    <div className="module-container">
      <h2>Room Management</h2>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === null ? 'active' : ''}`}
          onClick={() => setFilter(null)}
        >
          All Rooms
        </button>
        <button 
          className={`filter-btn ${filter === 'occupied' ? 'active' : ''}`}
          onClick={() => setFilter('occupied')}
        >
          Occupied
        </button>
        <button 
          className={`filter-btn ${filter === 'vacant' ? 'active' : ''}`}
          onClick={() => setFilter('vacant')}
        >
          Vacant
        </button>
        <button 
          className={`filter-btn ${filter === 'dirty' ? 'active' : ''}`}
          onClick={() => setFilter('dirty')}
        >
          Dirty
        </button>
      </div>

      {loading ? (
        <p>Loading rooms...</p>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-header">
                <h3>{room.room_number}</h3>
                <span 
                  className="room-status" 
                  style={{ backgroundColor: getStatusColor(room.status) }}
                >
                  {room.status.toUpperCase()}
                </span>
              </div>

              <div className="room-details">
                <p><strong>Type:</strong> {room.room_type}</p>
                <p><strong>Capacity:</strong> {room.capacity} guests</p>
                <p><strong>Rate:</strong> ₹{room.base_rate}/night</p>
              </div>

              <div className="room-actions">
                <select 
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  value={room.status}
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="dirty">Dirty</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

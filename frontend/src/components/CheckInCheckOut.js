import React, { useState, useEffect } from 'react';
import { checkInService, reservationService, roomService } from '../services/api';
import '../styles/components.css';

export default function CheckInCheckOut() {
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInData, setCheckInData] = useState({
    reservationNumber: '',
    roomId: '',
    guestId: '',
    notes: ''
  });
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    loadActiveCheckIns();
  }, []);

  const searchReservation = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    if (!checkInData.reservationNumber.trim()) {
      setSearchError('Please enter a reservation number');
      return;
    }

    try {
      const reservation = await reservationService.getReservationByNumber(checkInData.reservationNumber);
      if (reservation) {
        setSelectedReservation(reservation);
        setSearchResults([reservation]);
        
        // Fetch room details if available
        if (reservation.room_id) {
          const room = await roomService.getRoomById(reservation.room_id);
          setSelectedRoom(room);
        }
      }
    } catch (error) {
      setSearchError('Reservation not found');
      setSearchResults([]);
      setSelectedReservation(null);
      setSelectedRoom(null);
    }
  };

  const loadActiveCheckIns = async () => {
    try {
      setLoading(true);
      const data = await checkInService.getActiveCheckIns();
      setActiveCheckIns(data);
    } catch (error) {
      console.error('Error loading active check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedReservation) {
        alert('Please search and select a reservation first');
        return;
      }

      // Check in guest using the selected reservation
      await checkInService.checkInGuest({
        reservationId: selectedReservation.id,
        roomId: selectedReservation.room_id,
        guestId: selectedReservation.guest_id,
        notes: checkInData.notes
      });

      alert('Guest checked in successfully');
      setShowCheckIn(false);
      setCheckInData({ reservationNumber: '', roomId: '', guestId: '', notes: '' });
      setSelectedReservation(null);
      setSelectedRoom(null);
      setSearchResults([]);
      loadActiveCheckIns();
    } catch (error) {
      alert('Error checking in: ' + error.message);
    }
  };

  const handleCheckOut = async (checkInId) => {
    if (window.confirm('Confirm checkout for this guest?')) {
      try {
        await checkInService.checkOutGuest(checkInId);
        alert('Guest checked out successfully');
        loadActiveCheckIns();
      } catch (error) {
        alert('Error checking out: ' + error.message);
      }
    }
  };

  const calculateStayDuration = (checkInTime) => {
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const hours = Math.floor((now - checkIn) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} days ${hours % 24} hours`;
    return `${hours} hours`;
  };

  return (
    <div className="module-container">
      <h2>Check-In / Check-Out</h2>

      <button 
        className="btn-primary"
        onClick={() => setShowCheckIn(!showCheckIn)}
      >
        {showCheckIn ? 'Cancel' : 'New Check-In'}
      </button>

      {showCheckIn && (
        <form onSubmit={handleCheckInSubmit} className="form-section">
          <h3>Check-In Guest</h3>
          
          {/* Search Section */}
          <div className="form-group">
            <h4>Find Reservation</h4>
            <form onSubmit={searchReservation} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Enter Reservation Number"
                  value={checkInData.reservationNumber}
                  onChange={(e) => {
                    setCheckInData({...checkInData, reservationNumber: e.target.value});
                    setSearchError('');
                  }}
                  required
                />
                <button type="submit" className="btn-search">Search</button>
              </div>
              {searchError && <p className="error-message">{searchError}</p>}
            </form>
          </div>

          {/* Reservation Details */}
          {selectedReservation && (
            <div className="reservation-details-section">
              <h4>Reservation Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Guest Name</label>
                  <p className="detail-value">{selectedReservation.first_name} {selectedReservation.last_name}</p>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <p className="detail-value">{selectedReservation.phone}</p>
                </div>
                <div className="detail-item">
                  <label>Reservation #</label>
                  <p className="detail-value">{selectedReservation.reservation_number}</p>
                </div>
                <div className="detail-item">
                  <label>Check-In Date</label>
                  <p className="detail-value">{new Date(selectedReservation.check_in_date).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <label>Check-Out Date</label>
                  <p className="detail-value">{new Date(selectedReservation.check_out_date).toLocaleDateString()}</p>
                </div>
                <div className="detail-item">
                  <label>Guests</label>
                  <p className="detail-value">{selectedReservation.number_of_guests}</p>
                </div>
              </div>
            </div>
          )}

          {/* Room Details */}
          {selectedRoom && (
            <div className="room-details-section">
              <h4>Room Details</h4>
              <div className="room-info-card">
                <div className="room-info-header">
                  <h5>{selectedRoom.room_number}</h5>
                  <span className={`room-type ${selectedRoom.room_type?.toLowerCase()}`}>
                    {selectedRoom.room_type}
                  </span>
                </div>
                <div className="room-info-details">
                  <p><strong>Capacity:</strong> {selectedRoom.capacity} guests</p>
                  <p><strong>Base Rate:</strong> ₹{selectedRoom.base_rate}/night</p>
                  <p><strong>Status:</strong> <span className="status-badge">{selectedRoom.status}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <h4>Additional Notes</h4>
            <div className="form-row">
              <textarea
                placeholder="Add any check-in notes (special requests, damages, etc.)"
                value={checkInData.notes}
                onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!selectedReservation}
            >
              Check In
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setShowCheckIn(false);
                setCheckInData({ reservationNumber: '', roomId: '', guestId: '', notes: '' });
                setSelectedReservation(null);
                setSelectedRoom(null);
                setSearchResults([]);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3>Currently Checked-In Guests</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="checkins-table">
          <table>
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Room</th>
                <th>Check-In Time</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeCheckIns.map((checkIn) => (
                <tr key={checkIn.id}>
                  <td>{checkIn.first_name} {checkIn.last_name}</td>
                  <td>{checkIn.phone}</td>
                  <td><strong>{checkIn.room_number}</strong></td>
                  <td>{new Date(checkIn.check_in_time).toLocaleString()}</td>
                  <td>{calculateStayDuration(checkIn.check_in_time)}</td>
                  <td>
                    <button 
                      className="btn-checkout"
                      onClick={() => handleCheckOut(checkIn.id)}
                    >
                      Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeCheckIns.length === 0 && (
            <p className="empty-message">No guests currently checked in</p>
          )}
        </div>
      )}
    </div>
  );
}

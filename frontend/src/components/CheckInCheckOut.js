import React, { useState, useEffect } from 'react';
import { checkInService, reservationService } from '../services/api';
import '../styles/components.css';

export default function CheckInCheckOut() {
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInData, setCheckInData] = useState({
    reservationNumber: '',
    roomId: '',
    guestId: '',
    notes: ''
  });

  useEffect(() => {
    loadActiveCheckIns();
  }, []);

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
      if (!checkInData.reservationNumber) {
        alert('Please enter a reservation number');
        return;
      }

      // Get reservation details
      const reservation = await reservationService.getReservationByNumber(checkInData.reservationNumber);
      
      // Check in guest
      await checkInService.checkInGuest({
        reservationId: reservation.id,
        roomId: reservation.room_id || checkInData.roomId,
        guestId: reservation.guest_id,
        notes: checkInData.notes
      });

      alert('Guest checked in successfully');
      setShowCheckIn(false);
      setCheckInData({ reservationNumber: '', roomId: '', guestId: '', notes: '' });
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
          
          <div className="form-row">
            <input
              type="text"
              placeholder="Reservation Number"
              value={checkInData.reservationNumber}
              onChange={(e) => setCheckInData({...checkInData, reservationNumber: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Room ID (if not in reservation)"
              value={checkInData.roomId}
              onChange={(e) => setCheckInData({...checkInData, roomId: e.target.value})}
            />
          </div>

          <div className="form-row">
            <textarea
              placeholder="Notes"
              value={checkInData.notes}
              onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="btn-primary">Check In</button>
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

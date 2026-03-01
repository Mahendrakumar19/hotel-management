import React, { useState, useEffect } from 'react';
import { reservationService, roomService, guestService } from '../services/api';
import '../styles/components.css';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('upcoming'); // 'upcoming' or 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    advancePayment: 0,
    notes: ''
  });
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    loadUpcomingReservations();
  }, []);

  const loadUpcomingReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getUpcomingReservations(30);
      setUpcomingReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchReservations = async (query) => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const data = await reservationService.searchReservations(query);
      setReservations(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestsForForm = async () => {
    try {
      const data = await guestService.searchGuests('');
      setGuests(data);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const handleDateChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'checkInDate' || name === 'checkOutDate') {
      if (formData.checkInDate && formData.checkOutDate) {
        try {
          const rooms = await roomService.getAvailableRooms(
            formData.checkInDate,
            formData.checkOutDate,
            formData.numberOfGuests
          );
          setAvailableRooms(rooms);
        } catch (error) {
          console.error('Error loading available rooms:', error);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reservationService.createReservation(formData);
      alert('Reservation created successfully!');
      setFormData({
        guestId: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1,
        advancePayment: 0,
        notes: ''
      });
      setShowForm(false);
      loadUpcomingReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      checked_in: '#3498db',
      checked_out: '#95a5a6',
      cancelled: '#e74c3c'
    };
    return <span style={{ color: colors[status] }}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Reservation Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) loadGuestsForForm();
          }}
        >
          {showForm ? 'Cancel' : 'New Reservation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label>Guest</label>
            <select 
              value={formData.guestId} 
              onChange={(e) => setFormData({...formData, guestId: e.target.value})}
              required
            >
              <option value="">Select a guest</option>
              {guests.map(g => (
                <option key={g.id} value={g.id}>
                  {g.first_name} {g.last_name} ({g.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Check-in Date</label>
              <input 
                type="date" 
                name="checkInDate" 
                value={formData.checkInDate}
                onChange={handleDateChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-out Date</label>
              <input 
                type="date" 
                name="checkOutDate" 
                value={formData.checkOutDate}
                onChange={handleDateChange}
                required
              />
            </div>
          </div>

          {availableRooms.length > 0 && (
            <div className="form-group">
              <label>Room</label>
              <select 
                value={formData.roomId}
                onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                required
              >
                <option value="">Select a room</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} - ₹{r.base_rate}/night
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Number of Guests</label>
              <input 
                type="number" 
                name="numberOfGuests"
                min="1"
                value={formData.numberOfGuests}
                onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Advance Payment</label>
              <input 
                type="number" 
                name="advancePayment"
                min="0"
                step="0.01"
                value={formData.advancePayment}
                onChange={(e) => setFormData({...formData, advancePayment: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Reservation'}
          </button>
        </form>
      )}

      <div className="view-tabs">
        <button 
          className={`tab ${view === 'upcoming' ? 'active' : ''}`}
          onClick={() => setView('upcoming')}
        >
          Upcoming 
        </button>
        <button 
          className={`tab ${view === 'search' ? 'active' : ''}`}
          onClick={() => setView('search')}
        >
          Search
        </button>
      </div>

      {view === 'upcoming' ? (
        <div className="reservations-list">
          {loading ? (
            <p>Loading reservations...</p>
          ) : upcomingReservations.length === 0 ? (
            <p>No upcoming reservations</p>
          ) : (
            upcomingReservations.map(res => (
              <div key={res.id} className="reservation-card">
                <div className="res-header">
                  <h4>{res.first_name} {res.last_name}</h4>
                  <span className="res-status">{getStatusBadge(res.status)}</span>
                </div>
                <div className="res-details">
                  <p><strong>Res #:</strong> {res.reservation_number}</p>
                  <p><strong>Room:</strong> {res.room_number}</p>
                  <p><strong>Check-in:</strong> {new Date(res.check_in_date).toLocaleDateString()}</p>
                  <p><strong>Check-out:</strong> {new Date(res.check_out_date).toLocaleDateString()}</p>
                  <p><strong>Guests:</strong> {res.number_of_guests}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="search-section">
          <input 
            type="text"
            placeholder="Search by name, phone, or reservation number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) searchReservations(e.target.value);
            }}
          />
          <div className="reservations-list">
            {reservations.map(res => (
              <div key={res.id} className="reservation-card">
                <div className="res-header">
                  <h4>{res.first_name} {res.last_name}</h4>
                  <span className="res-status">{getStatusBadge(res.status)}</span>
                </div>
                <div className="res-details">
                  <p><strong>Res #:</strong> {res.reservation_number}</p>
                  <p><strong>Room:</strong> {res.room_number}</p>
                  <p><strong>Check-in:</strong> {new Date(res.check_in_date).toLocaleDateString()}</p>
                  <p><strong>Guests:</strong> {res.number_of_guests}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

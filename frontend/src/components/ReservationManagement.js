import React, { useState, useEffect } from 'react';
import { reservationService, guestService, roomService } from '../services/api';
import '../styles/components.css';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1
  });

  useEffect(() => {
    loadUpcomingReservations();
  }, []);

  const loadUpcomingReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getUpcomingReservations(7);
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    try {
      const results = await reservationService.searchReservations(searchQuery);
      setReservations(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First create guest
      const guest = await guestService.createGuest({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email
      });

      // Then create reservation
      await reservationService.createReservation({
        guestId: guest.guest.id,
        roomId: formData.roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: formData.numberOfGuests
      });

      alert('Reservation created successfully');
      setShowForm(false);
      loadUpcomingReservations();
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: 1
      });
    } catch (error) {
      alert('Error creating reservation: ' + error.message);
    }
  };

  return (
    <div className="module-container">
      <h2>Reservation Management</h2>

      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, phone, or reservation number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
          <button 
            type="button" 
            className="btn-primary"
            onClick={() => { setShowForm(!showForm); setSearchQuery(''); loadUpcomingReservations(); }}
          >
            {showForm ? 'Cancel' : 'New Reservation'}
          </button>
        </form>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-section">
          <h3>Create New Reservation</h3>
          
          <div className="form-row">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              value={formData.checkInDate}
              onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
              required
            />
            <input
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              placeholder="Number of Guests"
              min="1"
              value={formData.numberOfGuests}
              onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
              required
            />
            <input
              type="text"
              placeholder="Room ID (optional)"
              value={formData.roomId}
              onChange={(e) => setFormData({...formData, roomId: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary">Create Reservation</button>
        </form>
      )}

      {loading ? (
        <p>Loading reservations...</p>
      ) : (
        <div className="reservations-list">
          <table>
            <thead>
              <tr>
                <th>Reservation #</th>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td><strong>{res.reservation_number}</strong></td>
                  <td>{res.first_name} {res.last_name}</td>
                  <td>{res.phone}</td>
                  <td>{new Date(res.check_in_date).toLocaleDateString()}</td>
                  <td>{new Date(res.check_out_date).toLocaleDateString()}</td>
                  <td>{res.number_of_guests}</td>
                  <td><span className="badge">{res.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

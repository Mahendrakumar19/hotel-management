import React, { useState, useEffect } from 'react';
import { reservationService, guestService, roomService } from '../services/api';
import '../styles/components.css';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
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

  // Fetch available rooms when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate && showForm) {
      fetchAvailableRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate, showForm]);

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

  const fetchAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      setRoomsLoaded(false);
      
      // Fetch all rooms
      const allRooms = await roomService.getAllRooms();
      
      // Fetch existing reservations for the date range
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      // Get all reservations to check for conflicts
      const allReservations = await reservationService.getUpcomingReservations(365);
      
      // Filter rooms that don't have reservations overlapping with selected dates
      const available = allRooms.filter(room => {
        const isReserved = allReservations.some(res => {
          const resCheckIn = new Date(res.check_in_date);
          const resCheckOut = new Date(res.check_out_date);
          
          // Check if dates overlap (only check non-cancelled reservations)
          return (
            res.room_id === room.id &&
            res.status !== 'cancelled' &&
            checkIn < resCheckOut &&
            checkOut > resCheckIn
          );
        });
        
        // Room is available if: no existing reservations AND room is vacant (not occupied/dirty)
        return !isReserved && room.status === 'vacant';
      });
      
      setAvailableRooms(available);
      setRoomsLoaded(true);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms([]);
      setRoomsLoaded(true);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear room selection when dates change
    if (name === 'checkInDate' || name === 'checkOutDate') {
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  };

  const selectRoom = (roomId) => {
    setFormData({ ...formData, roomId: roomId });
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
    
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!formData.roomId) {
      alert('Please select a room');
      return;
    }
    
    if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

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
      setAvailableRooms([]);
    } catch (error) {
      alert('Error creating reservation: ' + error.message);
    }
  };

  return (
    <div className="module-container reservation-management">
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
        <div className="form-section">
          <h3>Create New Reservation</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Guest Information */}
            <div className="form-group">
              <h4>Guest Information</h4>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
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
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Date and Guest Selection */}
            <div className="form-group">
              <h4>Reservation Details</h4>
              <div className="form-row">
                <div>
                  <label>Check-In Date *</label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div>
                  <label>Check-Out Date *</label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Number of Guests *"
                  min="1"
                  max="10"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            {/* Room Selection */}
            {formData.checkInDate && formData.checkOutDate && (
              <div className="form-group">
                <h4>Available Rooms</h4>
                
                {loadingRooms ? (
                  <div className="loading-rooms">
                    <p>⏳ Checking room availability...</p>
                  </div>
                ) : roomsLoaded && availableRooms.length === 0 ? (
                  <div className="no-rooms-available">
                    <p>❌ No rooms available for these dates. Please select different dates.</p>
                  </div>
                ) : roomsLoaded && availableRooms.length > 0 ? (
                  <div className="rooms-grid">
                    {availableRooms.map(room => (
                      <div
                        key={room.id}
                        className={`room-card ${formData.roomId === room.id ? 'selected' : ''}`}
                        onClick={() => selectRoom(room.id)}
                      >
                        <div className="room-header">
                          <h5>{room.room_number}</h5>
                          <span className={`room-type ${room.room_type?.toLowerCase()}`}>
                            {room.room_type}
                          </span>
                        </div>
                        <div className="room-details">
                          <p><strong>Capacity:</strong> {room.capacity} guests</p>
                          <p><strong>Rate:</strong> ${room.base_rate}/night</p>
                          <p><strong>Status:</strong> <span className="available">Available</span></p>
                        </div>
                        <div className="room-selection-indicator">
                          {formData.roomId == room.id ? '✓ Selected' : 'Click to select'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Reservation</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowForm(false);
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
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading reservations...</p>
      ) : (
        <div className="reservations-list">
          <h3>Upcoming Reservations (Next 7 Days)</h3>
          {reservations.length === 0 ? (
            <p className="no-data">No upcoming reservations</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reservation #</th>
                  <th>Guest Name</th>
                  <th>Phone</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Guests</th>
                  <th>Room</th>
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
                    <td>{res.room_number || 'N/A'}</td>
                    <td><span className={`badge badge-${res.status}`}>{res.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

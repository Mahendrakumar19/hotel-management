import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navigation.css';

export default function Navigation({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Hotel Management System</h2>
      </div>

      <ul className="nav-menu">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/dashboard/rooms">Rooms</Link></li>
        <li><Link to="/dashboard/reservations">Reservations</Link></li>
        <li><Link to="/dashboard/check-in">Check-In/Out</Link></li>
        {user?.role === 'f_and_b' || user?.role === 'admin' ? (
          <li><Link to="/dashboard/billing">Billing</Link></li>
        ) : null}
        {user?.role === 'admin' ? (
          <li><Link to="/dashboard/reports">Reports</Link></li>
        ) : null}
      </ul>

      <div className="user-menu">
        <span className="user-name">{user?.name}</span>
        <span className="user-role">{user?.role}</span>
        <button onClick={onLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navigation.css';

export default function Navigation({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'frontdesk', 'f_and_b'] },
    { path: '/dashboard/rooms', label: 'Rooms', icon: '🛏️', roles: ['admin', 'frontdesk', 'f_and_b'] },
    { path: '/dashboard/reservations', label: 'Reservations', icon: '📋', roles: ['admin', 'frontdesk', 'f_and_b'] },
    { path: '/dashboard/check-in', label: 'Check-In/Out', icon: '🔑', roles: ['admin', 'frontdesk'] },
    { path: '/dashboard/billing', label: 'Billing', icon: '💳', roles: ['admin', 'f_and_b'] },
    { path: '/dashboard/reports', label: 'Reports', icon: '📈', roles: ['admin'] },
    { path: '/dashboard/store-requisition', label: 'Store Requisition', icon: '📦', roles: ['admin', 'f_and_b'] },
    { path: '/dashboard/purchase-grn', label: 'Purchase GRN', icon: '📋', roles: ['admin'] }
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-brand">
          <h2>🏨 Hotel Management</h2>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {visibleItems.map((item) => (
          <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
            <Link 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="user-menu">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name" title={user?.name}>{user?.name}</span>
            <span className="user-role">{user?.role === 'f_and_b' ? 'F&B Manager' : user?.role === 'frontdesk' ? 'Front Desk' : 'Admin'}</span>
          </div>
        </div>
        <button onClick={onLogout} className="btn-logout" title="Logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

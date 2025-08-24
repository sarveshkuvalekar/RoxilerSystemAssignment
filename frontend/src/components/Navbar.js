// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#343a40',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link 
        to="/" 
        style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '1.5rem', 
          fontWeight: 'bold' 
        }}
      >
        Store Rating System
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated() ? (
          <>
            <span>Welcome, {user?.name}</span>
            <span style={{ 
              backgroundColor: user?.role === 'admin' ? '#dc3545' : user?.role === 'store_owner' ? '#ffc107' : '#28a745',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: user?.role === 'store_owner' ? 'black' : 'white'
            }}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link 
              to="/login" 
              style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#007bff', borderRadius: '4px' }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#28a745', borderRadius: '4px' }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
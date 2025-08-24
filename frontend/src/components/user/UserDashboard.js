// src/components/user/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { userAPI, authAPI } from '../../services/api';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [ratingUpdates, setRatingUpdates] = useState({});

  useEffect(() => {
    fetchStores();
  }, [filters]);

const fetchStores = async () => {
  try {
    setLoading(true);
    const response = await userAPI.getStores(filters);
    setStores(response.data);
  } catch (error) {
    console.error('Error fetching stores:', error);
    const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Error fetching stores';
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      await userAPI.submitRating(storeId, rating);
      setRatingUpdates({...ratingUpdates, [storeId]: rating});
      fetchStores(); // Refresh to get updated overall ratings
    } catch (error) {
      alert(error.response?.data?.error || 'Error submitting rating');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updatePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowPasswordForm(false);
      alert('Password updated successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating password');
    }
  };

  const StarRating = ({ storeId, currentRating, onRatingSubmit }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(currentRating || 0);

    useEffect(() => {
      setSelectedRating(currentRating || 0);
    }, [currentRating]);

    const handleStarClick = (rating) => {
      setSelectedRating(rating);
      onRatingSubmit(storeId, rating);
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: (hoveredRating >= star || selectedRating >= star) ? '#ffc107' : '#e0e0e0'
            }}
          >
            ★
          </button>
        ))}
        <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          {selectedRating > 0 ? `Your rating: ${selectedRating}` : 'Click to rate'}
        </span>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>User Dashboard</h1>
        <button 
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Change Password
        </button>
      </div>

      {showPasswordForm && (
        <form onSubmit={handlePasswordUpdate} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
          <h3>Change Password</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Current Password:</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>New Password (8-16 chars, 1 uppercase, 1 special):</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              required
              minLength={8}
              maxLength={16}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div>
            <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
              Update Password
            </button>
            <button type="button" onClick={() => setShowPasswordForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <h2>All Stores</h2>

      {/* Search and Filter */}
      <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search by store name"
          value={filters.name}
          onChange={(e) => setFilters({...filters, name: e.target.value})}
          style={{ padding: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Search by address"
          value={filters.address}
          onChange={(e) => setFilters({...filters, address: e.target.value})}
          style={{ padding: '0.5rem' }}
        />
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters({...filters, sortBy, sortOrder});
          }}
          style={{ padding: '0.5rem' }}
        >
          <option value="name-ASC">Name A-Z</option>
          <option value="name-DESC">Name Z-A</option>
          <option value="address-ASC">Address A-Z</option>
          <option value="address-DESC">Address Z-A</option>
        </select>
      </div>

      {/* Stores Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {stores.map((store) => (
          <div key={store.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#f8f9fa' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#333' }}>{store.name}</h3>
            <p style={{ margin: '0.25rem 0', color: '#666' }}>
              <strong>Address:</strong> {store.address}
            </p>
            <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Overall Rating:</strong> 
                <span style={{ fontSize: '1.2rem', color: '#ffc107', marginLeft: '0.5rem' }}>
                  {parseFloat(store.overall_rating).toFixed(1)} ★
                </span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Rate this store:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                <StarRating 
                  storeId={store.id}
                  currentRating={ratingUpdates[store.id] || store.user_rating}
                  onRatingSubmit={handleRatingSubmit}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No stores found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
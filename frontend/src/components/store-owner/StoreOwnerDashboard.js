// src/components/store-owner/StoreOwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { storeOwnerAPI, authAPI } from '../../services/api';

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingUsers: []
  });
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchStoreInfo();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await storeOwnerAPI.getDashboard();
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await storeOwnerAPI.getStore();
      setStoreInfo(response.data);
    } catch (error) {
      console.error('Error fetching store info:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Store Owner Dashboard</h1>
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

      {/* Store Information */}
      {storeInfo && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h2>Your Store Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <strong>Store Name:</strong> {storeInfo.name}
            </div>
            <div>
              <strong>Email:</strong> {storeInfo.email}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Address:</strong> {storeInfo.address}
            </div>
            <div>
              <strong>Average Rating:</strong> 
              <span style={{ fontSize: '1.2rem', color: '#ffc107', marginLeft: '0.5rem' }}>
                {parseFloat(storeInfo.average_rating).toFixed(1)} ★
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Rating Statistics</h2>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', backgroundColor: '#e7f3ff' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{dashboardData.averageRating}</h3>
            <p style={{ margin: 0, color: '#666' }}>Average Rating</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0f9ff' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>{dashboardData.totalRatings}</h3>
            <p style={{ margin: 0, color: '#666' }}>Total Ratings</p>
          </div>
        </div>
      </div>

      {/* Rating Users */}
      <div>
        <h2>Users Who Rated Your Store</h2>
        {dashboardData.ratingUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666', border: '1px solid #ddd', borderRadius: '8px' }}>
            No ratings yet. Encourage customers to rate your store!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {dashboardData.ratingUsers.map((ratingUser, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{ratingUser.name}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>{ratingUser.email}</div>
                  <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Rated on: {formatDate(ratingUser.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', color: '#ffc107' }}>
                    {'★'.repeat(ratingUser.rating)}{'☆'.repeat(5 - ratingUser.rating)}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {ratingUser.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, userFilters, storeFilters]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers(userFilters);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await adminAPI.getStores(storeFilters);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(userForm);
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setShowUserForm(false);
      fetchUsers();
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating user');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createStore(storeForm);
      setStoreForm({ name: '', email: '', address: '', owner_id: '' });
      setShowStoreForm(false);
      fetchStores();
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating store');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: activeTab === 'dashboard' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'dashboard' ? 'white' : 'black',
            border: '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('stores')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: activeTab === 'stores' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'stores' ? 'white' : 'black',
            border: '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          Stores
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <h2>Statistics</h2>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{stats.totalStores}</h3>
              <p>Total Stores</p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <h3>{stats.totalRatings}</h3>
              <p>Total Ratings</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Users</h2>
            <button 
              onClick={() => setShowUserForm(!showUserForm)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add User
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Create New User</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Name (20-60 chars)"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  required
                  minLength={20}
                  maxLength={60}
                  style={{ padding: '0.5rem' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                  style={{ padding: '0.5rem' }}
                />
                <input
                  type="password"
                  placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  required
                  minLength={8}
                  maxLength={16}
                  style={{ padding: '0.5rem' }}
                />
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <textarea
                placeholder="Address (max 400 chars)"
                value={userForm.address}
                onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                required
                maxLength={400}
                rows={2}
                style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
              />
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
                  Create User
                </button>
                <button type="button" onClick={() => setShowUserForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* User filters */}
          <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Filter by name"
              value={userFilters.name}
              onChange={(e) => setUserFilters({...userFilters, name: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Filter by email"
              value={userFilters.email}
              onChange={(e) => setUserFilters({...userFilters, email: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <select
              value={userFilters.role}
              onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
              style={{ padding: '0.5rem' }}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <select
              value={`${userFilters.sortBy}-${userFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setUserFilters({...userFilters, sortBy, sortOrder});
              }}
              style={{ padding: '0.5rem' }}
            >
              <option value="name-ASC">Name A-Z</option>
              <option value="name-DESC">Name Z-A</option>
              <option value="email-ASC">Email A-Z</option>
              <option value="email-DESC">Email Z-A</option>
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Address</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.address}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{user.role}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {user.role === 'store_owner' ? parseFloat(user.rating).toFixed(1) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'stores' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Stores</h2>
            <button 
              onClick={() => setShowStoreForm(!showStoreForm)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add Store
            </button>
          </div>

          {showStoreForm && (
            <form onSubmit={handleCreateStore} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Create New Store</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Store Name (20-60 chars)"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                  required
                  minLength={20}
                  maxLength={60}
                  style={{ padding: '0.5rem' }}
                />
                <input
                  type="email"
                  placeholder="Store Email"
                  value={storeForm.email}
                  onChange={(e) => setStoreForm({...storeForm, email: e.target.value})}
                  required
                  style={{ padding: '0.5rem' }}
                />
                <input
                  type="number"
                  placeholder="Owner ID (optional)"
                  value={storeForm.owner_id}
                  onChange={(e) => setStoreForm({...storeForm, owner_id: e.target.value})}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <textarea
                placeholder="Store Address (max 400 chars)"
                value={storeForm.address}
                onChange={(e) => setStoreForm({...storeForm, address: e.target.value})}
                required
                maxLength={400}
                rows={2}
                style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
              />
              <div style={{ marginTop: '1rem' }}>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
                  Create Store
                </button>
                <button type="button" onClick={() => setShowStoreForm(false)} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Store filters */}
          <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Filter by name"
              value={storeFilters.name}
              onChange={(e) => setStoreFilters({...storeFilters, name: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Filter by email"
              value={storeFilters.email}
              onChange={(e) => setStoreFilters({...storeFilters, email: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <input
              type="text"
              placeholder="Filter by address"
              value={storeFilters.address}
              onChange={(e) => setStoreFilters({...storeFilters, address: e.target.value})}
              style={{ padding: '0.5rem' }}
            />
            <select
              value={`${storeFilters.sortBy}-${storeFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setStoreFilters({...storeFilters, sortBy, sortOrder});
              }}
              style={{ padding: '0.5rem' }}
            >
              <option value="name-ASC">Name A-Z</option>
              <option value="name-DESC">Name Z-A</option>
              <option value="email-ASC">Email A-Z</option>
              <option value="email-DESC">Email Z-A</option>
            </select>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Address</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #ddd' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{store.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{store.email}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{store.address}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{parseFloat(store.rating).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
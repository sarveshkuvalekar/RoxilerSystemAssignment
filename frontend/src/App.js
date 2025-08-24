// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import StoreOwnerDashboard from './components/store-owner/StoreOwnerDashboard';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Welcome to Store Rating System</h1>
        <p style={{ fontSize: '1.2rem', margin: '2rem 0', color: '#666' }}>
          Please login or register to continue
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/login" style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            Login
          </a>
          <a href="/register" style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            Register
          </a>
        </div>
      </div>
    );
  }

  // Redirect to appropriate dashboard based on role
  if (user?.role === 'admin') return <Navigate to="/admin-dashboard" />;
  if (user?.role === 'user') return <Navigate to="/user-dashboard" />;
  if (user?.role === 'store_owner') return <Navigate to="/store-owner-dashboard" />;
  
  return <Navigate to="/login" />;
};

const Unauthorized = () => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h1>Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/user-dashboard" 
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/store-owner-dashboard" 
                element={
                  <ProtectedRoute requiredRole="store_owner">
                    <StoreOwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
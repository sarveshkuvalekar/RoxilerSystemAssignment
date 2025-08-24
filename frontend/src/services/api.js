import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Remove withCredentials if not using cookies
  withCredentials: false,
  // Add timeout
  timeout: 5000
});

// Add request interceptor for debugging and token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request configuration error:', error.message);
    return Promise.reject(error);
  }
);

// Handle responses and token expiration
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Is the backend server running?');
      return Promise.reject(new Error('Cannot connect to server. Please check if the server is running.'));
    }

    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  registerAdmin: (data) => api.post('/auth/admin/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  updatePassword: (data) => api.put('/auth/password', data)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (filters) => api.get('/admin/users', { params: filters }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStores: (filters) => api.get('/admin/stores', { params: filters }),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  updateStore: (storeId, storeData) => api.put(`/admin/stores/${storeId}`, storeData),
  deleteStore: (storeId) => api.delete(`/admin/stores/${storeId}`),
  getRatings: (filters) => api.get('/admin/ratings', { params: filters })
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getStores: (filters) => api.get('/user/stores', { params: filters }),
  submitRating: (storeId, rating) => api.post(`/user/stores/${storeId}/rating`, { rating }),
  getUserRating: (storeId) => api.get(`/user/stores/${storeId}/rating`),
  updateRating: (storeId, rating) => api.put(`/user/stores/${storeId}/rating`, { rating }),
  deleteRating: (storeId) => api.delete(`/user/stores/${storeId}/rating`)
};

export const storeOwnerAPI = {
  getDashboard: () => api.get('/store-owner/dashboard'),
  getStore: () => api.get('/store-owner/store'),
  updateStore: (data) => api.put('/store-owner/store', data),
  getRatings: (filters) => api.get('/store-owner/ratings', { params: filters }),
  respondToRating: (ratingId, response) => api.post(`/store-owner/ratings/${ratingId}/response`, { response })
};

export default api;
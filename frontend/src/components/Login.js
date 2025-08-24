// src/components/Login.js
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { authAPI } from '../services/api';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await authAPI.login(formData);
//       login(response.data.user, response.data.token);
      
//       // Redirect based on role
//       const role = response.data.user.role;
//       if (role === 'admin') navigate('/admin');
//       else if (role === 'user') navigate('/user');
//       else if (role === 'store_owner') navigate('/store-owner');
//       else navigate('/');
//     } catch (error) {
//       setError(error.response?.data?.error || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
//       <h2>Login</h2>
      
//       {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: '1rem' }}>
//           <label>Email:</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//           />
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label>Password:</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             width: '100%',
//             padding: '0.75rem',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </form>

//       <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//         <Link to="/register">Don't have an account? Register here</Link>
//       </div>
//     </div>
//   );
// };

// export default Login;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Login.css';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     userType: 'user' // Add userType field
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Determine the login endpoint based on user type
//       const endpoint = formData.userType === 'admin' 
//         ? 'http://localhost:5000/api/auth/admin-login'
//         : 'http://localhost:5000/api/auth/login';

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Store token and user info
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
        
//         // Redirect based on user type
//         if (formData.userType === 'admin') {
//           navigate('/admin-dashboard');
//         } else {
//           navigate('/dashboard');
//         }
//       } else {
//         setError(data.message || 'Login failed');
//       }
//     } catch (error) {
//       setError('Network error. Please try again.');
//       console.error('Login error:', error);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="login-container">
//       <div className="login-form">
//         <h2>Login to Store Rating System</h2>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <form onSubmit={handleSubmit}>
//           {/* User Type Selection */}
//           <div className="form-group">
//             <label>Login as:</label>
//             <div className="radio-group">
//               <label className="radio-label">
//                 <input
//                   type="radio"
//                   name="userType"
//                   value="user"
//                   checked={formData.userType === 'user'}
//                   onChange={handleChange}
//                 />
//                 User
//               </label>
//               <label className="radio-label">
//                 <input
//                   type="radio"
//                   name="userType"
//                   value="admin"
//                   checked={formData.userType === 'admin'}
//                   onChange={handleChange}
//                 />
//                 Admin
//               </label>
//             </div>
//           </div>

//           <div className="form-group">
//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               placeholder="Enter your email"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               placeholder="Enter your password"
//             />
//           </div>

//           <button 
//             type="submit" 
//             className="login-btn"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : `Login as ${formData.userType === 'admin' ? 'Admin' : 'User'}`}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>
//             Don't have an account? 
//             <span 
//               className="link"
//               onClick={() => navigate('/register')}
//             >
//               Register here
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await (formData.userType === 'admin' 
        ? authAPI.adminLogin(formData)
        : authAPI.login(formData));

      login(response.data.user, response.data.token);
      
      // Redirect based on role
      const role = response.data.user.role;
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'user') {
        navigate('/user');
      } else if (role === 'store_owner') {
        navigate('/store-owner');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Login as:</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <label>
              <input
                type="radio"
                name="userType"
                value="user"
                checked={formData.userType === 'user'}
                onChange={handleChange}
              /> User
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="admin"
                checked={formData.userType === 'admin'}
                onChange={handleChange}
              /> Admin
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : `Login as ${formData.userType === 'admin' ? 'Admin' : 'User'}`}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/register">Don't have an account? Register here</Link>
      </div>
    </div>
  );
};

export default Login;
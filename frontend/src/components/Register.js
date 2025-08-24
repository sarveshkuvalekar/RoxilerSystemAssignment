// // src/components/Register.js
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { authAPI } from '../services/api';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     address: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState([]);
  
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
//     setErrors([]);

//     try {
//       const response = await authAPI.register(formData);
//       login(response.data.user, response.data.token);
//       navigate('/user');
//     } catch (error) {
//       if (error.response?.data?.errors) {
//         setErrors(error.response.data.errors);
//       } else {
//         setErrors([{ msg: error.response?.data?.error || 'Registration failed' }]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
//       <h2>Register</h2>
      
//       {errors.length > 0 && (
//         <div style={{ color: 'red', marginBottom: '1rem' }}>
//           {errors.map((error, index) => (
//             <div key={index}>{error.msg}</div>
//           ))}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: '1rem' }}>
//           <label>Name (20-60 characters):</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             minLength={20}
//             maxLength={60}
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//           />
//         </div>

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
//           <label>Password (8-16 chars, 1 uppercase, 1 special char):</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             minLength={8}
//             maxLength={16}
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//           />
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label>Address (max 400 characters):</label>
//           <textarea
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             required
//             maxLength={400}
//             rows={3}
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', resize: 'vertical' }}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           style={{
//             width: '100%',
//             padding: '0.75rem',
//             backgroundColor: '#28a745',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {loading ? 'Registering...' : 'Register'}
//         </button>
//       </form>

//       <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//         <Link to="/login">Already have an account? Login here</Link>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    userType: 'user' // Add userType field
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
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
  setErrors([]);

  try {
    // Log the request data for debugging
    console.log('Sending registration request:', {
      url: formData.userType === 'admin' ? '/auth/admin/register' : '/auth/register',
      data: formData
    });

    const response = await (formData.userType === 'admin' 
      ? authAPI.registerAdmin(formData)
      : authAPI.register(formData));

    login(response.data.user, response.data.token);
    
    if (formData.userType === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    } else {
      setErrors([{ msg: error.response?.data?.error || 'Registration failed' }]);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Register</h2>
      
      {errors.length > 0 && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {errors.map((error, index) => (
            <div key={index}>{error.msg}</div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Add user type selection */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Register as:</label>
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

        {/* Existing form fields */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Name (20-60 characters):</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={20}
            maxLength={60}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
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
           <label>Password (8-16 chars, 1 uppercase, 1 special char):</label>
           <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            maxLength={16}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </div>

         <div style={{ marginBottom: '1rem' }}>
             <label>Address (max 400 characters):</label>
             <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            maxLength={400}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', resize: 'vertical' }}
          />
        </div>

        {/* ...other existing fields... */}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registering...' : `Register as ${formData.userType === 'admin' ? 'Admin' : 'User'}`}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/login">Already have an account? Login here</Link>
      </div>
    </div>
  );
};

export default Register;
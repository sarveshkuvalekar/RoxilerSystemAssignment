// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { userValidation, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Regular user registration
router.post('/register', userValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'user']
    );

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, name, email, role: 'user' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin registration - Fixed endpoint
router.post('/admin/register', userValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'admin']
    );

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: { id: result.insertId, name, email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Regular user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin login - Fixed endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND role = ?', 
      [email, 'admin']
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Admin login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate new password
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      });
    }

    // Get current user
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
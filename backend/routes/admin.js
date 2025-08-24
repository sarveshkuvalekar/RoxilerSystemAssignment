// routes/admin.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { userValidation, storeValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [storeCount] = await db.execute('SELECT COUNT(*) as total FROM stores');
    const [ratingCount] = await db.execute('SELECT COUNT(*) as total FROM ratings');

    res.json({
      totalUsers: userCount[0].total,
      totalStores: storeCount[0].total,
      totalRatings: ratingCount[0].total
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new user
router.post('/users', userValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, name, email, address, role }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users with filters and sorting
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, 
             COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ` GROUP BY u.id ORDER BY u.${sortBy} ${sortOrder}`;

    const [users] = await db.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new store
router.post('/stores', storeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if store email exists
    const [existingStores] = await db.execute('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStores.length > 0) {
      return res.status(400).json({ error: 'Store email already exists' });
    }

    // If owner_id provided, verify it exists and is a store_owner
    if (owner_id) {
      const [owners] = await db.execute('SELECT id FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owners.length === 0) {
        return res.status(400).json({ error: 'Invalid store owner ID' });
      }
    }

    const [result] = await db.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: { id: result.insertId, name, email, address, owner_id }
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all stores with filters and sorting
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, 
             COALESCE(AVG(r.rating), 0) as rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.${sortBy} ${sortOrder}`;

    const [stores] = await db.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
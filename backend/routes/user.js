// routes/user.js
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ratingValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Apply user authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['user']));

// Get all stores with user's ratings
router.get('/stores', async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    // Validate sort parameters to prevent SQL injection
    const validSortFields = ['name', 'address'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sanitizedSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sanitizedSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'ASC';
    
    let query = `
      SELECT 
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(CASE WHEN r.user_id != ? THEN r.rating END), 0) as overall_rating,
        MAX(CASE WHEN r.user_id = ? THEN r.rating END) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [req.user.id, req.user.id];

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name}%`);
    }
    
    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id, s.name, s.address`;
    query += ` ORDER BY s.${sanitizedSortBy} ${sanitizedSortOrder}`;

    console.log('Executing query:', query); // Debug log
    console.log('With parameters:', params); // Debug log

    const [stores] = await db.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// Submit or update rating
router.post('/stores/:storeId/rating', ratingValidation, handleValidationErrors, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [stores] = await db.execute('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRatings] = await db.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRatings.length > 0) {
      // Update existing rating
      await db.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Create new rating
      await db.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's rating for a specific store
router.get('/stores/:storeId/rating', async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const [ratings] = await db.execute(
      'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0].rating });
  } catch (error) {
    console.error('Get rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
// routes/store-owner.js
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply store owner authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['store_owner']));

// Get store owner's dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by this user
    const [stores] = await db.execute('SELECT id FROM stores WHERE owner_id = ?', [userId]);
    
    if (stores.length === 0) {
      return res.json({
        averageRating: 0,
        totalRatings: 0,
        ratingUsers: []
      });
    }

    const storeId = stores[0].id;

    // Get average rating
    const [avgResult] = await db.execute(
      'SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    // Get users who rated the store
    const [ratingUsers] = await db.execute(`
      SELECT u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json({
      averageRating: parseFloat(avgResult[0].average_rating).toFixed(2),
      totalRatings: avgResult[0].total_ratings,
      ratingUsers
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get store information
router.get('/store', async (req, res) => {
  try {
    const userId = req.user.id;

    const [stores] = await db.execute(`
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
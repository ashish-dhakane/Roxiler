const pool = require('../db/pool');

class RatingService {
  async submitRating(userId, storeId, rating) {
    // Check store exists
    const storeResult = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeResult.rows.length === 0) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already rated this store (upsert logic)
    const existing = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existing.rows.length > 0) {
      // Update existing rating
      const result = await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3 RETURNING id, user_id, store_id, rating',
        [rating, userId, storeId]
      );
      return { ...result.rows[0], updated: true };
    }

    // Create new rating
    const result = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING id, user_id, store_id, rating',
      [userId, storeId, rating]
    );
    return { ...result.rows[0], updated: false };
  }

  async updateRating(userId, storeId, rating) {
    const result = await pool.query(
      'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3 RETURNING id, user_id, store_id, rating',
      [rating, userId, storeId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Rating not found. You have not rated this store yet.');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  async getUserRatingForStore(userId, storeId) {
    const result = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }
}

module.exports = new RatingService();

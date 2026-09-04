const pool = require('../db/pool');

class StoreService {
  async createStore(name, email, address, ownerId = null) {
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const error = new Error('A store with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id',
      [name, email, address, ownerId]
    );

    return result.rows[0];
  }

  async listStores({ name, email, address, sort, order }) {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      conditions.push(`s.name ILIKE $${paramIndex}`);
      values.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      conditions.push(`s.email ILIKE $${paramIndex}`);
      values.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      conditions.push(`s.address ILIKE $${paramIndex}`);
      values.push(`%${address}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id';

    const validSortFields = ['name', 'email', 'address', 'rating'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    if (sortField === 'rating') {
      query += ` ORDER BY AVG(r.rating) ${sortOrder}`;
    } else {
      query += ` ORDER BY s.${sortField} ${sortOrder}`;
    }

    const result = await pool.query(query, values);

    return result.rows.map((row) => ({
      ...row,
      rating: parseFloat(parseFloat(row.rating).toFixed(2)),
      total_ratings: parseInt(row.total_ratings),
    }));
  }

  async searchStores(searchTerm, sort, order, userId = null) {
    let query = `
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as total_ratings
    `;

    // If userId is provided, also get their rating
    if (userId) {
      query += `,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) as user_rating
      `;
    }

    query += ' FROM stores s LEFT JOIN ratings r ON s.id = r.store_id';

    const values = [];
    let paramIndex = 1;

    if (userId) {
      values.push(userId);
      paramIndex++;
    }

    if (searchTerm) {
      query += ` WHERE s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex}`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    query += ' GROUP BY s.id';

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'rating'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    if (sortField === 'rating') {
      query += ` ORDER BY AVG(r.rating) ${sortOrder}`;
    } else {
      query += ` ORDER BY s.${sortField} ${sortOrder}`;
    }

    const result = await pool.query(query, values);

    return result.rows.map((row) => ({
      ...row,
      rating: parseFloat(parseFloat(row.rating).toFixed(2)),
      total_ratings: parseInt(row.total_ratings),
      user_rating: row.user_rating ? parseInt(row.user_rating) : null,
    }));
  }

  async getStoreById(storeId) {
    const result = await pool.query('SELECT * FROM stores WHERE id = $1', [storeId]);
    if (result.rows.length === 0) {
      const error = new Error('Store not found.');
      error.statusCode = 404;
      throw error;
    }
    return result.rows[0];
  }

  async getStoreByOwnerId(ownerId) {
    const result = await pool.query('SELECT * FROM stores WHERE owner_id = $1', [ownerId]);
    if (result.rows.length === 0) {
      const error = new Error('No store found for this owner.');
      error.statusCode = 404;
      throw error;
    }
    return result.rows[0];
  }

  async getStoreDashboard(ownerId) {
    const store = await this.getStoreByOwnerId(ownerId);

    // Get average rating
    const avgResult = await pool.query(
      'SELECT COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as total_ratings FROM ratings r WHERE r.store_id = $1',
      [store.id]
    );

    // Get users who rated this store
    const raters = await pool.query(
      `SELECT u.id, u.name, u.email, u.address,
              r.rating, r.updated_at as rated_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      average_rating: parseFloat(parseFloat(avgResult.rows[0].average_rating).toFixed(2)),
      total_ratings: parseInt(avgResult.rows[0].total_ratings),
      raters: raters.rows,
    };
  }
}

module.exports = new StoreService();

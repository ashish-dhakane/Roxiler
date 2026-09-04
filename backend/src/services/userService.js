const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const saltRounds = 10;

class UserService {
  async createUser(name, email, password, address, role = 'user') {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email, passwordHash, address, role]
    );

    return result.rows[0];
  }

  async listUsers({ name, email, address, role, sort, order }) {
    let query = 'SELECT id, name, email, address, role FROM users';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      conditions.push(`name ILIKE $${paramIndex}`);
      values.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      conditions.push(`email ILIKE $${paramIndex}`);
      values.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      conditions.push(`address ILIKE $${paramIndex}`);
      values.push(`%${address}%`);
      paramIndex++;
    }
    if (role) {
      conditions.push(`role = $${paramIndex}`);
      values.push(role);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const validSortFields = ['name', 'email', 'address', 'role'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getUserById(userId) {
    const result = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const user = result.rows[0];

    // If user is a store owner, get their store's average rating
    if (user.role === 'store_owner') {
      const storeResult = await pool.query(
        'SELECT s.id, s.name FROM stores s WHERE s.owner_id = $1',
        [userId]
      );

      if (storeResult.rows.length > 0) {
        const store = storeResult.rows[0];
        const ratingResult = await pool.query(
          'SELECT COALESCE(AVG(r.rating), 0) as average_rating, COUNT(r.id) as total_ratings FROM ratings r WHERE r.store_id = $1',
          [store.id]
        );
        user.store = {
          id: store.id,
          name: store.name,
          average_rating: parseFloat(parseFloat(ratingResult.rows[0].average_rating).toFixed(2)),
          total_ratings: parseInt(ratingResult.rows[0].total_ratings),
        };
      }
    }

    return user;
  }
async listAvailableStoreOwners() {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     WHERE u.role = 'store_owner' AND s.id IS NULL
     ORDER BY u.name`
  );
  return result.rows;
}
  async getDashboardStats() {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM stores'),
      pool.query('SELECT COUNT(*) FROM ratings'),
    ]);

    return {
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count),
    };
  }
}

module.exports = new UserService();

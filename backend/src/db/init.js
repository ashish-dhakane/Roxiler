const pool = require('./pool');

const schema = `
  -- Drop tables if they exist (in reverse dependency order)
  DROP TABLE IF EXISTS ratings CASCADE;
  DROP TABLE IF EXISTS stores CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  -- Create ENUM type for roles
  DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'normal', 'store_owner');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  -- Users table
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role user_role NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Index on users
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_role ON users(role);
  CREATE INDEX idx_users_name ON users(name);

  -- Stores table
  CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Index on stores
  CREATE INDEX idx_stores_name ON stores(name);
  CREATE INDEX idx_stores_owner ON stores(owner_id);

  -- Ratings table
  CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
  );

  -- Index on ratings
  CREATE INDEX idx_ratings_user ON ratings(user_id);
  CREATE INDEX idx_ratings_store ON ratings(store_id);
  CREATE INDEX idx_ratings_store_rating ON ratings(store_id, rating);

  -- Function to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Triggers for updated_at
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    await client.query(schema);
    console.log('Database schema initialized successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initDatabase;

// Run directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

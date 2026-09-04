const pool = require('./pool');

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('Resetting database...');
    await client.query('DROP TABLE IF EXISTS ratings CASCADE');
    await client.query('DROP TABLE IF EXISTS stores CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query("DROP TYPE IF EXISTS user_role CASCADE");
    console.log('Database reset successfully.');
  } catch (err) {
    console.error('Error resetting database:', err);
    throw err;
  } finally {
    client.release();
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

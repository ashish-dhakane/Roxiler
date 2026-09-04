const bcrypt = require('bcryptjs');
const pool = require('./pool');
const initDatabase = require('./init');

const saltRounds = 10;

async function seed() {
  const client = await pool.connect();
  try {
    // Initialize schema first
    await initDatabase();

    console.log('Seeding database...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('Admin@123', saltRounds);
    const normalPasswordHash = await bcrypt.hash('User@1234', saltRounds);
    const ownerPasswordHash = await bcrypt.hash('Owner@123', saltRounds);

    // Clear existing data
    await client.query('DELETE FROM ratings');
    await client.query('DELETE FROM stores');
    await client.query('DELETE FROM users');
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE stores_id_seq RESTART WITH 1");
    await client.query("ALTER SEQUENCE ratings_id_seq RESTART WITH 1");

    // Create Admin Users
    const admins = [
      { name: 'System Administrator User', email: 'admin@example.com', password: adminPasswordHash, address: '123 Admin Street, Admin City, Admin State 123456', role: 'admin' },
      { name: 'Second Admin User Account', email: 'admin2@example.com', password: adminPasswordHash, address: '456 Admin Avenue, Admin Town, Admin Province 654321', role: 'admin' },
    ];

    for (const admin of admins) {
      await client.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)',
        [admin.name, admin.email, admin.password, admin.address, admin.role]
      );
    }

    // Create Normal Users
    const normalUsers = [
      { name: 'John Normal User Smith', email: 'john@example.com', password: normalPasswordHash, address: '789 User Road, User City, User State 111222', role: 'normal' },
      { name: 'Jane Regular Customer Doe', email: 'jane@example.com', password: normalPasswordHash, address: '321 Customer Lane, Customer Town, Customer Province 333444', role: 'normal' },
      { name: 'Mike Average Member Brown', email: 'mike@example.com', password: normalPasswordHash, address: '654 Member Drive, Member City, Member State 555666', role: 'normal' },
      { name: 'Sarah Standard User Wilson', email: 'sarah@example.com', password: normalPasswordHash, address: '987 Standard Blvd, Standard Town, Standard Province 777888', role: 'normal' },
    ];

    for (const user of normalUsers) {
      await client.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)',
        [user.name, user.email, user.password, user.address, user.role]
      );
    }

    // Create Store Owners
    const storeOwners = [
      { name: 'Bob Store Owner Johnson', email: 'bob@example.com', password: ownerPasswordHash, address: '147 Owner Street, Owner City, Owner State 999000', role: 'store_owner' },
      { name: 'Alice Shop Manager Davis', email: 'alice@example.com', password: ownerPasswordHash, address: '258 Manager Ave, Manager Town, Manager Province 888777', role: 'store_owner' },
      { name: 'Charlie Business Lead Miller', email: 'charlie@example.com', password: ownerPasswordHash, address: '369 Business Blvd, Business City, Business State 666555', role: 'store_owner' },
    ];

    for (const owner of storeOwners) {
      await client.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)',
        [owner.name, owner.email, owner.password, owner.address, owner.role]
      );
    }

    // Create Stores (linked to store owners: ids 7=Bob, 8=Alice, 9=Charlie)
    const stores = [
      { name: 'Tech Galaxy Electronics Store', email: 'techgalaxy@example.com', address: '100 Electronics Way, Tech City, Tech State 101010', owner_id: 7 },
      { name: 'Fresh Market Organic Grocery', email: 'freshmarket@example.com', address: '200 Grocery Road, Fresh Town, Fresh Province 202020', owner_id: 8 },
      { name: 'Style Hub Fashion Boutique', email: 'stylehub@example.com', address: '300 Fashion Ave, Style City, Style State 303030', owner_id: 9 },
      { name: 'Quick Bites Restaurant Cafe', email: 'quickbites@example.com', address: '400 Restaurant Blvd, Quick Town, Quick Province 404040', owner_id: 7 },
      { name: 'Book Worm Library Corner', email: 'bookworm@example.com', address: '500 Library Lane, Book City, Book State 505050', owner_id: 8 },
    ];

    for (const store of stores) {
      await client.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)',
        [store.name, store.email, store.address, store.owner_id]
      );
    }

    // Create Ratings (user_store unique pairs)
    const ratings = [
      { user_id: 3, store_id: 1, rating: 5 },   // John rates Tech Galaxy: 5
      { user_id: 4, store_id: 1, rating: 4 },   // Jane rates Tech Galaxy: 4
      { user_id: 5, store_id: 1, rating: 3 },   // Mike rates Tech Galaxy: 3
      { user_id: 3, store_id: 2, rating: 4 },   // John rates Fresh Market: 4
      { user_id: 4, store_id: 2, rating: 5 },   // Jane rates Fresh Market: 5
      { user_id: 5, store_id: 3, rating: 2 },   // Mike rates Style Hub: 2
      { user_id: 3, store_id: 3, rating: 4 },   // John rates Style Hub: 4
      { user_id: 6, store_id: 4, rating: 3 },   // Some user rates Quick Bites: 3 (store owner Bob rated Quick Bites own store? Let's use normal users)
      { user_id: 3, store_id: 4, rating: 4 },   // John rates Quick Bites: 4
      { user_id: 4, store_id: 5, rating: 5 },   // Jane rates Book Worm: 5
      { user_id: 5, store_id: 5, rating: 4 },   // Mike rates Book Worm: 4
    ];

    // Actually user_id 6 is a store_owner. Let's use only normal users (3,4,5) for ratings.
    const validRatings = [
      { user_id: 3, store_id: 1, rating: 5 },
      { user_id: 4, store_id: 1, rating: 4 },
      { user_id: 5, store_id: 1, rating: 3 },
      { user_id: 3, store_id: 2, rating: 4 },
      { user_id: 4, store_id: 2, rating: 5 },
      { user_id: 5, store_id: 2, rating: 4 },
      { user_id: 3, store_id: 3, rating: 4 },
      { user_id: 4, store_id: 3, rating: 3 },
      { user_id: 3, store_id: 4, rating: 4 },
      { user_id: 5, store_id: 4, rating: 5 },
      { user_id: 4, store_id: 5, rating: 5 },
      { user_id: 5, store_id: 5, rating: 4 },
      { user_id: 3, store_id: 5, rating: 3 },
    ];

    for (const rating of validRatings) {
      await client.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [rating.user_id, rating.store_id, rating.rating]
      );
    }

    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('=================');
    console.log('Admin:      admin@example.com / Admin@123');
    console.log('Normal:     john@example.com / User@1234');
    console.log('Store Owner: bob@example.com / Owner@123');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

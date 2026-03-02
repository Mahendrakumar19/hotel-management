const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../hotel_management.db');
const db = new Database(dbPath);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create default users
    const adminPassword = await bcrypt.hash('admin@123', 10);
    const frontDeskPassword = await bcrypt.hash('frontdesk@123', 10);
    const fbPassword = await bcrypt.hash('fb@123', 10);

    const adminId = uuidv4();
    const frontDeskId = uuidv4();
    const fbId = uuidv4();

    // Check if users already exist
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (existingUsers.count === 0) {
      const insertUser = db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertUser.run(adminId, 'Admin User', 'admin@hotel.com', adminPassword, 'admin', 'active');
      insertUser.run(frontDeskId, 'Front Desk - John', 'frontdesk1@hotel.com', frontDeskPassword, 'front_desk', 'active');
      insertUser.run(fbId, 'F&B Manager - Sarah', 'fb@hotel.com', fbPassword, 'f_and_b', 'active');
      console.log('✓ Created 3 default users');
    } else {
      console.log('✓ Users already exist, skipping user creation');
    }

    // Check if rooms already exist
    const existingRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get();
    
    if (existingRooms.count === 0) {
      // Create rooms (20 rooms: 10 standard, 10 deluxe)
      const insertRoom = db.prepare(`
        INSERT INTO rooms (id, room_number, room_type, status, capacity, base_rate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 10 Standard rooms
      for (let i = 1; i <= 10; i++) {
        insertRoom.run(
          uuidv4(),
          `STD-${String(i).padStart(3, '0')}`,
          'standard',
          'vacant',
          2,
          1500.00
        );
      }

      // 10 Deluxe rooms
      for (let i = 1; i <= 10; i++) {
        insertRoom.run(
          uuidv4(),
          `DLX-${String(i).padStart(3, '0')}`,
          'deluxe',
          'vacant',
          3,
          2500.00
        );
      }
      console.log('✓ Created 20 rooms (10 standard, 10 deluxe)');
    } else {
      console.log('✓ Rooms already exist, skipping room creation');
    }

    console.log('\n✓ Database seeding completed successfully');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@hotel.com / admin@123');
    console.log('Front Desk: frontdesk1@hotel.com / frontdesk@123');
    console.log('F&B Manager: fb@hotel.com / fb@123');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

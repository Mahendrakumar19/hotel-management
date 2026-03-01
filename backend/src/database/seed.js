const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create default users
    const adminPassword = await bcrypt.hash('admin@123', 10);
    const frontDeskPassword = await bcrypt.hash('frontdesk@123', 10);
    const fbPassword = await bcrypt.hash('fb@123', 10);

    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES 
        ('Admin User', 'admin@hotel.com', ?, 'admin', 'active'),
        ('Front Desk - John', 'frontdesk1@hotel.com', ?, 'front_desk', 'active'),
        ('F&B Manager - Sarah', 'fb@hotel.com', ?, 'f_and_b', 'active')
      ON DUPLICATE KEY UPDATE email = email
    `, [adminPassword, frontDeskPassword, fbPassword]);

    // Create rooms (20 rooms: 10 standard, 10 deluxe)
    const standardRooms = [];
    const deluxeRooms = [];

    for (let i = 1; i <= 10; i++) {
      standardRooms.push([
        `STD-${String(i).padStart(3, '0')}`,
        'standard',
        'vacant',
        2,
        1500.00
      ]);
    }

    for (let i = 1; i <= 10; i++) {
      deluxeRooms.push([
        `DLX-${String(i).padStart(3, '0')}`,
        'deluxe',
        'vacant',
        3,
        2500.00
      ]);
    }

    const allRooms = [...standardRooms, ...deluxeRooms];

    for (const room of allRooms) {
      await pool.query(
        `INSERT INTO rooms (room_number, room_type, status, capacity, base_rate)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE room_number = room_number`,
        room
      );
    }

    console.log('✓ Database seeding completed successfully');
    console.log('✓ Created 3 default users and 20 rooms');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@hotel.com / admin@123');
    console.log('Front Desk: frontdesk1@hotel.com / frontdesk@123');
    console.log('F&B Manager: fb@hotel.com / fb@123');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

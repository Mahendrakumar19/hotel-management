const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../hotel_management.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const schema = [
  // Users Table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'front_desk', 'f_and_b')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Rooms Table
  `CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    room_type TEXT NOT NULL DEFAULT 'standard',
    status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'dirty', 'vacant')),
    capacity INTEGER NOT NULL DEFAULT 1,
    base_rate DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Guests Table
  `CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    id_type TEXT DEFAULT 'passport',
    id_number TEXT UNIQUE,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Reservations Table
  `CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    reservation_number TEXT UNIQUE NOT NULL,
    guest_id TEXT NOT NULL,
    room_id TEXT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    advance_payment DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Check-ins Table
  `CREATE TABLE IF NOT EXISTS check_ins (
    id TEXT PRIMARY KEY,
    guest_id TEXT NOT NULL,
    reservation_id TEXT,
    room_id TEXT NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Bills Table
  `CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT UNIQUE NOT NULL,
    guest_id TEXT NOT NULL,
    reservation_id TEXT,
    check_in_id TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'cancelled')),
    payment_method TEXT,
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (check_in_id) REFERENCES check_ins(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Bill Items Table
  `CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
  )`,

  // Guest Ledger Table
  `CREATE TABLE IF NOT EXISTS guest_ledger (
    id TEXT PRIMARY KEY,
    guest_id TEXT NOT NULL,
    bill_id TEXT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'payment', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (bill_id) REFERENCES bills(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Daily Reports Table
  `CREATE TABLE IF NOT EXISTS daily_reports (
    id TEXT PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    total_rooms INTEGER DEFAULT 0,
    occupied_rooms INTEGER DEFAULT 0,
    vacant_rooms INTEGER DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_guests INTEGER DEFAULT 0,
    check_ins_today INTEGER DEFAULT 0,
    check_outs_today INTEGER DEFAULT 0,
    notes TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Store Requisitions Table
  `CREATE TABLE IF NOT EXISTS store_requisitions (
    id TEXT PRIMARY KEY,
    requisition_number TEXT UNIQUE NOT NULL,
    item_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('PCS', 'BAG', 'BOX', 'LITER', 'KG')),
    priority TEXT NOT NULL CHECK (priority IN ('routine', 'urgent')) DEFAULT 'routine',
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    requested_by TEXT NOT NULL,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  )`,

  // Purchase GRN Table (Goods Receipt Note)
  `CREATE TABLE IF NOT EXISTS purchase_grn (
    id TEXT PRIMARY KEY,
    grn_number TEXT UNIQUE NOT NULL,
    invoice_number TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    received_quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('PCS', 'BAG', 'BOX', 'LITER', 'KG')),
    quality TEXT NOT NULL CHECK (quality IN ('good', 'partial', 'damaged')) DEFAULT 'good',
    status TEXT NOT NULL CHECK (status IN ('pending_approval', 'approved', 'received', 'rejected')) DEFAULT 'pending_approval',
    received_by TEXT NOT NULL,
    approved_by TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  )`,

  // Audit Logs Table
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    description TEXT,
    old_values TEXT,
    new_values TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
];

// Create indexes
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id)',
  'CREATE INDEX IF NOT EXISTS idx_check_ins_guest_id ON check_ins(guest_id)',
  'CREATE INDEX IF NOT EXISTS idx_check_ins_room_id ON check_ins(room_id)',
  'CREATE INDEX IF NOT EXISTS idx_bills_guest_id ON bills(guest_id)',
  'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
  'CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email)',
  'CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone)',
  'CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)',
  'CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status)',
  'CREATE INDEX IF NOT EXISTS idx_store_requisitions_status ON store_requisitions(status)',
  'CREATE INDEX IF NOT EXISTS idx_store_requisitions_requested_by ON store_requisitions(requested_by)',
  'CREATE INDEX IF NOT EXISTS idx_purchase_grn_status ON purchase_grn(status)',
  'CREATE INDEX IF NOT EXISTS idx_purchase_grn_received_by ON purchase_grn(received_by)',
  'CREATE INDEX IF NOT EXISTS idx_purchase_grn_vendor ON purchase_grn(vendor_name)'
];

async function runMigration() {
  console.log('Starting SQLite database migration...');
  
  try {
    // Create tables
    for (const sql of schema) {
      db.exec(sql);
    }
    
    console.log('✓ All tables created successfully');

    // Create indexes
    for (const idx of indexes) {
      db.exec(idx);
    }
    
    console.log('✓ All indexes created successfully');
    console.log('✓ Database file: ' + dbPath);
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

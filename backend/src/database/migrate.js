const pool = require('./connection');

const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'front_desk', 'f_and_b')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_number VARCHAR(50) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  status VARCHAR(20) NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'dirty', 'vacant')),
  capacity INT NOT NULL DEFAULT 1,
  base_rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  id_type VARCHAR(50) DEFAULT 'passport',
  id_number VARCHAR(100) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  guest_id CHAR(36) NOT NULL,
  room_id CHAR(36),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL DEFAULT 1,
  advance_payment DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  notes TEXT,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Check-ins Table
CREATE TABLE IF NOT EXISTS check_ins (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reservation_id CHAR(36) NOT NULL,
  room_id CHAR(36) NOT NULL,
  guest_id CHAR(36) NOT NULL,
  check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_time TIMESTAMP NULL,
  actual_checkout_date DATE,
  checked_in_by CHAR(36) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (guest_id) REFERENCES guests(id),
  FOREIGN KEY (checked_in_by) REFERENCES users(id)
);

-- F&B Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  guest_id CHAR(36),
  room_id CHAR(36),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  settlement_mode VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (settlement_mode IN ('cash', 'card', 'upi', 'room_charge')),
  bill_status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (bill_status IN ('open', 'settled', 'refunded')),
  created_by CHAR(36) NOT NULL,
  settled_by CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (settled_by) REFERENCES users(id)
);

-- Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  bill_id CHAR(36) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  rate DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- Guest Ledger Table
CREATE TABLE IF NOT EXISTS guest_ledger (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  check_in_id CHAR(36) NOT NULL,
  guest_id CHAR(36) NOT NULL,
  room_id CHAR(36) NOT NULL,
  entry_type VARCHAR(30) NOT NULL CHECK (entry_type IN ('room_charge', 'f_and_b', 'adjustment', 'payment')),
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  source_id CHAR(36),
  source_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (check_in_id) REFERENCES check_ins(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  report_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  room_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  f_and_b_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  occupancy_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_rooms INT NOT NULL DEFAULT 0,
  occupied_rooms INT NOT NULL DEFAULT 0,
  dirty_rooms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_id_number ON guests(id_number);
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_reservations_reservation_number ON reservations(reservation_number);
CREATE INDEX idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_check_ins_reservation_id ON check_ins(reservation_id);
CREATE INDEX idx_check_ins_room_id ON check_ins(room_id);
CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_guest_id ON bills(guest_id);
CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_bill_status ON bills(bill_status);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_guest_ledger_check_in_id ON guest_ledger(check_in_id);
CREATE INDEX idx_guest_ledger_guest_id ON guest_ledger(guest_id);
CREATE INDEX idx_guest_ledger_entry_type ON guest_ledger(entry_type);
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
CREATE INDEX idx_reservations_created_at ON reservations(created_at);
CREATE INDEX idx_bills_created_at ON bills(created_at);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at);
`;

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Split schema into individual statements and execute
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('✓ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

const Database = require('better-sqlite3');
const path = require('path');

// Create database file in backend directory
const dbPath = path.join(__dirname, '../../hotel_management.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create a promise wrapper for compatibility with existing code
class PoolWrapper {
  getConnection() {
    return Promise.resolve({
      beginTransaction: () => {
        db.exec('BEGIN TRANSACTION');
        return Promise.resolve();
      },
      query: (sql, params) => {
        try {
          const stmt = db.prepare(sql);
          if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const result = stmt.all(...params);
            return Promise.resolve([result, []]);
          } else {
            const result = stmt.run(...params);
            return Promise.resolve([{ changes: result.changes }, []]);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      },
      commit: () => {
        db.exec('COMMIT');
        return Promise.resolve();
      },
      rollback: () => {
        db.exec('ROLLBACK');
        return Promise.resolve();
      },
      release: () => {
        return Promise.resolve();
      }
    });
  }

  query(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const result = stmt.all(...params);
        return Promise.resolve([result, []]);
      } else {
        const result = stmt.run(...params);
        return Promise.resolve([{ changes: result.changes }, []]);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

const pool = new PoolWrapper();

console.log(`✓ SQLite database initialized at: ${dbPath}`);

module.exports = pool;

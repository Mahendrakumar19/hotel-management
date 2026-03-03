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
    const connectionState = {
      inTransaction: false
    };

    return Promise.resolve({
      beginTransaction: async () => {
        if (!connectionState.inTransaction) {
          try {
            db.exec('BEGIN TRANSACTION');
            connectionState.inTransaction = true;
          } catch (error) {
            console.error('Error beginning transaction:', error);
            throw error;
          }
        }
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
          console.error('Query error:', { sql, error: error.message });
          return Promise.reject(error);
        }
      },
      commit: async () => {
        if (connectionState.inTransaction) {
          try {
            db.exec('COMMIT');
            connectionState.inTransaction = false;
          } catch (error) {
            console.error('Error committing transaction:', error);
            throw error;
          }
        }
        return Promise.resolve();
      },
      rollback: async () => {
        if (connectionState.inTransaction) {
          try {
            db.exec('ROLLBACK');
            connectionState.inTransaction = false;
          } catch (error) {
            console.error('Error rolling back transaction:', error);
          }
        }
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
      console.error('Query error:', { sql, error: error.message });
      return Promise.reject(error);
    }
  }
}

const pool = new PoolWrapper();

console.log(`✓ SQLite database initialized at: ${dbPath}`);

module.exports = pool;

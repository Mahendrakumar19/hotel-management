const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '../hotel_management.db');

function removeDb() {
  if (fs.existsSync(dbPath)) {
    console.log('Removing existing DB:', dbPath);
    fs.unlinkSync(dbPath);
  } else {
    console.log('No existing DB found at', dbPath);
  }
}

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

function main() {
  try {
    removeDb();

    // Run migration then seed
    run('node src/database/migrate.js');
    run('node src/database/seed.js');

    console.log('\nDatabase reset complete.');
  } catch (err) {
    console.error('Reset failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) main();

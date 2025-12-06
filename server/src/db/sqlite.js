const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Enable foreign key constraints
    db.get("PRAGMA foreign_keys = ON");
    
    // Set timezone to Asia/Manila (SQLite doesn't have timezone support, we'll handle it in application code)
    db.get("SELECT strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime') as now", (err, row) => {
      if (err) {
        console.error('Error setting local time:', err);
      } else {
        console.log('SQLite current time (local):', row.now);
      }
    });
  }
});

// Enable WAL mode for better concurrency
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');
});

// Handle database errors
db.on('error', (err) => {
  console.error('SQLite database error:', err);
});

// Close the database connection when the Node process ends
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite database:', err);
    } else {
      console.log('SQLite database connection closed');
    }
    process.exit(0);
  });
});

module.exports = db;

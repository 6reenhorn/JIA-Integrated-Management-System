// src/db/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database.sqlite');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  db.run('PRAGMA foreign_keys = ON;');
});

// Add error handler
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'SQLITE_CANTOPEN') {
    console.error('Cannot open database. Please check file permissions and path.');
  }
});

// Add promisified methods
['run', 'get', 'all', 'each'].forEach(method => {
  db[`${method}Async`] = function(sql, ...params) {
    return new Promise((resolve, reject) => {
      this[method](sql, ...params, function(err, ...args) {
        if (err) return reject(err);
        resolve(this.changes ? { changes: this.changes, lastID: this.lastID } : args.length <= 1 ? args[0] : args);
      });
    });
  };
});

module.exports = db;
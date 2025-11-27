const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

class DBHelper {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'postgres'
    this.db = null;
    this.pgPool = null;
    this.initialize();
  }

  async initialize() {
    if (this.dbType === 'sqlite') {
      const dbPath = path.join(__dirname, 'database.sqlite');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error connecting to SQLite database:', err);
          process.exit(1);
        }
        console.log('Connected to SQLite database');
        this.db.run('PRAGMA journal_mode = WAL');
        this.db.run('PRAGMA foreign_keys = ON');
      });
    } else {
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      this.pgPool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
      });
    }
  }

  // Convert callback to promise
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.dbType === 'sqlite') {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        this.pgPool.query(sql, params)
          .then(res => resolve(res.rows))
          .catch(err => reject(err));
      }
    });
  }

  queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.dbType === 'sqlite') {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      } else {
        this.pgPool.query(sql, params)
          .then(res => resolve(res.rows[0] || null))
          .catch(err => reject(err));
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.dbType === 'sqlite') {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      } else {
        this.pgPool.query(sql, params)
          .then(res => resolve({ 
            lastID: res.rows[0]?.id || null, 
            changes: res.rowCount 
          }))
          .catch(err => reject(err));
      }
    });
  }

  // Helper methods for common operations
  async getAll(table, orderBy = 'id') {
    const sql = `SELECT * FROM ${table} ORDER BY ${orderBy}`;
    return this.query(sql);
  }

  async getById(table, id) {
    const sql = this.dbType === 'sqlite' 
      ? `SELECT * FROM ${table} WHERE id = ?`
      : `SELECT * FROM ${table} WHERE id = $1`;
    return this.queryOne(sql, [id]);
  }

  async insert(table, data) {
    const columns = Object.keys(data);
    const values = columns.map(col => data[col]);
    
    if (this.dbType === 'sqlite') {
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
      `;
      const result = await this.run(sql, values);
      return { id: result.lastID, ...data };
    } else {
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      const result = await this.query(sql, values);
      return result[0];
    }
  }

  async update(table, id, data) {
    const columns = Object.keys(data);
    const values = columns.map(col => data[col]);
    
    if (this.dbType === 'sqlite') {
      const setClause = columns.map(col => `${col} = ?`).join(', ');
      const sql = `
        UPDATE ${table}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await this.run(sql, [...values, id]);
      return this.getById(table, id);
    } else {
      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const sql = `
        UPDATE ${table}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${columns.length + 1}
        RETURNING *
      `;
      const result = await this.query(sql, [...values, id]);
      return result[0];
    }
  }

  // Advanced update with custom WHERE clause
  async updateWhere(table, data, where) {
    const dataColumns = Object.keys(data);
    const dataValues = Object.values(data);
    const whereColumns = Object.keys(where);
    const whereValues = Object.values(where);
    
    if (this.dbType === 'sqlite') {
      const setClause = dataColumns.map(col => `${col} = ?`).join(', ');
      const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ');
      const sql = `
        UPDATE ${table}
        SET ${setClause}
        WHERE ${whereClause}
      `;
      return this.run(sql, [...dataValues, ...whereValues]);
    } else {
      const setClause = dataColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const whereClause = whereColumns.map((col, i) => `${col} = $${dataColumns.length + i + 1}`).join(' AND ');
      const sql = `
        UPDATE ${table}
        SET ${setClause}
        WHERE ${whereClause}
        RETURNING *
      `;
      const result = await this.query(sql, [...dataValues, ...whereValues]);
      return result[0];
    }
  }

  async delete(table, id) {
    if (this.dbType === 'sqlite') {
      const sql = `
        UPDATE ${table}
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      return this.run(sql, [id]);
    } else {
      const sql = `
        UPDATE ${table}
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await this.query(sql, [id]);
      return result[0];
    }
  }

  // Hard delete (permanent)
  async hardDelete(table, id) {
    if (this.dbType === 'sqlite') {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      return this.run(sql, [id]);
    } else {
      const sql = `DELETE FROM ${table} WHERE id = $1`;
      return this.run(sql, [id]);
    }
  }

  // Delete with custom WHERE clause
  async deleteWhere(table, where) {
    const whereColumns = Object.keys(where);
    const whereValues = Object.values(where);
    
    if (this.dbType === 'sqlite') {
      const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ');
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      return this.run(sql, whereValues);
    } else {
      const whereClause = whereColumns.map((col, i) => `${col} = $${i + 1}`).join(' AND ');
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      return this.run(sql, whereValues);
    }
  }

  // Close database connections
  async close() {
    if (this.dbType === 'sqlite') {
      return new Promise((resolve, reject) => {
        this.db.close(err => {
          if (err) reject(err);
          else {
            console.log('SQLite connection closed');
            resolve();
          }
        });
      });
    } else if (this.pgPool) {
      await this.pgPool.end();
      console.log('PostgreSQL connection pool closed');
    }
  }
}

// Create a singleton instance
const dbHelper = new DBHelper();

// Handle application shutdown
process.on('SIGINT', async () => {
  await dbHelper.close();
  process.exit(0);
});

module.exports = { dbHelper, DBHelper };
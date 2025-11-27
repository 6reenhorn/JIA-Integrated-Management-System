const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { pool } = require('../db/postgres');
require('dotenv').config();

// Add this function near the top
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Initialize PostgreSQL pool
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize SQLite database with error handling
let sqliteDb;
try {
  const dbPath = path.join(__dirname, '../../db/database.sqlite');
  ensureDirectoryExists(dbPath);
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err);
      throw err;
    }
    console.log('Connected to SQLite database');
    // Enable foreign key constraints
    sqliteDb.run('PRAGMA foreign_keys = ON;');
  });
} catch (err) {
  console.error('Failed to initialize SQLite database:', err);
  process.exit(1);
}

// Convert SQLite callbacks to promises
const sqliteRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(query, params, function(err) {
      if (err) {
        console.error('SQLite run error:', {
          query,
          params,
          error: err.message
        });
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const sqliteAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper function to ensure timestamp columns exist
async function ensureTimestampColumns(tableName) {
  const requiredColumns = ['created_at', 'updated_at', 'deleted_at'];
  
  for (const column of requiredColumns) {
    try {
      // For PostgreSQL
      await pgPool.query(`
        ALTER TABLE ${tableName} 
        ADD COLUMN IF NOT EXISTS ${column} TIMESTAMP 
        ${column === 'created_at' ? 'DEFAULT CURRENT_TIMESTAMP' : 'DEFAULT NULL'}
      `);
      
      // For SQLite
      await sqliteRun(`
        ALTER TABLE ${tableName} 
        ADD COLUMN ${column} TIMESTAMP 
        ${column === 'created_at' ? 'DEFAULT CURRENT_TIMESTAMP' : 'DEFAULT NULL'}
      `);
      console.log(`Ensured ${column} exists in ${tableName}`);
    } catch (err) {
      // Ignore "already exists" or "duplicate column" errors
      if (!err.message.includes('already exists') && !err.message.includes('duplicate column')) {
        console.error(`Error ensuring ${column} in ${tableName}:`, err);
      }
    }
  }
}

async function initializeSQLiteTables() {
  try {
    // Create employees table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        contact TEXT,
        status VARCHAR(10) CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        avatar TEXT,
        address TEXT,
        salary VARCHAR(50),
        contact_name VARCHAR(255),
        contact_number VARCHAR(50),
        relationship VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create gcash_records table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS gcash_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount NUMERIC NOT NULL,
        service_charge NUMERIC DEFAULT 0,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
        charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'GCash')) NOT NULL,
        reference_number VARCHAR(100),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create paymaya_records table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS paymaya_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount NUMERIC NOT NULL,
        service_charge NUMERIC DEFAULT 0,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
        charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'PayMaya')) NOT NULL,
        reference_number VARCHAR(100),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create juanpay_records table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS juanpay_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        beginnings TEXT NOT NULL DEFAULT '[]',
        ending NUMERIC NOT NULL DEFAULT 0,
        sales NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create inventory_items table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) CHECK (status IN ('In Stock', 'Low Stock', 'Out Of Stock')) DEFAULT 'In Stock',
        product_price NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        description TEXT,
        minimum_stock INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create categories table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name VARCHAR(100) UNIQUE NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create sales_records table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS sales_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Gcash', 'PayMaya', 'Juanpay')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create payroll_records table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS payroll_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name VARCHAR(255),
        emp_id VARCHAR(10),
        role VARCHAR(100),
        month INTEGER,
        year INTEGER,
        basic_salary NUMERIC,
        deductions NUMERIC,
        net_salary NUMERIC,
        status VARCHAR(20),
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    // Create attendance table
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        time_out TIMESTAMP,
        status VARCHAR(20) DEFAULT 'Present',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NULL,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_sales_records_date ON sales_records(date)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_payroll_records_emp_id ON payroll_records(emp_id)');

    console.log('All SQLite tables created successfully');
  } catch (error) {
    console.error('Error initializing SQLite tables:', error);
    throw error;
  }
}

const syncTable = async (tableName, idField, fields, conflictFields) => {
  try {
    // Skip ensuring timestamp columns since they're already in the table definition
    console.log(`Syncing ${tableName} since 1970-01-01T00:00:00.000Z`);
    
    // Get the last sync time for this table
    const lastSyncResult = await sqliteAll(
      'SELECT last_sync FROM sync_metadata WHERE table_name = ?',
      [tableName]
    );
    
    const lastSync = lastSyncResult[0]?.last_sync 
      ? new Date(lastSyncResult[0].last_sync) 
      : new Date(0); // Unix epoch

    // Get records from PostgreSQL that were updated since last sync
    // Exclude records that have deleted_at set (soft-deleted records)
    const pgQuery = `
      SELECT * FROM ${tableName} 
      WHERE (updated_at > $1 OR (updated_at IS NULL AND created_at > $1))
      AND deleted_at IS NULL
      ORDER BY ${idField}
    `;
    
    const pgResult = await pool.query(pgQuery, [lastSync.toISOString()]);
    console.log(`Found ${pgResult.rows.length} ${tableName} records to sync`);

    // Sync to SQLite
    for (const row of pgResult.rows) {
      try {
        if (!row[idField]) {
          console.warn(`Skipping ${tableName} record with missing ${idField}:`, row);
          continue;
        }

        // Check if the record exists and is not deleted
        const existing = await sqliteAll(
          `SELECT 1 FROM ${tableName} WHERE ${idField} = ? AND (deleted_at IS NULL OR deleted_at = '')`,
          [row[idField]]
        );

        if (existing.length > 0) {
          // Update existing record (only if not deleted)
          const updateFields = fields
            .filter(f => f !== idField)
            .map(f => `${f} = ?`)
            .join(', ');
          
          const updateValues = fields
            .filter(f => f !== idField)
            .map(f => row[f] === undefined ? null : row[f]);
          
          const updateSql = `
            UPDATE ${tableName} 
            SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
            WHERE ${idField} = ? AND (deleted_at IS NULL OR deleted_at = '')
          `;
          
          await sqliteRun(updateSql, [...updateValues, row[idField]]);
          console.log(`Updated ${tableName} record with ${idField}:`, row[idField]);
        } else {
          // For employees table, check if this employee was hard-deleted in SQLite
          // If an employee doesn't exist in SQLite but exists in PostgreSQL, it was likely hard-deleted
          // We should not restore hard-deleted employees
          if (tableName === 'employees') {
            // Check by emp_id (the idField for employees)
            const empIdCheck = await sqliteAll(
              `SELECT 1 FROM employees WHERE emp_id = ?`,
              [row.emp_id]
            );
            if (empIdCheck.length === 0) {
              // Employee doesn't exist in SQLite - was likely hard-deleted, don't restore
              console.log(`Skipping restoration of employee with emp_id: ${row.emp_id} - was likely hard-deleted in SQLite`);
              continue;
            }
          }
          // Insert new record
          try {
            const insertFields = fields.join(', ');
            const placeholders = fields.map(() => '?').join(', ');
            const insertValues = fields.map(f => row[f] === undefined ? null : row[f]);
            
            const insertSql = `
              INSERT INTO ${tableName} (${insertFields})
              VALUES (${placeholders})
            `;
            
            await sqliteRun(insertSql, insertValues);
            console.log(`Inserted new ${tableName} record with ${idField}:`, row[idField]);
          } catch (insertError) {
            if (insertError.code === 'SQLITE_CONSTRAINT' && insertError.message.includes('FOREIGN KEY')) {
              console.warn(`Skipping ${tableName} record due to missing foreign key:`, {
                id: row[idField],
                error: insertError.message
              });
              continue;
            }
            throw insertError;
          }
        }
      } catch (err) {
        console.error(`Error syncing ${tableName} record:`, {
          error: err.message,
          table: tableName,
          idField: idField,
          idValue: row[idField],
          row: row
        });
        // Continue with the next record even if one fails
      }
    }

    // Update last sync time
    await sqliteRun(`
      INSERT OR REPLACE INTO sync_metadata (table_name, last_sync)
      VALUES (?, CURRENT_TIMESTAMP)
    `, [tableName]);

    return { 
      success: true, 
      table: tableName, 
      synced: pgResult.rows.length 
    };
  } catch (error) {
    console.error(`Error syncing table ${tableName}:`, error);
    return { 
      success: false, 
      table: tableName, 
      error: error.message 
    };
  }
};

const initializeSync = async () => {
  try {
    console.log('Initializing database synchronization...');
    
    // Initialize SQLite tables first
    try {
      console.log('Creating SQLite tables if they do not exist...');
      await initializeSQLiteTables();
      console.log('SQLite tables initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite tables:', error);
      throw error;
    }

    // Create sync metadata table if it doesn't exist
    await sqliteRun(`
      CREATE TABLE IF NOT EXISTS sync_metadata (
        table_name TEXT PRIMARY KEY,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Define tables to sync with their fields and conflict fields
    const tables = [
      { 
        name: 'employees', 
        idField: 'emp_id',
        fields: ['emp_id', 'name', 'role', 'contact', 'status', 'last_login', 'avatar', 
                'address', 'salary', 'contact_name', 'contact_number', 'relationship', 'password',
                'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['name', 'role', 'contact', 'status', 'avatar', 'address', 
                        'salary', 'contact_name', 'contact_number', 'relationship', 'password',
                        'updated_at', 'deleted_at']
      },
      { 
        name: 'gcash_records', 
        idField: 'id',
        fields: ['id', 'amount', 'service_charge', 'transaction_type', 'charge_mop', 
                'reference_number', 'date', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['amount', 'service_charge', 'transaction_type', 'charge_mop', 
                        'reference_number', 'date', 'updated_at', 'deleted_at']
      },
      { 
        name: 'paymaya_records', 
        idField: 'id',
        fields: ['id', 'amount', 'service_charge', 'transaction_type', 'charge_mop', 
                'reference_number', 'date', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['amount', 'service_charge', 'transaction_type', 'charge_mop', 
                        'reference_number', 'date', 'updated_at', 'deleted_at']
      },
      { 
        name: 'juanpay_records', 
        idField: 'id',
        fields: ['id', 'date', 'beginnings', 'ending', 'sales', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['date', 'beginnings', 'ending', 'sales', 'updated_at', 'deleted_at']
      },
      { 
        name: 'inventory_items', 
        idField: 'id',
        fields: ['id', 'product_name', 'category', 'stock', 'status', 'product_price', 
                'total_amount', 'description', 'minimum_stock', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['product_name', 'category', 'stock', 'status', 'product_price', 
                        'total_amount', 'description', 'minimum_stock', 'updated_at', 'deleted_at']
      },
      { 
        name: 'categories', 
        idField: 'id',
        fields: ['id', 'category_name', 'color', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['category_name', 'color', 'updated_at', 'deleted_at']
      },
      { 
        name: 'sales_records', 
        idField: 'id',
        fields: ['id', 'date', 'product_name', 'quantity', 'price', 'total', 
                'payment_method', 'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['date', 'product_name', 'quantity', 'price', 'total', 
                        'payment_method', 'updated_at', 'deleted_at']
      },
      { 
        name: 'payroll_records', 
        idField: 'id',
        fields: ['id', 'employee_name', 'emp_id', 'role', 'month', 'year', 
                'basic_salary', 'deductions', 'net_salary', 'status', 'payment_date',
                'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['employee_name', 'emp_id', 'role', 'month', 'year', 
                        'basic_salary', 'deductions', 'net_salary', 'status', 'payment_date',
                        'updated_at', 'deleted_at']
      },
      { 
        name: 'attendance', 
        idField: 'id',
        fields: ['id', 'employee_id', 'date', 'time_in', 'time_out', 'status',
                'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['employee_id', 'date', 'time_in', 'time_out', 'status',
                        'updated_at', 'deleted_at']
      }
    ];

    // Sync each table
    const results = [];
    for (const table of tables) {
      try {
        console.log(`Syncing table: ${table.name}`);
        const result = await syncTable(
          table.name,
          table.idField,
          table.fields,
          table.conflictFields
        );
        results.push(result);
        console.log(`Successfully synced table: ${table.name}`);
      } catch (err) {
        console.error(`Error syncing table ${table.name}:`, err);
        results.push({ success: false, table: table.name, error: err.message });
        // Continue with other tables even if one fails
      }
    }
    
    console.log('Initial database sync completed');
    return { success: true, results };
  } catch (error) {
    console.error('Error initializing sync:', error);
    return { success: false, error: error.message };
  }
};

// Run sync on an interval (e.g., every 5 minutes)
const startSyncInterval = (intervalMinutes = 5) => {
  console.log(`Starting database sync every ${intervalMinutes} minutes`);
  const interval = setInterval(async () => {
    try {
      console.log('Running scheduled database sync...');
      await initializeSync();
    } catch (err) {
      console.error('Error during scheduled sync:', err);
    }
  }, intervalMinutes * 60 * 1000);

  // Return the interval ID so it can be cleared if needed
  return interval;
};

// Close database connections on process exit
process.on('SIGINT', async () => {
  try {
    console.log('Closing database connections...');
    if (pgPool) await pgPool.end();
    if (sqliteDb) {
      await new Promise((resolve, reject) => {
        sqliteDb.close(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('Database connections closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connections:', err);
    process.exit(1);
  }
});

module.exports = {
  initializeSync,
  startSyncInterval,
  syncTable
};
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
// Use the same database path as dbHelper
let sqliteDb;
try {
  const dbPath = path.join(__dirname, '../db/database.sqlite');
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

    // Add synced column to all tables for tracking unsynced records
    const tablesToAddSynced = [
      'employees', 'gcash_records', 'paymaya_records', 'juanpay_records',
      'inventory_items', 'categories', 'sales_records', 'payroll_records', 'attendance'
    ];
    
    for (const table of tablesToAddSynced) {
      try {
        // Check if column already exists by querying table info
        const tableInfo = await sqliteAll(`PRAGMA table_info(${table})`);
        const hasSyncedColumn = tableInfo.some(col => col.name === 'synced');
        
        if (!hasSyncedColumn) {
          await sqliteRun(`ALTER TABLE ${table} ADD COLUMN synced INTEGER DEFAULT 1`);
          console.log(`Added synced column to ${table}`);
        }
      } catch (err) {
        // Column already exists or other error, ignore duplicate column errors
        if (!err.message.includes('duplicate column') && !err.message.includes('duplicate column name')) {
          console.warn(`Could not add synced column to ${table}:`, err.message);
        }
      }
    }

    // Create indexes for better performance
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_sales_records_date ON sales_records(date)');
    await sqliteRun('CREATE INDEX IF NOT EXISTS idx_payroll_records_emp_id ON payroll_records(emp_id)');
    // Create index for synced column for faster queries
    for (const table of tablesToAddSynced) {
      try {
        await sqliteRun(`CREATE INDEX IF NOT EXISTS idx_${table}_synced ON ${table}(synced)`);
      } catch (err) {
        // Ignore errors
      }
    }

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

    // Get records from PostgreSQL that were updated since last sync OR don't exist in SQLite
    // First, get all records that were updated/created since last sync
    const pgQuery = `
      SELECT * FROM ${tableName} 
      WHERE (updated_at > $1 OR (updated_at IS NULL AND created_at > $1))
      AND deleted_at IS NULL
      ORDER BY ${idField}
    `;
    
    const pgResult = await pool.query(pgQuery, [lastSync.toISOString()]);
    
    // Also check for records that exist in PostgreSQL but not in SQLite (might have been missed)
    // Check if deleted_at column exists in SQLite
    let hasDeletedAt = true;
    try {
      await sqliteAll(`SELECT deleted_at FROM ${tableName} LIMIT 1`, []);
    } catch (err) {
      if (err.message.includes('no such column: deleted_at')) {
        hasDeletedAt = false;
      }
    }
    
    // Get ALL records from PostgreSQL (including deleted ones) to check what should exist
    const allPgRecordsIncludingDeleted = await pool.query(
      `SELECT ${idField}, deleted_at FROM ${tableName}`,
      []
    );
    
    // Get all non-deleted records from PostgreSQL (for finding missing records)
    const allPgRecords = await pool.query(
      `SELECT ${idField} FROM ${tableName} WHERE deleted_at IS NULL`,
      []
    );
    
    // Get all records that exist in SQLite (including soft-deleted ones to check)
    const sqliteQuery = hasDeletedAt
      ? `SELECT ${idField}, deleted_at FROM ${tableName}`
      : `SELECT ${idField} FROM ${tableName}`;
    const allSqliteRecords = await sqliteAll(sqliteQuery, []);
    
    // Only consider non-deleted records as "existing"
    const nonDeletedSqliteIds = new Set(
      allSqliteRecords
        .filter(r => !hasDeletedAt || !r.deleted_at)
        .map(r => String(r[idField]))
    );
    
    // Also track soft-deleted records - we don't want to restore these from PostgreSQL
    const softDeletedIds = new Set(
      allSqliteRecords
        .filter(r => hasDeletedAt && r.deleted_at)
        .map(r => String(r[idField]))
    );
    
    const missingIds = allPgRecords.rows
      .map(r => String(r[idField]))
      .filter(id => !nonDeletedSqliteIds.has(id) && !softDeletedIds.has(id)); // Don't restore soft-deleted records
    
    // If there are missing records, fetch them
    let missingRecords = [];
    if (missingIds.length > 0) {
      const placeholders = missingIds.map((_, i) => `$${i + 1}`).join(', ');
      const missingQuery = `
        SELECT * FROM ${tableName} 
        WHERE ${idField} IN (${placeholders}) AND deleted_at IS NULL
      `;
      const missingResult = await pool.query(missingQuery, missingIds);
      missingRecords = missingResult.rows;
      if (missingRecords.length > 0) {
        console.log(`Found ${missingRecords.length} ${tableName} records in PostgreSQL that don't exist in SQLite (excluding ${softDeletedIds.size} soft-deleted local records)`);
      }
    }
    
    // Combine both sets of records (avoid duplicates)
    const allRecordsToSync = [...pgResult.rows];
    const existingIds = new Set(pgResult.rows.map(r => String(r[idField])));
    for (const record of missingRecords) {
      if (!existingIds.has(String(record[idField]))) {
        allRecordsToSync.push(record);
      }
    }
    
    console.log(`Found ${allRecordsToSync.length} ${tableName} records to sync (${pgResult.rows.length} updated, ${missingRecords.length} missing)`);

    // Check for records that exist in SQLite but are deleted in PostgreSQL
    // These should be soft-deleted locally
    if (hasDeletedAt) {
      // Create a map of all PostgreSQL records: id -> deleted_at status
      const pgRecordMap = new Map();
      for (const pgRecord of allPgRecordsIncludingDeleted.rows) {
        pgRecordMap.set(String(pgRecord[idField]), {
          exists: true,
          deleted: !!pgRecord.deleted_at
        });
      }
      
      const sqliteNonDeleted = allSqliteRecords.filter(r => !r.deleted_at);
      
      for (const sqliteRecord of sqliteNonDeleted) {
        const sqliteId = String(sqliteRecord[idField]);
        const pgRecord = pgRecordMap.get(sqliteId);
        
        // If record exists in SQLite but is deleted in PostgreSQL, soft-delete it locally
        if (pgRecord && pgRecord.deleted) {
          // Check if it's unsynced - if so, don't delete it (it will be pushed)
          const existingCheck = await sqliteAll(
            `SELECT synced FROM ${tableName} WHERE ${idField} = ?`,
            [sqliteRecord[idField]]
          );
          
          if (existingCheck.length > 0 && existingCheck[0].synced !== 0 && existingCheck[0].synced !== '0') {
            // Soft-delete the record locally
            await sqliteRun(
              `UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP, synced = 1 WHERE ${idField} = ?`,
              [sqliteRecord[idField]]
            );
            console.log(`Soft-deleted ${tableName} record ${sqliteRecord[idField]} - was deleted in PostgreSQL`);
          } else {
            console.log(`Skipping soft-delete of ${tableName} record ${sqliteRecord[idField]} - has unsynced local changes`);
          }
        } else if (!pgRecord) {
          // Record exists in SQLite but doesn't exist at all in PostgreSQL
          // This means it was deleted remotely (hard delete or never existed)
          // Check if it's unsynced - if so, it might be a new local record, don't delete it
          const existingCheck = await sqliteAll(
            `SELECT synced, created_at FROM ${tableName} WHERE ${idField} = ?`,
            [sqliteRecord[idField]]
          );
          
          if (existingCheck.length > 0) {
            const syncedValue = existingCheck[0].synced;
            // If synced = 1, it was previously synced, so it was deleted remotely - soft-delete it
            // If synced = 0 or NULL, it's a new local record that hasn't been pushed yet - keep it
            if (syncedValue === 1 || syncedValue === '1') {
              // Soft-delete the record locally
              await sqliteRun(
                `UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP, synced = 1 WHERE ${idField} = ?`,
                [sqliteRecord[idField]]
              );
              console.log(`Soft-deleted ${tableName} record ${sqliteRecord[idField]} - doesn't exist in PostgreSQL (was previously synced)`);
            } else {
              console.log(`Keeping ${tableName} record ${sqliteRecord[idField]} - new local record (synced=${syncedValue}), not in PostgreSQL yet`);
            }
          }
        }
      }
    }

    // Sync to SQLite
    // Track which records were actually updated/inserted (not skipped)
    const actuallySyncedIds = [];
    
    for (const row of allRecordsToSync) {
      try {
        if (!row[idField]) {
          console.warn(`Skipping ${tableName} record with missing ${idField}:`, row);
          continue;
        }

        // Check if deleted_at column exists
        let hasDeletedAt = true;
        try {
          await sqliteAll(`SELECT deleted_at FROM ${tableName} LIMIT 1`, []);
        } catch (err) {
          if (err.message.includes('no such column: deleted_at')) {
            hasDeletedAt = false;
          }
        }
        
        // Check if the record exists and is not deleted
        // Also check if it was soft-deleted locally - if so, don't restore it
        // Also check if it's unsynced (synced = 0) - if so, don't overwrite local changes
        const deletedAtFilter = hasDeletedAt ? 'AND (deleted_at IS NULL OR deleted_at = \'\')' : '';
        const existing = await sqliteAll(
          `SELECT 1, deleted_at, synced FROM ${tableName} WHERE ${idField} = ?`,
          [row[idField]]
        );

        // If record exists and is soft-deleted locally, skip restoring it from PostgreSQL
        if (existing.length > 0 && hasDeletedAt && existing[0].deleted_at) {
          console.log(`Skipping ${tableName} record ${row[idField]} - was soft-deleted locally, not restoring from PostgreSQL`);
          continue;
        }

        // If record exists and is unsynced (synced = 0), skip overwriting it - it will be pushed later
        if (existing.length > 0) {
          const syncedValue = existing[0].synced;
          const syncedType = typeof syncedValue;
          console.log(`[DEBUG SYNC] ${tableName} record ${row[idField]}: existing=${existing.length > 0}, synced=${syncedValue} (type: ${syncedType}), deleted_at=${existing[0].deleted_at || 'null'}`);
          
          if (syncedValue === 0 || syncedValue === '0') {
            console.log(`Skipping ${tableName} record ${row[idField]} - has unsynced local changes (synced=${syncedValue}), not overwriting with remote data`);
            continue;
          }
        }

        if (existing.length > 0 && (!hasDeletedAt || !existing[0].deleted_at)) {
          // Update existing record (only if not deleted)
          // IMPORTANT: If the record has synced = 0, we should NOT overwrite it
          // The check above should have skipped it, but let's be extra safe
          if (existing[0].synced === 0 || existing[0].synced === '0') {
            console.log(`[WARNING] ${tableName} record ${row[idField]} has synced=0 but reached update block - this should not happen!`);
            continue;
          }
          
          // Update existing record (only if not deleted)
          // Exclude idField, updated_at, and synced (we preserve synced, set updated_at separately)
          const updateFields = fields
            .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
            .map(f => `${f} = ?`)
            .join(', ');
          
          const updateValues = fields
            .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
            .map(f => {
              const value = row[f];
              // Format date fields when syncing from PostgreSQL to SQLite
              if (f === 'date' || f === 'payment_date') {
                if (value === null || value === undefined) return null;
                // If it's a Date object, convert to YYYY-MM-DD
                if (value instanceof Date) {
                  if (isNaN(value.getTime())) return null;
                  const year = value.getFullYear();
                  const month = String(value.getMonth() + 1).padStart(2, '0');
                  const day = String(value.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }
                // If it's already a string in YYYY-MM-DD format, return it
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                  return value.split('T')[0].split(' ')[0];
                }
                // Try to parse and format
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  }
                } catch (e) {
                  // If parsing fails, return the original value
                }
              }
              return value === undefined ? null : value;
            });
          
          const updateDeletedAtFilter = hasDeletedAt ? 'AND (deleted_at IS NULL OR deleted_at = \'\')' : '';
          const updateSql = `
            UPDATE ${tableName} 
            SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
            WHERE ${idField} = ? ${updateDeletedAtFilter}
          `;
          
          await sqliteRun(updateSql, [...updateValues, row[idField]]);
          console.log(`Updated ${tableName} record with ${idField}:`, row[idField]);
          // Track that this record was actually synced
          actuallySyncedIds.push(row[idField]);
        } else {
          // For employees table, check if this is a new database (completely empty)
          // If the database is new, we should insert all employees from PostgreSQL
          // Only skip if the database has some employees but this specific one is missing (might have been hard-deleted)
          if (tableName === 'employees') {
            // Check if the employees table is completely empty (new database)
            const employeeCount = await sqliteAll(
              `SELECT COUNT(*) as count FROM employees`
            );
            const totalEmployees = employeeCount[0]?.count || 0;
            
            // If database is empty (new), insert all employees
            if (totalEmployees === 0) {
              console.log(`New database detected - inserting employee with emp_id: ${row.emp_id}`);
              // Continue to insert below
            } else {
              // Database has some employees - check if this specific one exists
              const empIdCheck = await sqliteAll(
                `SELECT 1 FROM employees WHERE emp_id = ?`,
                [row.emp_id]
              );
              if (empIdCheck.length === 0) {
                // Employee doesn't exist but database has other employees
                // This might have been hard-deleted, but with soft deletes we should restore it
                // Only skip if we're certain it was intentionally hard-deleted
                // For now, let's restore it since we're using soft deletes
                console.log(`Restoring employee with emp_id: ${row.emp_id} - exists in PostgreSQL but not in SQLite`);
                // Continue to insert below
              }
            }
          }
          
          // Special handling for categories: check if category with same name exists (including soft-deleted)
          if (tableName === 'categories' && row.category_name) {
            const existingCategory = await sqliteAll(
              `SELECT id, deleted_at, synced FROM categories WHERE category_name = ?`,
              [row.category_name]
            );
            
            if (existingCategory.length > 0) {
              const existing = existingCategory[0];
              // If category exists (even if soft-deleted), update it with PostgreSQL data
              const updateFields = fields
                .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                .map(f => `${f} = ?`)
                .join(', ');
              
              const updateValues = fields
                .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                .map(f => row[f] === undefined ? null : row[f]);
              
              // Restore soft-deleted category by clearing deleted_at
              const deletedAtClause = existing.deleted_at ? ', deleted_at = NULL' : '';
              const updateSql = `
                UPDATE categories 
                SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1${deletedAtClause}
                WHERE id = ?
              `;
              
              await sqliteRun(updateSql, [...updateValues, existing.id]);
              console.log(`Updated/restored category "${row.category_name}" (id: ${existing.id}) from PostgreSQL`);
              actuallySyncedIds.push(row[idField]);
              continue; // Skip the insert below
            }
          }
          
          // Insert new record
          try {
            // Use INSERT OR IGNORE to handle duplicate key errors gracefully
            // Include synced column with value 1 (pulled from PostgreSQL, so already synced)
            const insertFields = [...fields, 'synced'].join(', ');
            const placeholders = fields.map(() => '?').concat('?').join(', ');
            const insertValues = fields.map(f => {
              const value = row[f];
              // Format date fields when syncing from PostgreSQL to SQLite
              if (f === 'date' || f === 'payment_date') {
                if (value === null || value === undefined) return null;
                // If it's a Date object, convert to YYYY-MM-DD
                if (value instanceof Date) {
                  if (isNaN(value.getTime())) return null;
                  const year = value.getFullYear();
                  const month = String(value.getMonth() + 1).padStart(2, '0');
                  const day = String(value.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }
                // If it's already a string in YYYY-MM-DD format, return it
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                  return value.split('T')[0].split(' ')[0];
                }
                // Try to parse and format
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  }
                } catch (e) {
                  // If parsing fails, return the original value
                }
              }
              return value === undefined ? null : value;
            }).concat(1);
            
            const insertSql = `
              INSERT OR IGNORE INTO ${tableName} (${insertFields})
              VALUES (${placeholders})
            `;
            
            const insertResult = await sqliteRun(insertSql, insertValues);
            if (insertResult.changes > 0) {
              console.log(`Inserted new ${tableName} record with ${idField}:`, row[idField]);
              // Track that this record was actually synced
              actuallySyncedIds.push(row[idField]);
            } else {
              // Record already exists, update it instead
              const updateFields = fields
                .filter(f => f !== idField)
                .map(f => `${f} = ?`)
                .join(', ');
              const updateValues = fields
                .filter(f => f !== idField)
                .map(f => {
                  const value = row[f];
                  // Format date fields when syncing from PostgreSQL to SQLite
                  if (f === 'date' || f === 'payment_date') {
                    if (value === null || value === undefined) return null;
                    // If it's a Date object, convert to YYYY-MM-DD
                    if (value instanceof Date) {
                      if (isNaN(value.getTime())) return null;
                      const year = value.getFullYear();
                      const month = String(value.getMonth() + 1).padStart(2, '0');
                      const day = String(value.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    }
                    // If it's already a string in YYYY-MM-DD format, return it
                    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                      return value.split('T')[0].split(' ')[0];
                    }
                    // Try to parse and format
                    try {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      }
                    } catch (e) {
                      // If parsing fails, return the original value
                    }
                  }
                  return value === undefined ? null : value;
                });
              
              const updateSql = `
                UPDATE ${tableName} 
                SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1
                WHERE ${idField} = ?
              `;
              await sqliteRun(updateSql, [...updateValues, row[idField]]);
              console.log(`Updated existing ${tableName} record with ${idField}:`, row[idField]);
              // Track that this record was actually synced
              actuallySyncedIds.push(row[idField]);
            }
          } catch (insertError) {
            if (insertError.code === 'SQLITE_CONSTRAINT') {
              if (insertError.message.includes('FOREIGN KEY')) {
                console.warn(`Skipping ${tableName} record due to missing foreign key:`, {
                  id: row[idField],
                  error: insertError.message
                });
                continue;
              } else if (insertError.message.includes('UNIQUE constraint') && tableName === 'categories') {
                // For categories, if UNIQUE constraint fails, try to update existing category by name
                console.log(`UNIQUE constraint failed for category "${row.category_name}", attempting to update existing record...`);
                try {
                  const existingCategory = await sqliteAll(
                    `SELECT id, deleted_at FROM categories WHERE category_name = ?`,
                    [row.category_name]
                  );
                  
                  if (existingCategory.length > 0) {
                    const existing = existingCategory[0];
                    const updateFields = fields
                      .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                      .map(f => `${f} = ?`)
                      .join(', ');
                    
                    const updateValues = fields
                      .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                      .map(f => row[f] === undefined ? null : row[f]);
                    
                    const deletedAtClause = existing.deleted_at ? ', deleted_at = NULL' : '';
                    const updateSql = `
                      UPDATE categories 
                      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1${deletedAtClause}
                      WHERE id = ?
                    `;
                    
                    await sqliteRun(updateSql, [...updateValues, existing.id]);
                    console.log(`Updated/restored category "${row.category_name}" (id: ${existing.id}) from PostgreSQL after UNIQUE constraint error`);
                    actuallySyncedIds.push(row[idField]);
                    continue;
                  }
                } catch (updateError) {
                  console.error(`Error updating category after UNIQUE constraint:`, updateError);
                  throw insertError; // Re-throw original error
                }
              }
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

    // Mark only the records that were actually synced (updated/inserted) as synced=1
    // Don't mark records that were skipped (e.g., because they had synced = 0)
    if (actuallySyncedIds.length > 0) {
      const placeholders = actuallySyncedIds.map(() => '?').join(', ');
      await sqliteRun(`
        UPDATE ${tableName} 
        SET synced = 1 
        WHERE ${idField} IN (${placeholders})
      `, actuallySyncedIds);
      console.log(`Marked ${actuallySyncedIds.length} ${tableName} records as synced=1`);
    }

    // Update last sync time for pull
    await sqliteRun(`
      INSERT OR REPLACE INTO sync_metadata (table_name, last_sync)
      VALUES (?, CURRENT_TIMESTAMP)
    `, [tableName]);

    return { 
      success: true, 
      table: tableName, 
      synced: allRecordsToSync.length 
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

// Helper function to convert timestamp numbers to ISO date strings
const formatDateValue = (value, fieldName) => {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Check if it's a date/timestamp field
  const isDateField = fieldName === 'created_at' || fieldName === 'updated_at' || 
                      fieldName === 'deleted_at' || fieldName === 'date' || 
                      fieldName === 'payment_date' || fieldName === 'time_in' || 
                      fieldName === 'time_out' || fieldName === 'last_login';
  
  if (!isDateField) {
    return value;
  }
  
  // If it's already a string that looks like a date, return it
  if (typeof value === 'string') {
    // Check if it's already an ISO string or valid date string
    if (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return value;
    }
    // Try to parse it as a date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    return value;
  }
  
  // If it's a number, check if it's a timestamp (milliseconds since epoch)
  if (typeof value === 'number') {
    // Timestamps are typically large numbers (milliseconds since 1970)
    // Check if it's a reasonable timestamp (between 1970 and 2100)
    const minTimestamp = new Date('1970-01-01').getTime();
    const maxTimestamp = new Date('2100-01-01').getTime();
    
    if (value >= minTimestamp && value <= maxTimestamp) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    // If it's a small number, it might be a day/month/year, not a timestamp
    // Return as is for non-timestamp numbers
    return value;
  }
  
  return value;
};

// Push sync: Push unsynced SQLite records to PostgreSQL
const pushTableToPostgres = async (tableName, idField, fields) => {
  try {
    console.log(`Pushing unsynced ${tableName} records to PostgreSQL...`);
    
    // Check if deleted_at column exists first
    let hasDeletedAt = true;
    try {
      await sqliteAll(`SELECT deleted_at FROM ${tableName} LIMIT 1`, []);
    } catch (err) {
      if (err.message.includes('no such column: deleted_at')) {
        hasDeletedAt = false;
      }
    }
    
    const deletedAtFilter = hasDeletedAt ? 'AND deleted_at IS NULL' : '';
    
    // First, check for records that exist in SQLite but not in PostgreSQL
    // These should be marked as unsynced even if they have synced = 1
    const allSqliteRecords = await sqliteAll(
      `SELECT ${idField} FROM ${tableName} ${deletedAtFilter ? 'WHERE deleted_at IS NULL' : ''}`,
      []
    );
    
    if (allSqliteRecords.length > 0) {
      const sqliteIds = allSqliteRecords.map(r => r[idField]).filter(id => id != null);
      if (sqliteIds.length > 0) {
        // Check which records exist in PostgreSQL
        const placeholders = sqliteIds.map((_, i) => `$${i + 1}`).join(', ');
        const pgCheck = await pgPool.query(
          `SELECT ${idField} FROM ${tableName} WHERE ${idField} IN (${placeholders}) AND deleted_at IS NULL`,
          sqliteIds
        );
        
        const pgIds = new Set(pgCheck.rows.map(r => String(r[idField])));
        const missingInPg = sqliteIds.filter(id => !pgIds.has(String(id)));
        
        // Mark records that exist in SQLite but not in PostgreSQL as unsynced
        if (missingInPg.length > 0) {
          const updatePlaceholders = missingInPg.map(() => '?').join(', ');
          await sqliteRun(
            `UPDATE ${tableName} SET synced = 0 WHERE ${idField} IN (${updatePlaceholders}) ${deletedAtFilter}`,
            missingInPg
          );
          console.log(`Marked ${missingInPg.length} ${tableName} records as unsynced (exist in SQLite but not in PostgreSQL)`);
        }
      }
    }
    
    // Get unsynced records from SQLite (synced = 0 or NULL)
    const query = `SELECT * FROM ${tableName} WHERE (synced = 0 OR synced IS NULL) ${deletedAtFilter}`;
    console.log(`[PUSH DEBUG] ${tableName} query: ${query}`);
    const unsyncedRecords = await sqliteAll(query, []);
    
    // Debug: Check total records and their synced status
    const totalRecords = await sqliteAll(`SELECT COUNT(*) as count FROM ${tableName} WHERE deleted_at IS NULL`, []);
    const syncedCount = await sqliteAll(`SELECT COUNT(*) as count FROM ${tableName} WHERE synced = 1 AND deleted_at IS NULL`, []);
    const unsyncedCount = await sqliteAll(`SELECT COUNT(*) as count FROM ${tableName} WHERE (synced = 0 OR synced IS NULL) AND deleted_at IS NULL`, []);
    
    // Debug: For employees, also check by id to see if we can find the updated record
    if (tableName === 'employees') {
      const allEmployees = await sqliteAll(`SELECT id, emp_id, synced, name, deleted_at FROM employees WHERE deleted_at IS NULL`, []);
      console.log(`[PUSH DEBUG] All employees synced status:`, allEmployees.map(e => ({ id: e.id, emp_id: e.emp_id, synced: e.synced, name: e.name })));
    }
    
    console.log(`[${tableName}] Total: ${totalRecords[0]?.count || 0}, Synced: ${syncedCount[0]?.count || 0}, Unsynced: ${unsyncedCount[0]?.count || 0}`);
    console.log(`Found ${unsyncedRecords.length} unsynced ${tableName} records to push`);
    
    // Debug: Log first few unsynced records if any
    if (unsyncedRecords.length > 0) {
      console.log(`[${tableName}] Sample unsynced records:`, unsyncedRecords.slice(0, 3).map(r => ({
        id: r[idField],
        synced: r.synced,
        hasDeletedAt: r.deleted_at
      })));
    }
    
    let pushedCount = 0;
    for (const record of unsyncedRecords) {
      try {
        if (!record[idField]) {
          console.warn(`Skipping ${tableName} record with missing ${idField}`);
          continue;
        }

        // Special handling for attendance table: map employee_id from SQLite to PostgreSQL
        let mappedRecord = { ...record };
        if (tableName === 'attendance' && record.employee_id) {
          // Get the employee's emp_id from SQLite
          const sqliteEmployee = await sqliteAll(
            'SELECT emp_id FROM employees WHERE id = ?',
            [record.employee_id]
          );
          
          if (sqliteEmployee.length > 0) {
            const empId = sqliteEmployee[0].emp_id;
            // Find the employee's PostgreSQL id by emp_id
            const pgEmployee = await pgPool.query(
              'SELECT id FROM employees WHERE emp_id = $1 AND deleted_at IS NULL',
              [empId]
            );
            
            if (pgEmployee.rows.length > 0) {
              mappedRecord.employee_id = pgEmployee.rows[0].id;
              console.log(`[ATTENDANCE SYNC] Mapped employee_id: SQLite ${record.employee_id} (emp_id: ${empId}) -> PostgreSQL ${mappedRecord.employee_id}`);
            } else {
              console.warn(`[ATTENDANCE SYNC] Employee with emp_id ${empId} not found in PostgreSQL, skipping attendance record ${record.id}`);
              continue;
            }
          } else {
            console.warn(`[ATTENDANCE SYNC] Employee with id ${record.employee_id} not found in SQLite, skipping attendance record ${record.id}`);
            continue;
          }
        }

        // Check if record exists in PostgreSQL
        const pgCheck = await pgPool.query(
          `SELECT ${idField} FROM ${tableName} WHERE ${idField} = $1`,
          [mappedRecord[idField]]
        );

        // Filter out fields that don't exist in the record or are undefined
        // Use mappedRecord for attendance, regular record for others
        const recordToUse = tableName === 'attendance' ? mappedRecord : record;
        const availableFields = fields.filter(f => f !== 'synced' && recordToUse.hasOwnProperty(f));
        const fieldNames = availableFields.join(', ');
        const placeholders = availableFields.map((_, i) => `$${i + 1}`).join(', ');
        const values = availableFields.map(f => {
          const value = recordToUse[f];
          // Handle JSON fields (like beginnings in juanpay_records)
          if (f === 'beginnings' && typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          // Convert month name to number for payroll_records
          if (f === 'month' && tableName === 'payroll_records') {
            if (typeof value === 'string') {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                 'July', 'August', 'September', 'October', 'November', 'December'];
              const monthIndex = monthNames.findIndex(m => m.toLowerCase() === value.toLowerCase());
              if (monthIndex !== -1) {
                return monthIndex + 1; // Return 1-12
              }
              // Try parsing as number
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                return numValue;
              }
            }
            // If it's already a number, return it
            if (typeof value === 'number' && value >= 1 && value <= 12) {
              return value;
            }
            // Default to null if can't convert
            console.warn(`Invalid month value for payroll record: ${value}`);
            return null;
          }
          // Convert year to integer for payroll_records
          if (f === 'year' && tableName === 'payroll_records') {
            if (typeof value === 'string') {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 1970 && numValue <= 2100) {
                return numValue;
              }
            }
            // If it's already a number, return it
            if (typeof value === 'number' && value >= 1970 && value <= 2100) {
              return value;
            }
            // Default to null if can't convert
            console.warn(`Invalid year value for payroll record: ${value}`);
            return null;
          }
          // Format date/timestamp fields
          // Special handling for last_login which can be a timestamp number
          if (f === 'last_login') {
            if (value === null || value === undefined) {
              return null;
            }
            // If it's a number (timestamp), convert to Date then ISO string
            if (typeof value === 'number') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return date.toISOString();
              }
              return null;
            }
            // If it's already a string, try to parse it
            if (typeof value === 'string') {
              // If it's a timestamp string, parse it
              if (/^\d+$/.test(value)) {
                const date = new Date(parseInt(value, 10));
                if (!isNaN(date.getTime())) {
                  return date.toISOString();
                }
              }
              // If it's already an ISO string or valid date format, return it
              if (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/)) {
                return value;
              }
            }
            // Use formatDateValue for other cases
            return formatDateValue(value === undefined ? null : value, f);
          }
          // Format date/timestamp fields
          return formatDateValue(value === undefined ? null : value, f);
        });

        if (pgCheck.rows.length > 0) {
          // Update existing record in PostgreSQL
          // Exclude idField, synced, and updated_at (we set updated_at separately)
          const updateFields = availableFields
            .filter(f => f !== idField && f !== 'synced' && f !== 'updated_at')
            .map((f, i) => `${f} = $${i + 1}`)
            .join(', ');
          const updateValues = availableFields
            .filter(f => f !== idField && f !== 'synced' && f !== 'updated_at')
            .map(f => {
              const value = recordToUse[f];
              // Handle JSON fields (like beginnings in juanpay_records)
              if (f === 'beginnings' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return JSON.stringify(value);
              }
              // Convert month name to number for payroll_records
              if (f === 'month' && tableName === 'payroll_records') {
                if (typeof value === 'string') {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === value.toLowerCase());
                  if (monthIndex !== -1) {
                    return monthIndex + 1; // Return 1-12
                  }
                  // Try parsing as number
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                    return numValue;
                  }
                }
                // If it's already a number, return it
                if (typeof value === 'number' && value >= 1 && value <= 12) {
                  return value;
                }
                // Default to null if can't convert
                console.warn(`Invalid month value for payroll record: ${value}`);
                return null;
              }
              // Convert year to integer for payroll_records
              if (f === 'year' && tableName === 'payroll_records') {
                if (typeof value === 'string') {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 1970 && numValue <= 2100) {
                    return numValue;
                  }
                }
                // If it's already a number, return it
                if (typeof value === 'number' && value >= 1970 && value <= 2100) {
                  return value;
                }
                // Default to null if can't convert
                console.warn(`Invalid year value for payroll record: ${value}`);
                return null;
              }
              // Format date/timestamp fields
              // Special handling for last_login which can be a timestamp number
              if (f === 'last_login') {
                if (value === null || value === undefined) {
                  return null;
                }
                // If it's a number (timestamp), convert to Date then ISO string
                if (typeof value === 'number') {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    return date.toISOString();
                  }
                  return null;
                }
                // If it's already a string, try to parse it
                if (typeof value === 'string') {
                  // If it's a timestamp string, parse it
                  if (/^\d+$/.test(value)) {
                    const date = new Date(parseInt(value, 10));
                    if (!isNaN(date.getTime())) {
                      return date.toISOString();
                    }
                  }
                  // If it's already an ISO string or valid date format, return it
                  if (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    return value;
                  }
                }
                // Use formatDateValue for other cases
                return formatDateValue(value === undefined ? null : value, f);
              }
              // Format date/timestamp fields
              return formatDateValue(value === undefined ? null : value, f);
            });
          
          const whereIndex = updateValues.length + 1;
          await pgPool.query(
            `UPDATE ${tableName} SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = $${whereIndex}`,
            [...updateValues, mappedRecord[idField]]
          );
          console.log(`Updated PostgreSQL ${tableName} record with ${idField}: ${mappedRecord[idField]}`);
        } else {
          // Insert new record into PostgreSQL
          try {
            await pgPool.query(
              `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
              values
            );
            console.log(`Inserted new PostgreSQL ${tableName} record with ${idField}: ${mappedRecord[idField]}`);
          } catch (insertErr) {
            // If it's a unique constraint error, try updating instead
            if (insertErr.code === '23505' || insertErr.message.includes('duplicate key') || insertErr.message.includes('UNIQUE constraint')) {
              console.log(`Record with ${idField} ${mappedRecord[idField]} already exists in PostgreSQL, updating instead...`);
              const updateFields = availableFields
                .filter(f => f !== idField)
                .map((f, i) => `${f} = $${i + 1}`)
                .join(', ');
              const updateValues = availableFields
                .filter(f => f !== idField)
                .map(f => {
                  const value = recordToUse[f];
                  if (f === 'beginnings' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    return JSON.stringify(value);
                  }
                  // Format date/timestamp fields
                  return formatDateValue(value === undefined ? null : value, f);
                });
              
              const whereIndex = updateValues.length + 1;
              await pgPool.query(
                `UPDATE ${tableName} SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = $${whereIndex}`,
                [...updateValues, mappedRecord[idField]]
              );
              console.log(`Updated existing PostgreSQL ${tableName} record with ${idField}: ${mappedRecord[idField]}`);
            } else {
              throw insertErr;
            }
          }
        }

        // Mark as synced in SQLite (use original record idField, not mapped)
        await sqliteRun(
          `UPDATE ${tableName} SET synced = 1 WHERE ${idField} = ?`,
          [record[idField]]
        );
        pushedCount++;
        console.log(`Successfully pushed ${tableName} record ${record[idField]} to PostgreSQL`);
      } catch (err) {
        console.error(`Error pushing ${tableName} record:`, {
          error: err.message,
          idField: record[idField],
          table: tableName
        });
        // Continue with next record
      }
    }

    // Handle soft-deleted records - push deletions to PostgreSQL
    const deletedRecordsQuery = hasDeletedAt
      ? `SELECT ${idField}, deleted_at FROM ${tableName} WHERE deleted_at IS NOT NULL AND (synced = 0 OR synced IS NULL)`
      : `SELECT ${idField} FROM ${tableName} WHERE 1=0`; // No deleted_at column, so no deleted records
    const deletedRecords = await sqliteAll(deletedRecordsQuery, []);

    for (const record of deletedRecords) {
      try {
        const pgCheck = await pgPool.query(
          `SELECT ${idField} FROM ${tableName} WHERE ${idField} = $1`,
          [record[idField]]
        );
        
        if (pgCheck.rows.length > 0) {
          // Format deleted_at timestamp to ISO string
          const formattedDeletedAt = formatDateValue(record.deleted_at, 'deleted_at');
          await pgPool.query(
            `UPDATE ${tableName} SET deleted_at = $1, updated_at = CURRENT_TIMESTAMP WHERE ${idField} = $2`,
            [formattedDeletedAt, record[idField]]
          );
          await sqliteRun(
            `UPDATE ${tableName} SET synced = 1 WHERE ${idField} = ?`,
            [record[idField]]
          );
          console.log(`Pushed deletion of ${tableName} record ${idField}: ${record[idField]}`);
          pushedCount++;
        }
      } catch (err) {
        console.error(`Error pushing deletion for ${tableName} record:`, err.message);
      }
    }

    return {
      success: true,
      table: tableName,
      pushed: pushedCount
    };
  } catch (error) {
    console.error(`Error pushing table ${tableName}:`, error);
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

    // Fix any records with NULL synced values (from before column was added)
    // Set them to 1 (synced) since they're old records that should have been synced
    const tablesToFix = [
      'employees', 'gcash_records', 'paymaya_records', 'juanpay_records',
      'inventory_items', 'categories', 'sales_records', 'payroll_records', 'attendance'
    ];
    
    for (const table of tablesToFix) {
      try {
        const result = await sqliteRun(
          `UPDATE ${table} SET synced = 1 WHERE synced IS NULL AND deleted_at IS NULL`
        );
        if (result.changes > 0) {
          console.log(`Fixed ${result.changes} ${table} records with NULL synced values`);
        }
      } catch (err) {
        // Table might not exist or column might not exist yet
        if (!err.message.includes('no such column')) {
          console.warn(`Could not fix NULL synced values in ${table}:`, err.message);
        }
      }
    }

    // Define tables to sync with their fields and conflict fields
    const tables = [
      { 
        name: 'employees', 
        idField: 'emp_id',
        fields: ['emp_id', 'name', 'first_name', 'last_name', 'role', 'department', 'contact', 
                'email', 'phone', 'status', 'last_login', 'avatar', 'address', 'salary', 
                'contact_name', 'contact_number', 'relationship', 'password',
                'created_at', 'updated_at', 'deleted_at'],
        conflictFields: ['name', 'first_name', 'last_name', 'role', 'department', 'contact', 
                        'email', 'phone', 'status', 'avatar', 'address', 'salary', 
                        'contact_name', 'contact_number', 'relationship', 'password',
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

    // Sync each table (bidirectional: pull from PostgreSQL, then push to PostgreSQL)
    const results = [];
    for (const table of tables) {
      try {
        console.log(`Syncing table: ${table.name}`);
        
        // Step 1: Pull from PostgreSQL to SQLite
        const pullResult = await syncTable(
          table.name,
          table.idField,
          table.fields,
          table.conflictFields
        );
        results.push({ ...pullResult, direction: 'pull' });
        
        // Step 2: Push unsynced SQLite records to PostgreSQL
        const pushResult = await pushTableToPostgres(
          table.name,
          table.idField,
          table.fields
        );
        results.push({ ...pushResult, direction: 'push' });
        
        console.log(`Successfully synced table: ${table.name} (pulled: ${pullResult.synced || 0}, pushed: ${pushResult.pushed || 0})`);
      } catch (err) {
        console.error(`Error syncing table ${table.name}:`, err);
        results.push({ success: false, table: table.name, error: err.message });
        // Continue with other tables even if one fails
      }
    }
    
    console.log('Bidirectional database sync completed');
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
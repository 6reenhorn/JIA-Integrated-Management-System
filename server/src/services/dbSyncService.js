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
    
    // Get all records that exist in SQLite (including soft-deleted ones to check)
    // For payroll_records, get emp_id, month, year instead of just id
    let allSqliteRecords;
    let missingRecords = [];
    
    if (tableName === 'payroll_records') {
      const sqliteQuery = hasDeletedAt
        ? `SELECT id, emp_id, month, year, deleted_at FROM ${tableName}`
        : `SELECT id, emp_id, month, year FROM ${tableName}`;
      allSqliteRecords = await sqliteAll(sqliteQuery, []);
      
      // Create a set of existing records: "emp_id|month|year"
      const existingRecords = new Set(
        allSqliteRecords
          .filter(r => !hasDeletedAt || !r.deleted_at)
          .map(r => `${r.emp_id}|${r.month}|${r.year}`)
      );
      
      // Also track soft-deleted records - we don't want to restore these from PostgreSQL
      const softDeletedRecords = new Set(
        allSqliteRecords
          .filter(r => hasDeletedAt && r.deleted_at)
          .map(r => `${r.emp_id}|${r.month}|${r.year}`)
      );
      
      // Find records in PostgreSQL that don't exist in SQLite
      // For payroll_records, we need to fetch ALL records with full data to check by emp_id, month, year
      const allPgPayrollRecords = await pool.query(
        `SELECT * FROM ${tableName} WHERE deleted_at IS NULL`,
        []
      );
      
      for (const pgRecord of allPgPayrollRecords.rows) {
        const key = `${pgRecord.emp_id}|${pgRecord.month}|${pgRecord.year}`;
        if (!existingRecords.has(key) && !softDeletedRecords.has(key)) {
          // Debug: Log the structure of the record being added
          if (missingRecords.length < 2) {
            console.log(`[PAYROLL MISSING DEBUG] Adding missing record:`, {
              id: pgRecord.id,
              emp_id: pgRecord.emp_id,
              month: pgRecord.month,
              year: pgRecord.year,
              hasAllFields: !!(pgRecord.emp_id && pgRecord.month !== undefined && pgRecord.year !== undefined)
            });
          }
          missingRecords.push(pgRecord);
        }
      }
      
      if (missingRecords.length > 0) {
        console.log(`Found ${missingRecords.length} ${tableName} records in PostgreSQL that don't exist in SQLite (excluding ${softDeletedRecords.size} soft-deleted local records)`);
      }
    } else {
      // Get all non-deleted records from PostgreSQL (for finding missing records)
      const allPgRecords = await pool.query(
        `SELECT ${idField} FROM ${tableName} WHERE deleted_at IS NULL`,
        []
      );
      
      const sqliteQuery = hasDeletedAt
        ? `SELECT ${idField}, deleted_at FROM ${tableName}`
        : `SELECT ${idField} FROM ${tableName}`;
      allSqliteRecords = await sqliteAll(sqliteQuery, []);
      
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
    }
    
    // Combine both sets of records (avoid duplicates)
    const allRecordsToSync = [...pgResult.rows];
    // For payroll_records, use emp_id, month, year for deduplication instead of id
    if (tableName === 'payroll_records') {
      const existingKeys = new Set(pgResult.rows.map(r => `${r.emp_id}|${r.month}|${r.year}`));
      for (const record of missingRecords) {
        const key = `${record.emp_id}|${record.month}|${record.year}`;
        if (!existingKeys.has(key)) {
          // Debug: Log the structure of the record being added
          if (allRecordsToSync.length < 5) {
            console.log(`[PAYROLL SYNC DEBUG] Adding to allRecordsToSync:`, {
              id: record.id,
              emp_id: record.emp_id,
              month: record.month,
              year: record.year,
              keys: Object.keys(record)
            });
          }
          allRecordsToSync.push(record);
        }
      }
    } else {
      const existingIds = new Set(pgResult.rows.map(r => String(r[idField])));
      for (const record of missingRecords) {
        if (!existingIds.has(String(record[idField]))) {
          allRecordsToSync.push(record);
        }
      }
    }
    
    console.log(`Found ${allRecordsToSync.length} ${tableName} records to sync (${pgResult.rows.length} updated, ${missingRecords.length} missing)`);

    // Check for records that exist in SQLite but are deleted in PostgreSQL
    // These should be soft-deleted locally
    if (hasDeletedAt) {
      const sqliteNonDeleted = allSqliteRecords.filter(r => !r.deleted_at);
      
      // For payroll_records, check by emp_id, month, year instead of id
      if (tableName === 'payroll_records') {
        // Get all payroll records from PostgreSQL with their emp_id, month, year
        const allPgPayroll = await pool.query(
          `SELECT emp_id, month, year, deleted_at FROM ${tableName}`
        );
        
        // Create a map: "emp_id|month|year" -> deleted_at status
        const pgPayrollMap = new Map();
        for (const pgRecord of allPgPayroll.rows) {
          const key = `${pgRecord.emp_id}|${pgRecord.month}|${pgRecord.year}`;
          pgPayrollMap.set(key, {
            exists: true,
            deleted: !!pgRecord.deleted_at
          });
        }
        
        for (const sqliteRecord of sqliteNonDeleted) {
          // Get emp_id, month, year from SQLite record
          const sqlitePayrollRecord = await sqliteAll(
            `SELECT emp_id, month, year, synced FROM ${tableName} WHERE id = ?`,
            [sqliteRecord.id]
          );
          
          if (sqlitePayrollRecord.length === 0) continue;
          
          const empId = sqlitePayrollRecord[0].emp_id;
          const month = sqlitePayrollRecord[0].month;
          const year = sqlitePayrollRecord[0].year;
          const syncedValue = sqlitePayrollRecord[0].synced;
          const key = `${empId}|${month}|${year}`;
          const pgRecord = pgPayrollMap.get(key);
          
          // If record exists in SQLite but is deleted in PostgreSQL, soft-delete it locally
          if (pgRecord && pgRecord.deleted) {
            // Check if it's unsynced - if so, don't delete it (it will be pushed)
            if (syncedValue !== 0 && syncedValue !== '0') {
              // Soft-delete the record locally
              await sqliteRun(
                `UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP, synced = 1 WHERE id = ?`,
                [sqliteRecord.id]
              );
              console.log(`Soft-deleted ${tableName} record id: ${sqliteRecord.id} (emp_id: ${empId}, month: ${month}, year: ${year}) - was deleted in PostgreSQL`);
            } else {
              console.log(`Skipping soft-delete of ${tableName} record id: ${sqliteRecord.id} (emp_id: ${empId}, month: ${month}, year: ${year}) - has unsynced local changes`);
            }
          } else if (!pgRecord) {
            // Record exists in SQLite but doesn't exist at all in PostgreSQL
            // Check if it's unsynced - if so, it might be a new local record, don't delete it
            if (syncedValue === 1 || syncedValue === '1') {
              // Soft-delete the record locally
              await sqliteRun(
                `UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP, synced = 1 WHERE id = ?`,
                [sqliteRecord.id]
              );
              console.log(`Soft-deleted ${tableName} record id: ${sqliteRecord.id} (emp_id: ${empId}, month: ${month}, year: ${year}) - doesn't exist in PostgreSQL (was previously synced)`);
            } else {
              console.log(`Keeping ${tableName} record id: ${sqliteRecord.id} (emp_id: ${empId}, month: ${month}, year: ${year}) - new local record (synced=${syncedValue}), not in PostgreSQL yet`);
            }
          }
        }
      } else {
        // For other tables, use id-based matching
        // Create a map of all PostgreSQL records: id -> deleted_at status
        const pgRecordMap = new Map();
        for (const pgRecord of allPgRecordsIncludingDeleted.rows) {
          pgRecordMap.set(String(pgRecord[idField]), {
            exists: true,
            deleted: !!pgRecord.deleted_at
          });
        }
        
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
        // EXCEPTION: For categories, if they exist in PostgreSQL (not deleted), restore them even if soft-deleted locally
        // Also check if it's unsynced (synced = 0) - if so, don't overwrite local changes
        // For payroll_records, check by emp_id, month, year instead of id
        const deletedAtFilter = hasDeletedAt ? 'AND (deleted_at IS NULL OR deleted_at = \'\')' : '';
        let existing;
        if (tableName === 'payroll_records') {
          // Convert PostgreSQL month (integer) to both month name and number for SQLite query
          // SQLite may have either format, so check for both
          let monthForQuery = row.month;
          let monthForQueryAlt = null;
          if (typeof monthForQuery === 'number') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            if (monthForQuery >= 1 && monthForQuery <= 12) {
              monthForQueryAlt = monthNames[monthForQuery - 1]; // Month name
              monthForQuery = String(monthForQuery); // Also check for '12' format
            }
          }
          // Ensure year is a number for comparison
          const yearForQuery = typeof row.year === 'string' ? parseInt(row.year, 10) : row.year;
          // Check for both month formats: 'December' or '12'
          existing = await sqliteAll(
            `SELECT id, deleted_at, synced FROM ${tableName} 
             WHERE emp_id = ? AND year = ? 
             AND (month = ? OR month = ?)`,
            [row.emp_id, yearForQuery, monthForQuery, monthForQueryAlt || monthForQuery]
          );
        } else {
          existing = await sqliteAll(
            `SELECT 1, deleted_at, synced FROM ${tableName} WHERE ${idField} = ?`,
            [row[idField]]
          );
        }

        // If record exists and is soft-deleted locally, skip restoring it from PostgreSQL
        // BUT: Only skip if the deletion is unsynced (synced = 0) - meaning the deletion should be pushed first
        // If the deletion was already synced (synced = 1), we can restore it if it exists in PostgreSQL
        // EXCEPTION: For categories and employees, always restore if they exist in PostgreSQL (not deleted)
        // The special handling below will take care of restoring them
        if (existing.length > 0 && hasDeletedAt && existing[0].deleted_at && tableName !== 'categories' && tableName !== 'employees') {
          // Only skip if the deletion is unsynced (hasn't been pushed to PostgreSQL yet)
          const syncedValue = existing[0].synced;
          if (syncedValue === 0 || syncedValue === '0') {
            const recordIdentifier = tableName === 'payroll_records' 
              ? `emp_id: ${row.emp_id}, month: ${row.month}, year: ${row.year}`
              : `${idField}: ${row[idField]}`;
            console.log(`Skipping ${tableName} record ${recordIdentifier} - was soft-deleted locally with unsynced deletion, not restoring from PostgreSQL`);
            continue;
          } else {
            // Deletion was already synced, so restore the record from PostgreSQL
            console.log(`Restoring ${tableName} record - was soft-deleted locally but deletion was already synced, restoring from PostgreSQL`);
            // Clear deleted_at and continue to update/insert logic below
            // We'll handle the restoration in the update/insert block
          }
        }
        
        // For categories and employees that were soft-deleted locally but exist in PostgreSQL (not deleted), 
        // the special handling below will restore them, so we continue processing
        if (existing.length > 0 && hasDeletedAt && existing[0].deleted_at && (tableName === 'categories' || tableName === 'employees')) {
          if (tableName === 'categories') {
            console.log(`Category ${row[idField]} (${row.category_name}) was soft-deleted locally but exists in PostgreSQL - will restore via special handling`);
          } else if (tableName === 'employees') {
            console.log(`Employee ${row[idField]} (${row.emp_id}) was soft-deleted locally but exists in PostgreSQL - will restore via special handling`);
          }
          // Continue to special handling below
        }

        // If record exists and is unsynced (synced = 0), skip overwriting it - it will be pushed later
        if (existing.length > 0) {
          const syncedValue = existing[0].synced;
          const syncedType = typeof syncedValue;
          const recordIdentifier = tableName === 'payroll_records' && existing.length > 0 
            ? `emp_id: ${row.emp_id}, month: ${row.month}, year: ${row.year}` 
            : `${idField}: ${row[idField]}`;
          console.log(`[DEBUG SYNC] ${tableName} record ${recordIdentifier}: existing=${existing.length > 0}, synced=${syncedValue} (type: ${syncedType}), deleted_at=${existing[0].deleted_at || 'null'}`);
          
          if (syncedValue === 0 || syncedValue === '0') {
            console.log(`Skipping ${tableName} record ${recordIdentifier} - has unsynced local changes (synced=${syncedValue}), not overwriting with remote data`);
            continue;
          }
        }

        // Special handling for attendance: map employee_id from PostgreSQL to SQLite
        let mappedRow = { ...row };
        if (tableName === 'attendance' && row.employee_id) {
          // Get the employee's emp_id from PostgreSQL
          const pgEmployee = await pool.query(
            'SELECT emp_id FROM employees WHERE id = $1 AND deleted_at IS NULL',
            [row.employee_id]
          );
          
          if (pgEmployee.rows.length > 0) {
            const empId = pgEmployee.rows[0].emp_id;
            // Find the employee's SQLite id by emp_id
            const sqliteEmployee = await sqliteAll(
              'SELECT id FROM employees WHERE emp_id = ? AND deleted_at IS NULL',
              [empId]
            );
            
            if (sqliteEmployee.length > 0) {
              mappedRow.employee_id = sqliteEmployee[0].id;
              console.log(`[ATTENDANCE SYNC] Mapped employee_id: PostgreSQL ${row.employee_id} (emp_id: ${empId}) -> SQLite ${mappedRow.employee_id}`);
            } else {
              console.warn(`[ATTENDANCE SYNC] Employee with emp_id ${empId} not found in SQLite, skipping attendance record ${row.id}`);
              continue;
            }
          } else {
            console.warn(`[ATTENDANCE SYNC] Employee with id ${row.employee_id} not found in PostgreSQL, skipping attendance record ${row.id}`);
            continue;
          }
        }

        // Update existing record (including soft-deleted ones that should be restored)
        // Check if we should restore a soft-deleted record
        const shouldRestore = existing.length > 0 && hasDeletedAt && existing[0].deleted_at && 
                              (existing[0].synced === 1 || existing[0].synced === '1');
        
        if (existing.length > 0 && (!hasDeletedAt || !existing[0].deleted_at || shouldRestore)) {
          // Update existing record (only if not deleted, or if we're restoring it)
          // IMPORTANT: If the record has synced = 0, we should NOT overwrite it
          // The check above should have skipped it, but let's be extra safe
          if (!shouldRestore && (existing[0].synced === 0 || existing[0].synced === '0')) {
            console.log(`[WARNING] ${tableName} record ${row[idField]} has synced=0 but reached update block - this should not happen!`);
            continue;
          }
          
          // Update existing record (only if not deleted)
          // Exclude idField, updated_at, and synced (we preserve synced, set updated_at separately)
          // Use mappedRow for attendance to get the correct employee_id
          const rowToUse = tableName === 'attendance' ? mappedRow : row;
          const updateFields = fields
            .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
            .map(f => `${f} = ?`)
            .join(', ');
          
          const updateValues = fields
            .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
            .map(f => {
              const value = rowToUse[f];
              // Handle beginnings field - pipe-separated string only
              if (f === 'beginnings') {
                if (value === null || value === undefined) return '';
                // Already pipe-separated string
                if (typeof value === 'string') return value;
                // Should not happen, but handle array
                if (Array.isArray(value)) {
                  return value.map(item => {
                    if (typeof item === 'object' && item.amount) return item.amount;
                    return item;
                  }).join('|');
                }
                return '';
              }
              // Format timestamp fields (time_in, time_out) when syncing from PostgreSQL to SQLite
              if (f === 'time_in' || f === 'time_out' || f === 'created_at' || f === 'updated_at') {
                if (value === null || value === undefined) return null;
                // If it's a Date object, convert to ISO string
                if (value instanceof Date) {
                  if (isNaN(value.getTime())) return null;
                  return value.toISOString();
                }
                // If it's already a string, try to ensure it's in ISO format
                if (typeof value === 'string') {
                  // If it contains a space (SQL format), convert to ISO
                  if (value.includes(' ') && !value.includes('T')) {
                    return value.replace(' ', 'T');
                  }
                  // If it's already ISO format or valid, return it
                  try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      return date.toISOString();
                    }
                  } catch (e) {
                    // If parsing fails, return original value
                  }
                  return value;
                }
                // Try to parse as date
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    return date.toISOString();
                  }
                } catch (e) {
                  // If parsing fails, return null
                }
                return null;
              }
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
          
          // Special handling for attendance: preserve time_in and time_out if PostgreSQL has null but SQLite has values
          if (tableName === 'attendance') {
            const existingRecord = await sqliteAll(
              `SELECT time_in, time_out FROM ${tableName} WHERE ${idField} = ?`,
              [row[idField]]
            );
            
            if (existingRecord.length > 0) {
              const existing = existingRecord[0];
              // Find time_in and time_out indices in updateFields
              const timeInIndex = fields.findIndex(f => f === 'time_in' && f !== idField && f !== 'updated_at' && f !== 'synced');
              const timeOutIndex = fields.findIndex(f => f === 'time_out' && f !== idField && f !== 'updated_at' && f !== 'synced');
              
              // Preserve existing time_in if PostgreSQL has null
              if (timeInIndex >= 0) {
                const pgTimeInIndex = fields.filter(f => f !== idField && f !== 'updated_at' && f !== 'synced').indexOf('time_in');
                if (pgTimeInIndex >= 0 && (updateValues[pgTimeInIndex] === null || updateValues[pgTimeInIndex] === undefined)) {
                  if (existing.time_in) {
                    updateValues[pgTimeInIndex] = existing.time_in;
                    console.log(`[ATTENDANCE SYNC] Preserved existing time_in for record ${row[idField]}: ${existing.time_in}`);
                  }
                }
              }
              
              // Preserve existing time_out if PostgreSQL has null
              if (timeOutIndex >= 0) {
                const pgTimeOutIndex = fields.filter(f => f !== idField && f !== 'updated_at' && f !== 'synced').indexOf('time_out');
                if (pgTimeOutIndex >= 0 && (updateValues[pgTimeOutIndex] === null || updateValues[pgTimeOutIndex] === undefined)) {
                  if (existing.time_out) {
                    updateValues[pgTimeOutIndex] = existing.time_out;
                    console.log(`[ATTENDANCE SYNC] Preserved existing time_out for record ${row[idField]}: ${existing.time_out}`);
                  }
                }
              }
            }
          }
          
          // If restoring a soft-deleted record, clear deleted_at
          const deletedAtClause = shouldRestore ? ', deleted_at = NULL' : '';
          const updateDeletedAtFilter = (hasDeletedAt && !shouldRestore) ? 'AND (deleted_at IS NULL OR deleted_at = \'\')' : '';
          let updateSql;
          let updateParams;
          let recordIdToTrack;
          
          // For payroll_records, use the record ID in WHERE clause (we already found it)
          if (tableName === 'payroll_records' && existing.length > 0) {
            // Use the existing record's ID to update it directly
            updateSql = `
              UPDATE ${tableName} 
              SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1${deletedAtClause}
              WHERE id = ? ${updateDeletedAtFilter}
            `;
            updateParams = [...updateValues, existing[0].id];
            recordIdToTrack = existing[0].id; // Use the SQLite ID
          } else {
            updateSql = `
              UPDATE ${tableName} 
              SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
              WHERE ${idField} = ? ${updateDeletedAtFilter}
            `;
            updateParams = [...updateValues, row[idField]];
            recordIdToTrack = row[idField];
          }
          
          await sqliteRun(updateSql, updateParams);
          console.log(`Updated ${tableName} record with ${tableName === 'payroll_records' && existing.length > 0 ? `emp_id: ${row.emp_id}, month: ${row.month}, year: ${row.year}` : `${idField}: ${row[idField]}`}`);
          // Track that this record was actually synced
          actuallySyncedIds.push(recordIdToTrack);
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
          
          // Special handling for categories: check if category with same ID or name exists (including soft-deleted)
          if (tableName === 'categories' && row.category_name) {
            // First check by ID (in case it was soft-deleted with the same ID)
            const existingById = await sqliteAll(
              `SELECT id, deleted_at, synced, category_name FROM categories WHERE id = ?`,
              [row.id]
            );
            
            // Also check by name (in case ID changed or there's a duplicate)
            const existingByName = await sqliteAll(
              `SELECT id, deleted_at, synced, category_name FROM categories WHERE category_name = ?`,
              [row.category_name]
            );
            
            // Prefer matching by ID, but if not found, use name match
            const existing = existingById.length > 0 ? existingById[0] : (existingByName.length > 0 ? existingByName[0] : null);
            
            if (existing) {
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
              if (existing.deleted_at) {
                console.log(`Restored category "${row.category_name}" (id: ${existing.id}) from PostgreSQL - was soft-deleted locally`);
              } else {
                console.log(`Updated category "${row.category_name}" (id: ${existing.id}) from PostgreSQL`);
              }
              actuallySyncedIds.push(row[idField]);
              continue; // Skip the insert below
            } else {
              // Category doesn't exist in SQLite - will be inserted below
              console.log(`Category "${row.category_name}" (id: ${row.id}) not found in SQLite, will insert as new`);
            }
          }
          
          // Special handling for employees: check if employee with same emp_id exists (including soft-deleted)
          if (tableName === 'employees' && row.emp_id) {
            // Check by emp_id (in case it was soft-deleted with the same emp_id)
            const existingByEmpId = await sqliteAll(
              `SELECT id, deleted_at, synced, emp_id, name FROM employees WHERE emp_id = ?`,
              [row.emp_id]
            );
            
            if (existingByEmpId.length > 0) {
              const existing = existingByEmpId[0];
              // If employee exists (even if soft-deleted), update it with PostgreSQL data
              const updateFields = fields
                .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                .map(f => `${f} = ?`)
                .join(', ');
              
              const updateValues = fields
                .filter(f => f !== idField && f !== 'updated_at' && f !== 'synced')
                .map(f => row[f] === undefined ? null : row[f]);
              
              // Restore soft-deleted employee by clearing deleted_at
              const deletedAtClause = existing.deleted_at ? ', deleted_at = NULL' : '';
              const updateSql = `
                UPDATE employees 
                SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1${deletedAtClause}
                WHERE emp_id = ?
              `;
              
              await sqliteRun(updateSql, [...updateValues, row.emp_id]);
              if (existing.deleted_at) {
                console.log(`Restored employee "${row.name || row.emp_id}" (emp_id: ${row.emp_id}, id: ${existing.id}) from PostgreSQL - was soft-deleted locally`);
              } else {
                console.log(`Updated employee "${row.name || row.emp_id}" (emp_id: ${row.emp_id}, id: ${existing.id}) from PostgreSQL`);
              }
              actuallySyncedIds.push(row[idField]);
              continue; // Skip the insert below
            } else {
              // Employee doesn't exist in SQLite - will be inserted below
              console.log(`Employee "${row.name || row.emp_id}" (emp_id: ${row.emp_id}, id: ${row.id}) not found in SQLite, will insert as new`);
            }
          }
          
          // Insert new record
          try {
            // Use INSERT OR IGNORE to handle duplicate key errors gracefully
            // Include synced column with value 1 (pulled from PostgreSQL, so already synced)
            // For attendance, use mappedRow to get the correct employee_id
            // For payroll_records, exclude id field - let SQLite generate its own ID
            const rowToUseForInsert = tableName === 'attendance' ? mappedRow : row;
            const fieldsToInsert = tableName === 'payroll_records' 
              ? fields.filter(f => f !== 'id') 
              : fields;
            const insertFields = [...fieldsToInsert, 'synced'].join(', ');
            const placeholders = fieldsToInsert.map(() => '?').concat('?').join(', ');
            const insertValues = fieldsToInsert.map(f => {
              const value = rowToUseForInsert[f];
              // Handle JSON fields (like beginnings in juanpay_records) when pulling from PostgreSQL
              if (f === 'beginnings') {
                if (value === null || value === undefined) return '[]';
                // If it's already a string (JSON), return it
                if (typeof value === 'string') {
                  // Check if it's a valid JSON string, if not, try to fix it
                  try {
                    JSON.parse(value);
                    return value;
                  } catch {
                    // If not valid JSON, check if it's "[object Object]" or similar
                    if (value.includes('[object Object]')) {
                      console.warn(`[SYNC] Found "[object Object]" string for beginnings, using empty array`);
                      return '[]';
                    }
                    // Try to parse as number
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      return JSON.stringify([num]);
                    }
                    return '[]';
                  }
                }
                // If it's an object or array, stringify it
                if (typeof value === 'object') {
                  try {
                    return JSON.stringify(value);
                  } catch (e) {
                    console.error(`[SYNC] Error stringifying beginnings:`, e, value);
                    return '[]';
                  }
                }
                // If it's a number, convert to array
                if (typeof value === 'number') {
                  return JSON.stringify([value]);
                }
                return '[]';
              }
              // Format timestamp fields (time_in, time_out) when syncing from PostgreSQL to SQLite
              if (f === 'time_in' || f === 'time_out' || f === 'created_at' || f === 'updated_at') {
                if (value === null || value === undefined) return null;
                // If it's a Date object, convert to ISO string
                if (value instanceof Date) {
                  if (isNaN(value.getTime())) return null;
                  return value.toISOString();
                }
                // If it's already a string, try to ensure it's in ISO format
                if (typeof value === 'string') {
                  // If it contains a space (SQL format), convert to ISO
                  if (value.includes(' ') && !value.includes('T')) {
                    return value.replace(' ', 'T');
                  }
                  // If it's already ISO format or valid, return it
                  try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      return date.toISOString();
                    }
                  } catch (e) {
                    // If parsing fails, return original value
                  }
                  return value;
                }
                // Try to parse as date
                try {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    return date.toISOString();
                  }
                } catch (e) {
                  // If parsing fails, return null
                }
                return null;
              }
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
              // For payroll_records, convert month from integer (PostgreSQL) to month name (SQLite)
              if (tableName === 'payroll_records' && f === 'month') {
                if (typeof value === 'number' && value >= 1 && value <= 12) {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  return monthNames[value - 1];
                }
                // If it's already a string, return it as-is
                return value;
              }
              // For payroll_records, ensure year is a number (SQLite can handle both)
              if (tableName === 'payroll_records' && f === 'year') {
                if (typeof value === 'string') {
                  const numValue = parseInt(value, 10);
                  return isNaN(numValue) ? value : numValue;
                }
                return value;
              }
              return value === undefined ? null : value;
            }).concat(1);
            
            const insertSql = `
              INSERT OR IGNORE INTO ${tableName} (${insertFields})
              VALUES (${placeholders})
            `;
            
            const insertResult = await sqliteRun(insertSql, insertValues);
            if (insertResult.changes > 0) {
              // For payroll_records, get the SQLite-generated ID
              // For other tables, use the PostgreSQL ID
              let recordIdToTrack;
              if (tableName === 'payroll_records') {
                // After insert, the month will be in the format we inserted (month name like 'December')
                // Use the inserted month format to find the record
                let monthForQuery = row.month;
                if (typeof monthForQuery === 'number') {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  if (monthForQuery >= 1 && monthForQuery <= 12) {
                    monthForQuery = monthNames[monthForQuery - 1];
                  }
                }
                // Ensure year is a number for comparison
                const yearForQuery = typeof row.year === 'string' ? parseInt(row.year, 10) : row.year;
                // Get the ID of the record we just inserted by emp_id, month, year
                // Check for both month formats in case there's a mismatch
                const insertedRecord = await sqliteAll(
                  `SELECT id FROM ${tableName} WHERE emp_id = ? AND year = ? AND (month = ? OR month = ?)`,
                  [row.emp_id, yearForQuery, monthForQuery, typeof row.month === 'number' ? String(row.month) : row.month]
                );
                recordIdToTrack = insertedRecord.length > 0 ? insertedRecord[0].id : insertResult.lastID;
                console.log(`Inserted new ${tableName} record with emp_id: ${row.emp_id}, month: ${monthForQuery}, year: ${yearForQuery}, SQLite ID: ${recordIdToTrack}`);
              } else {
                recordIdToTrack = row[idField];
                console.log(`Inserted new ${tableName} record with ${idField}:`, row[idField]);
              }
              // Track that this record was actually synced
              actuallySyncedIds.push(recordIdToTrack);
            } else {
              // Record already exists, update it instead
              // For attendance, use mappedRow to get the correct employee_id
              // For payroll_records, ALWAYS use row (original PostgreSQL data) to get emp_id, month, year
              const rowToUseForUpdate = tableName === 'attendance' ? mappedRow : (tableName === 'payroll_records' ? row : row);
              // For payroll_records, exclude id from update fields
              const fieldsToUpdate = tableName === 'payroll_records' 
                ? fields.filter(f => f !== 'id') 
                : fields.filter(f => f !== idField);
              const updateFields = fieldsToUpdate
                .map(f => `${f} = ?`)
                .join(', ');
              const updateValues = fieldsToUpdate
                .map(f => {
                  // For payroll_records, always use row (PostgreSQL data), not rowToUseForUpdate
                  const value = (tableName === 'payroll_records') ? row[f] : rowToUseForUpdate[f];
                  // Handle JSON fields (like beginnings in juanpay_records) when pulling from PostgreSQL
                  if (f === 'beginnings') {
                    if (value === null || value === undefined) return '[]';
                    // If it's already a string (JSON), return it
                    if (typeof value === 'string') {
                      // Check if it's a valid JSON string, if not, try to fix it
                      try {
                        JSON.parse(value);
                        return value;
                      } catch {
                        // If not valid JSON, check if it's "[object Object]" or similar
                        if (value.includes('[object Object]')) {
                          console.warn(`[SYNC] Found "[object Object]" string for beginnings in update (attendance), using empty array`);
                          return '[]';
                        }
                        // Try to parse as number
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                          return JSON.stringify([num]);
                        }
                        return '[]';
                      }
                    }
                    // If it's an object or array, stringify it
                    if (typeof value === 'object') {
                      try {
                        return JSON.stringify(value);
                      } catch (e) {
                        console.error(`[SYNC] Error stringifying beginnings in update (attendance):`, e, value);
                        return '[]';
                      }
                    }
                    // If it's a number, convert to array
                    if (typeof value === 'number') {
                      return JSON.stringify([value]);
                    }
                    return '[]';
                  }
                  // Format timestamp fields (time_in, time_out) when syncing from PostgreSQL to SQLite
                  if (f === 'time_in' || f === 'time_out' || f === 'created_at' || f === 'updated_at') {
                    if (value === null || value === undefined) return null;
                    // If it's a Date object, convert to ISO string
                    if (value instanceof Date) {
                      if (isNaN(value.getTime())) return null;
                      return value.toISOString();
                    }
                    // If it's already a string, try to ensure it's in ISO format
                    if (typeof value === 'string') {
                      // If it contains a space (SQL format), convert to ISO
                      if (value.includes(' ') && !value.includes('T')) {
                        return value.replace(' ', 'T');
                      }
                      // If it's already ISO format or valid, return it
                      try {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          return date.toISOString();
                        }
                      } catch (e) {
                        // If parsing fails, return original value
                      }
                      return value;
                    }
                    // Try to parse as date
                    try {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        return date.toISOString();
                      }
                    } catch (e) {
                      // If parsing fails, return null
                    }
                    return null;
                  }
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
                  // For payroll_records, convert month from integer (PostgreSQL) to month name (SQLite)
                  if (tableName === 'payroll_records' && f === 'month') {
                    if (typeof value === 'number' && value >= 1 && value <= 12) {
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                         'July', 'August', 'September', 'October', 'November', 'December'];
                      return monthNames[value - 1];
                    }
                    // If it's already a string, return it as-is
                    return value;
                  }
                  // For payroll_records, ensure year is a number (SQLite can handle both)
                  if (tableName === 'payroll_records' && f === 'year') {
                    if (typeof value === 'string') {
                      const numValue = parseInt(value, 10);
                      return isNaN(numValue) ? value : numValue;
                    }
                    return value;
                  }
                  return value === undefined ? null : value;
                });
              
              // For payroll_records, use emp_id, month, year in WHERE clause
              let updateSql;
              let updateParams;
              let recordIdToTrack;
              if (tableName === 'payroll_records') {
                // Get emp_id, month, year from the original row (PostgreSQL data)
                // These should always be present in the row from PostgreSQL
                const empId = row.emp_id;
                const month = row.month;
                const year = row.year;
                
                if (!empId || month === undefined || year === undefined) {
                  console.error(`[PAYROLL SYNC ERROR] Missing required fields for payroll record update: emp_id=${empId}, month=${month}, year=${year}`);
                  console.error(`[PAYROLL SYNC ERROR] Full row object:`, JSON.stringify(row, null, 2));
                  console.error(`[PAYROLL SYNC ERROR] Row keys:`, Object.keys(row));
                  console.error(`[PAYROLL SYNC ERROR] Row type:`, typeof row);
                  continue; // Skip this record
                }
                
                // Convert PostgreSQL month (integer) to both month name and number for SQLite query
                // SQLite may have either format, so check for both
                let monthForQuery = month;
                let monthForQueryAlt = null;
                if (typeof monthForQuery === 'number') {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  if (monthForQuery >= 1 && monthForQuery <= 12) {
                    monthForQueryAlt = monthNames[monthForQuery - 1]; // Month name
                    monthForQuery = String(monthForQuery); // Also check for '12' format
                  }
                } else if (typeof monthForQuery === 'string') {
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthForQuery.toLowerCase());
                  if (monthIndex !== -1) {
                    monthForQueryAlt = String(monthIndex + 1); // Also check for '12' format
                  } else {
                    const numValue = parseInt(monthForQuery, 10);
                    if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                      monthForQueryAlt = monthNames[numValue - 1]; // Also check for 'December' format
                    }
                  }
                }
                const yearForQuery = typeof year === 'string' ? parseInt(year, 10) : year;
                
                // Check if we're restoring a soft-deleted record
                const shouldRestorePayroll = existing.length > 0 && hasDeletedAt && existing[0].deleted_at && 
                                             (existing[0].synced === 1 || existing[0].synced === '1');
                const deletedAtClausePayroll = shouldRestorePayroll ? ', deleted_at = NULL' : '';
                
                updateSql = `
                  UPDATE ${tableName} 
                  SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1${deletedAtClausePayroll}
                  WHERE emp_id = ? AND year = ? AND (month = ? OR month = ?)
                `;
                updateParams = [...updateValues, empId, yearForQuery, monthForQuery, monthForQueryAlt || monthForQuery];
                // Get the SQLite ID after update - check for both month formats
                const updatedRecord = await sqliteAll(
                  `SELECT id FROM ${tableName} WHERE emp_id = ? AND year = ? AND (month = ? OR month = ?)`,
                  [empId, yearForQuery, monthForQuery, monthForQueryAlt || monthForQuery]
                );
                recordIdToTrack = updatedRecord.length > 0 ? updatedRecord[0].id : null;
                console.log(`Updated existing ${tableName} record with emp_id: ${empId}, month: ${monthForQuery}/${monthForQueryAlt}, year: ${yearForQuery}, SQLite ID: ${recordIdToTrack}`);
              } else {
                updateSql = `
                  UPDATE ${tableName} 
                  SET ${updateFields}, updated_at = CURRENT_TIMESTAMP, synced = 1
                  WHERE ${idField} = ?
                `;
                updateParams = [...updateValues, row[idField]];
                recordIdToTrack = row[idField];
                console.log(`Updated existing ${tableName} record with ${idField}:`, row[idField]);
              }
              await sqliteRun(updateSql, updateParams);
              // Track that this record was actually synced
              if (recordIdToTrack) {
                actuallySyncedIds.push(recordIdToTrack);
              }
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
    // Try to parse it as a date and return a normalized UTC ISO string.
    // This ensures we push unambiguous timestamps (with 'Z') to PostgreSQL
    // instead of ambiguous timezone-less strings that can be interpreted
    // differently by the remote DB or other processes.
    try {
      // If it's already an ISO with timezone (ends with Z or contains +hh:mm/-hh:mm)
      if (/Z$/.test(value) || /[+\-]\d{2}:?\d{2}$/.test(value)) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d.toISOString();
      }
      // If it looks like YYYY-MM-DD (date only) keep as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return value.trim();
      }
      // Try parsing other common formats (including 'YYYY-MM-DDTHH:MM:SS' without Z)
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
      }
    } catch (e) {
      // fallthrough to return original value
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

// Normalize timestamp strings/numbers for pushing to PostgreSQL.
// - If value is a string without timezone info (no 'Z' and no +hh:mm),
//   assume it's a Philippines local wall-clock and convert to UTC ISO.
// - If it's a number (ms since epoch) or a string with timezone, return UTC ISO.
const normalizeTimestampForPush = (value) => {
  if (value === null || value === undefined) return null;
  // If it's already a number (ms since epoch)
  if (typeof value === 'number') {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }
  if (typeof value === 'string') {
    const s = value.trim();
    // If it's a date-only string YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // If contains timezone info (Z or +hh), parse and return ISO
    if ( /Z$/.test(s) || /[+\-]\d{2}:?\d{2}$/.test(s) ) {
      const parsed = Date.parse(s);
      if (!isNaN(parsed)) return new Date(parsed).toISOString();
      return s;
    }

    // Handle SQL datetime with space 'YYYY-MM-DD HH:MM:SS(.sss)'
    let t = s;
    if (t.includes(' ') && !t.includes('T')) {
      t = t.replace(' ', 'T');
    }

    // At this point t has no timezone info and looks like 'YYYY-MM-DDTHH:MM:SS...'
    // Treat it as Asia/Manila local wall-clock: compute UTC instant by subtracting 8 hours.
    const m = t.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      const hour = parseInt(m[4], 10);
      const minute = parseInt(m[5], 10);
      const second = m[6] ? parseFloat(m[6]) : 0;

      // Build UTC milliseconds by interpreting the parts as Asia/Manila local
      const phOffsetMs = 8 * 60 * 60 * 1000;
      const utcMs = Date.UTC(year, month - 1, day, hour, minute, Math.floor(second)) - phOffsetMs;
      return new Date(utcMs).toISOString();
    }

    // Fallback: try parsing and returning ISO
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
    return s;
  }
  return null;
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
      // For payroll_records, check by emp_id, month, year instead of id
      if (tableName === 'payroll_records') {
        // Get all payroll records from SQLite
        const sqlitePayroll = await sqliteAll(
          `SELECT id, emp_id, month, year FROM ${tableName} ${deletedAtFilter ? 'WHERE deleted_at IS NULL' : ''}`,
          []
        );
        
        // Check which ones exist in PostgreSQL
        const missingInPg = [];
        for (const record of sqlitePayroll) {
          // Convert month to number for the query
          let monthValue = record.month;
          if (typeof monthValue === 'string') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthValue.toLowerCase());
            if (monthIndex !== -1) {
              monthValue = monthIndex + 1;
            } else {
              const numValue = parseInt(monthValue, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                monthValue = numValue;
              }
            }
          }
          const yearValue = typeof record.year === 'string' ? parseInt(record.year, 10) : record.year;
          
          const pgCheck = await pgPool.query(
            `SELECT id FROM ${tableName} WHERE emp_id = $1 AND month = $2 AND year = $3 AND deleted_at IS NULL`,
            [record.emp_id, monthValue, yearValue]
          );
          
          if (pgCheck.rows.length === 0) {
            missingInPg.push(record.id);
          }
        }
        
        // Mark records that exist in SQLite but not in PostgreSQL as unsynced
        if (missingInPg.length > 0) {
          const updatePlaceholders = missingInPg.map(() => '?').join(', ');
          await sqliteRun(
            `UPDATE ${tableName} SET synced = 0 WHERE id IN (${updatePlaceholders}) ${deletedAtFilter}`,
            missingInPg
          );
          console.log(`Marked ${missingInPg.length} ${tableName} records as unsynced (exist in SQLite but not in PostgreSQL)`);
        }
      } else {
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
    
    // Debug: For payroll_records, show all records with their synced status
    if (tableName === 'payroll_records') {
      const allPayroll = await sqliteAll(`SELECT id, emp_id, month, year, synced, deleted_at FROM payroll_records WHERE deleted_at IS NULL`, []);
      console.log(`[PUSH DEBUG] All payroll records synced status:`, allPayroll.map(p => ({ 
        id: p.id, 
        emp_id: p.emp_id, 
        month: p.month, 
        year: p.year, 
        synced: p.synced,
        syncedType: typeof p.synced
      })));
      
      // Also check specifically for unsynced records
      const unsyncedPayroll = await sqliteAll(
        `SELECT id, emp_id, month, year, synced FROM payroll_records WHERE (synced = 0 OR synced IS NULL) AND deleted_at IS NULL`, 
        []
      );
      console.log(`[PUSH DEBUG] Unsynced payroll records found:`, unsyncedPayroll.length);
      if (unsyncedPayroll.length > 0) {
        console.log(`[PUSH DEBUG] Unsynced payroll records details:`, unsyncedPayroll.map(p => ({
          id: p.id,
          emp_id: p.emp_id,
          month: p.month,
          year: p.year,
          synced: p.synced
        })));
      }
    }
    
    console.log(`[${tableName}] Total: ${totalRecords[0]?.count || 0}, Synced: ${syncedCount[0]?.count || 0}, Unsynced: ${unsyncedCount[0]?.count || 0}`);
    console.log(`Found ${unsyncedRecords.length} unsynced ${tableName} records to push`);
    
    // Debug: Log first few unsynced records if any
    if (unsyncedRecords.length > 0) {
      if (tableName === 'payroll_records') {
        console.log(`[${tableName}] Sample unsynced records:`, unsyncedRecords.slice(0, 3).map(r => ({
          id: r.id,
          emp_id: r.emp_id,
          month: r.month,
          year: r.year,
          synced: r.synced,
          syncedType: typeof r.synced,
          hasDeletedAt: r.deleted_at
        })));
      } else {
        console.log(`[${tableName}] Sample unsynced records:`, unsyncedRecords.slice(0, 3).map(r => ({
          id: r[idField],
          synced: r.synced,
          hasDeletedAt: r.deleted_at
        })));
      }
    }
    
    let pushedCount = 0;
    for (const record of unsyncedRecords) {
      try {
        // For payroll_records, idField is 'id' but we don't require it for the check
        if (tableName !== 'payroll_records' && !record[idField]) {
          console.warn(`Skipping ${tableName} record with missing ${idField}`);
          continue;
        }
        
        if (tableName === 'payroll_records' && (!record.emp_id || !record.month || !record.year)) {
          console.warn(`Skipping payroll record with missing emp_id, month, or year:`, record);
          continue;
        }

        // Special handling for attendance table: map employee_id from SQLite to PostgreSQL
        // For payroll_records: convert month to number in mappedRecord
        let mappedRecord = { ...record };
        if (tableName === 'payroll_records') {
          console.log(`[PAYROLL PUSH] Processing record:`, { id: record.id, emp_id: record.emp_id, month: record.month, year: record.year, synced: record.synced });
          
          // CRITICAL: Convert month to number IMMEDIATELY
          if (mappedRecord.month && typeof mappedRecord.month === 'string') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === mappedRecord.month.toLowerCase());
            if (monthIndex !== -1) {
              mappedRecord.month = monthIndex + 1;
              console.log(`[PAYROLL PUSH] Converted month "${record.month}" to ${mappedRecord.month} in mappedRecord`);
            } else {
              const numValue = parseInt(mappedRecord.month, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                mappedRecord.month = numValue;
                console.log(`[PAYROLL PUSH] Parsed month "${record.month}" as ${mappedRecord.month} in mappedRecord`);
              } else {
                console.error(`[PAYROLL PUSH ERROR] Cannot convert month: ${mappedRecord.month}`);
                throw new Error(`Invalid month value: ${mappedRecord.month}`);
              }
            }
          }
          
          // Convert year to number
          if (mappedRecord.year && typeof mappedRecord.year === 'string') {
            mappedRecord.year = parseInt(mappedRecord.year, 10);
            console.log(`[PAYROLL PUSH] Converted year to ${mappedRecord.year} in mappedRecord`);
          }
          console.log(`[PAYROLL PUSH] Original record month: ${record.month} (type: ${typeof record.month})`);
          // Convert month name to number for payroll_records
          if (mappedRecord.month) {
            if (typeof mappedRecord.month === 'string') {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                 'July', 'August', 'September', 'October', 'November', 'December'];
              const monthIndex = monthNames.findIndex(m => m.toLowerCase() === mappedRecord.month.toLowerCase());
              if (monthIndex !== -1) {
                mappedRecord.month = monthIndex + 1; // Convert to 1-12
                console.log(`[PAYROLL PUSH] Converted mappedRecord.month from "${record.month}" to ${mappedRecord.month}`);
              } else {
                // Try parsing as number
                const numValue = parseInt(mappedRecord.month, 10);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                  mappedRecord.month = numValue;
                  console.log(`[PAYROLL PUSH] Parsed mappedRecord.month from "${record.month}" to ${mappedRecord.month}`);
                } else {
                  console.error(`[PAYROLL PUSH] Cannot convert month: ${mappedRecord.month}`);
                }
              }
            }
          }
          // Ensure year is a number
          if (mappedRecord.year && typeof mappedRecord.year === 'string') {
            mappedRecord.year = parseInt(mappedRecord.year, 10);
            console.log(`[PAYROLL PUSH] Converted mappedRecord.year to ${mappedRecord.year}`);
          }
        }
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

        // For payroll_records, check by emp_id, month, and year instead of id
        // since IDs don't match between SQLite and PostgreSQL
        let pgCheck;
        if (tableName === 'payroll_records') {
          // Ensure month is already converted in mappedRecord (should be done above)
          // But double-check and convert if needed
          let monthValue = mappedRecord.month;
          if (typeof monthValue === 'string') {
            console.log(`[PAYROLL PUSH] Month is still a string in mappedRecord: ${monthValue}, converting...`);
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthValue.toLowerCase());
            if (monthIndex !== -1) {
              monthValue = monthIndex + 1; // Return 1-12
              mappedRecord.month = monthValue; // Update mappedRecord too
              console.log(`[PAYROLL PUSH] Converted month "${record.month}" to ${monthValue} in mappedRecord`);
            } else {
              // Try parsing as number
              const numValue = parseInt(monthValue, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                monthValue = numValue;
                mappedRecord.month = monthValue;
              } else {
                console.error(`[PAYROLL PUSH ERROR] Invalid month value: ${monthValue}`);
                throw new Error(`Invalid month value: ${monthValue}`);
              }
            }
          }
          
          // Convert year to number
          let yearValue = mappedRecord.year;
          if (typeof yearValue === 'string') {
            yearValue = parseInt(yearValue, 10);
            mappedRecord.year = yearValue;
          }
          
          console.log(`[PAYROLL PUSH] Checking for existing record: emp_id=${mappedRecord.emp_id}, month=${monthValue} (type: ${typeof monthValue}), year=${yearValue} (type: ${typeof yearValue})`);
          
          // Ensure monthValue and yearValue are numbers
          if (typeof monthValue !== 'number') {
            console.error(`[PAYROLL PUSH ERROR] monthValue is not a number: ${monthValue} (type: ${typeof monthValue})`);
            throw new Error(`Month must be a number, got: ${monthValue} (type: ${typeof monthValue})`);
          }
          if (typeof yearValue !== 'number') {
            console.error(`[PAYROLL PUSH ERROR] yearValue is not a number: ${yearValue} (type: ${typeof yearValue})`);
            throw new Error(`Year must be a number, got: ${yearValue} (type: ${typeof yearValue})`);
          }
          
          pgCheck = await pgPool.query(
            `SELECT ${idField} FROM ${tableName} WHERE emp_id = $1 AND month = $2 AND year = $3 AND deleted_at IS NULL`,
            [mappedRecord.emp_id, monthValue, yearValue]
          );
          
          console.log(`[PAYROLL PUSH] Found ${pgCheck.rows.length} existing record(s) in PostgreSQL`);
        } else {
          pgCheck = await pgPool.query(
            `SELECT ${idField} FROM ${tableName} WHERE ${idField} = $1`,
            [mappedRecord[idField]]
          );
        }

        // Filter out fields that don't exist in the record or are undefined
        // Use mappedRecord for attendance and payroll_records (month/year converted), regular record for others
        const recordToUse = (tableName === 'attendance' || tableName === 'payroll_records') ? mappedRecord : record;
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
            console.log(`[PAYROLL PUSH] Converting month value: ${value} (type: ${typeof value})`);
            if (typeof value === 'string') {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                 'July', 'August', 'September', 'October', 'November', 'December'];
              const monthIndex = monthNames.findIndex(m => m.toLowerCase() === value.toLowerCase());
              if (monthIndex !== -1) {
                const converted = monthIndex + 1; // Return 1-12
                console.log(`[PAYROLL PUSH] Converted month "${value}" to ${converted}`);
                return converted;
              }
              // Try parsing as number
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                console.log(`[PAYROLL PUSH] Parsed month "${value}" as number ${numValue}`);
                return numValue;
              }
            }
            // If it's already a number, return it
            if (typeof value === 'number' && value >= 1 && value <= 12) {
              console.log(`[PAYROLL PUSH] Month is already a number: ${value}`);
              return value;
            }
            // Default to null if can't convert
            console.error(`[PAYROLL PUSH] Invalid month value for payroll record: ${value} (type: ${typeof value})`);
            throw new Error(`Invalid month value: ${value}`);
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
            // Use formatDateValue for other cases, except treat time fields specially
            const timeFields = ['time_in','time_out','last_login','created_at','updated_at','payment_date','date'];
            if (timeFields.includes(f)) {
              return normalizeTimestampForPush(value === undefined ? null : value);
            }
            return formatDateValue(value === undefined ? null : value, f);
          }
          // Format date/timestamp fields
          const timeFields = ['time_in','time_out','last_login','created_at','updated_at','payment_date','date'];
          if (timeFields.includes(f)) {
            return normalizeTimestampForPush(value === undefined ? null : value);
          }
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
              // Handle beginnings field - ensure it's stored correctly in PostgreSQL
              if (f === 'beginnings') {
                if (value === null || value === undefined) return '';
                // If it's already a pipe-separated string, keep it
                if (typeof value === 'string') {
                  // If it's legacy JSON, convert it
                  if (value.trim().startsWith('[')) {
                    try {
                      const arr = JSON.parse(value);
                      if (Array.isArray(arr)) {
                        return arr.map(item => {
                          if (typeof item === 'object' && item.amount) return item.amount;
                          return item;
                        }).join('|');
                      }
                    } catch {
                      return value;
                    }
                  }
                  return value;
                }
                if (typeof value === 'object' && Array.isArray(value)) {
                  return value.map(item => {
                    if (typeof item === 'object' && item.amount) return item.amount;
                    return item;
                  }).join('|');
                }
                return '';
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
          
          // For payroll_records, use emp_id, month, year in WHERE clause
          // For other tables, use idField
          let whereClause;
          let whereValues;
          if (tableName === 'payroll_records') {
            // Convert month to number for WHERE clause (same conversion as in values)
            let monthForWhere = recordToUse.month;
            if (typeof monthForWhere === 'string') {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                 'July', 'August', 'September', 'October', 'November', 'December'];
              const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthForWhere.toLowerCase());
              if (monthIndex !== -1) {
                monthForWhere = monthIndex + 1;
              } else {
                const numValue = parseInt(monthForWhere, 10);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                  monthForWhere = numValue;
                }
              }
            }
            const yearForWhere = typeof recordToUse.year === 'string' ? parseInt(recordToUse.year, 10) : recordToUse.year;
            
            whereClause = `emp_id = $${updateValues.length + 1} AND month = $${updateValues.length + 2} AND year = $${updateValues.length + 3}`;
            whereValues = [recordToUse.emp_id, monthForWhere, yearForWhere];
          } else {
            whereClause = `${idField} = $${updateValues.length + 1}`;
            whereValues = [mappedRecord[idField]];
          }
          
          await pgPool.query(
            `UPDATE ${tableName} SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE ${whereClause}`,
            [...updateValues, ...whereValues]
          );
          console.log(`Updated PostgreSQL ${tableName} record with ${tableName === 'payroll_records' ? `emp_id: ${recordToUse.emp_id}, month: ${recordToUse.month}, year: ${recordToUse.year}` : `${idField}: ${mappedRecord[idField]}`}`);
        } else {
          // Insert new record into PostgreSQL
          if (tableName === 'payroll_records') {
            console.log(`[PAYROLL PUSH] Inserting new record into PostgreSQL: emp_id=${mappedRecord.emp_id}, month=${mappedRecord.month} (type: ${typeof mappedRecord.month}), year=${mappedRecord.year}`);
            console.log(`[PAYROLL PUSH] Field names: ${fieldNames}`);
            console.log(`[PAYROLL PUSH] Values array (first 5):`, values.slice(0, 5).map((v, i) => `${i}: ${v} (type: ${typeof v})`));
            // Double-check month is a number in the values array
            const monthIndex = availableFields.indexOf('month');
            if (monthIndex !== -1) {
              if (typeof values[monthIndex] === 'string') {
                console.error(`[PAYROLL PUSH ERROR] Month value is still a string at index ${monthIndex}: ${values[monthIndex]}`);
                // Force convert it
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                const monthStr = values[monthIndex];
                const monthIdx = monthNames.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
                if (monthIdx !== -1) {
                  values[monthIndex] = monthIdx + 1;
                  console.log(`[PAYROLL PUSH FIX] Forced conversion of month "${monthStr}" to ${values[monthIndex]}`);
                } else {
                  throw new Error(`Cannot convert month "${monthStr}" to number`);
                }
              }
            }
          }
          try {
            await pgPool.query(
              `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
              values
            );
            if (tableName === 'payroll_records') {
              console.log(`[PAYROLL PUSH] Successfully inserted new PostgreSQL record: emp_id=${mappedRecord.emp_id}, month=${mappedRecord.month}, year=${mappedRecord.year}`);
            } else {
              console.log(`Inserted new PostgreSQL ${tableName} record with ${idField}: ${mappedRecord[idField]}`);
            }
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

        // Mark as synced in SQLite
        // For payroll_records, use emp_id, month, year instead of id
        if (tableName === 'payroll_records') {
          // Convert month to both formats for the query (SQLite may have either 'December' or '12')
          let monthForQuery = record.month;
          let monthForQueryAlt = null;
          if (typeof monthForQuery === 'string') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthForQuery.toLowerCase());
            if (monthIndex !== -1) {
              monthForQueryAlt = String(monthIndex + 1); // Also check for '12' format
            } else {
              // Try parsing as number
              const numValue = parseInt(monthForQuery, 10);
              if (!isNaN(numValue) && numValue >= 1 && numValue <= 12) {
                monthForQueryAlt = monthNames[numValue - 1]; // Also check for 'December' format
              }
            }
          } else if (typeof monthForQuery === 'number') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
            if (monthForQuery >= 1 && monthForQuery <= 12) {
              monthForQueryAlt = monthNames[monthForQuery - 1]; // Check for 'December' format
              monthForQuery = String(monthForQuery); // Check for '12' format
            }
          }
          const yearValue = typeof record.year === 'string' ? parseInt(record.year, 10) : record.year;
          // Update records matching either month format
          await sqliteRun(
            `UPDATE ${tableName} SET synced = 1 WHERE emp_id = ? AND year = ? AND (month = ? OR month = ?)`,
            [record.emp_id, yearValue, monthForQuery, monthForQueryAlt || monthForQuery]
          );
          console.log(`[PAYROLL PUSH] Successfully pushed and marked as synced: emp_id=${record.emp_id}, month=${monthForQuery}/${monthForQueryAlt}, year=${yearValue}`);
        } else {
          await sqliteRun(
            `UPDATE ${tableName} SET synced = 1 WHERE ${idField} = ?`,
            [record[idField]]
          );
          console.log(`Successfully pushed ${tableName} record ${record[idField]} to PostgreSQL`);
        }
        pushedCount++;
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
        
        // IMPORTANT: Push FIRST to ensure local unsynced changes are saved to PostgreSQL
        // before pulling (which might overwrite local changes)
        // Step 1: Push unsynced SQLite records to PostgreSQL FIRST
        const pushResult = await pushTableToPostgres(
          table.name,
          table.idField,
          table.fields
        );
        results.push({ ...pushResult, direction: 'push' });
        
        // Step 2: Pull from PostgreSQL to SQLite (after pushing local changes)
        const pullResult = await syncTable(
          table.name,
          table.idField,
          table.fields,
          table.conflictFields
        );
        results.push({ ...pullResult, direction: 'pull' });
        
        console.log(`Successfully synced table: ${table.name} (pushed: ${pushResult.pushed || 0}, pulled: ${pullResult.synced || 0})`);
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
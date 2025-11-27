const { dbHelper } = require('./dbHelper');  // Import dbHelper instead of db
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, '../../database.sqlite');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// No need for direct sqlite3 connection here as it's handled by dbHelper

// Create employees table
const createEmployeesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL,
      department TEXT,
      contact TEXT,
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      avatar TEXT,
      address TEXT,
      salary REAL,
      contact_name TEXT,
      contact_number TEXT,
      relationship TEXT,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    // Add columns if they don't exist (for existing databases)
    try {
      await dbHelper.run('ALTER TABLE employees ADD COLUMN department TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE employees ADD COLUMN first_name TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE employees ADD COLUMN last_name TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE employees ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    
    // Migrate existing records: populate first_name and last_name from name if they're null
    try {
      const employeesToMigrate = await dbHelper.query(
        'SELECT id, name FROM employees WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL AND name != ""'
      );
      for (const emp of employeesToMigrate) {
        const nameParts = emp.name.trim().split(/\s+/);
        if (nameParts.length > 0) {
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || null;
          await dbHelper.run(
            'UPDATE employees SET first_name = ?, last_name = ? WHERE id = ?',
            [firstName, lastName, emp.id]
          );
        }
      }
      if (employeesToMigrate.length > 0) {
        console.log(`SQLite: Migrated ${employeesToMigrate.length} employee name records`);
      }
    } catch (err) {
      // Migration failed, but continue
      console.warn('SQLite: Warning - could not migrate employee names:', err.message);
    }
    
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(emp_id)');
    console.log('SQLite: Employees table created or already exists');
    return true;
  } catch (err) {
    console.error('SQLite: Error creating employees table:', err);
    throw err;
  }
};

// Create gcash_records table
const createGCashRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS gcash_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      service_charge REAL DEFAULT 0,
      transaction_type TEXT NOT NULL,
      charge_mop TEXT NOT NULL,
      reference_number TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    // Add synced column if it doesn't exist
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    // Add new columns if they don't exist (for existing databases)
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN amount REAL');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN service_charge REAL DEFAULT 0');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN transaction_type TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN charge_mop TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE gcash_records ADD COLUMN reference_number TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_gcash_records_date ON gcash_records(date)');
    console.log('SQLite: GCash records table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating gcash_records table:', err);
  }
};

// Create paymaya_records table
const createPayMayaRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS paymaya_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      service_charge REAL DEFAULT 0,
      transaction_type TEXT NOT NULL,
      charge_mop TEXT NOT NULL,
      reference_number TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    // Add new columns if they don't exist (for existing databases)
    try {
      await dbHelper.run('ALTER TABLE paymaya_records ADD COLUMN amount REAL');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE paymaya_records ADD COLUMN service_charge REAL DEFAULT 0');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE paymaya_records ADD COLUMN transaction_type TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE paymaya_records ADD COLUMN charge_mop TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE paymaya_records ADD COLUMN reference_number TEXT');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_paymaya_records_date ON paymaya_records(date)');
    console.log('SQLite: PayMaya records table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating paymaya_records table:', err);
  }
};

// Create juanpay_records table
const createJuanPayRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS juanpay_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      beginnings TEXT,
      ending REAL DEFAULT 0,
      sales REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    try {
      await dbHelper.run('ALTER TABLE juanpay_records ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_juanpay_records_date ON juanpay_records(date)');
    console.log('SQLite: JuanPay records table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating juanpay_records table:', err);
  }
};

// Create inventory_items table
const createInventoryItemsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      category TEXT,
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'In Stock',
      product_price REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      description TEXT,
      minimum_stock INTEGER DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    try {
      await dbHelper.run('ALTER TABLE inventory_items ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_inventory_items_product_name ON inventory_items(product_name)');
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category)');
    console.log('SQLite: Inventory items table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating inventory_items table:', err);
  }
};

// Create categories table
const createCategoriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6B7280',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NULL,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    // Add missing columns if they don't exist
    try {
      await dbHelper.run('ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP DEFAULT NULL');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL');
    } catch (err) {
      // Column already exists, ignore
    }
    try {
      await dbHelper.run('ALTER TABLE categories ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    console.log('SQLite: Categories table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating categories table:', err);
  }
};

// Create sales_records table
const createSalesRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sales_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    try {
      await dbHelper.run('ALTER TABLE sales_records ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_sales_records_date ON sales_records(date)');
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_sales_records_product_name ON sales_records(product_name)');
    console.log('SQLite: Sales records table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating sales_records table:', err);
  }
};

// Create payroll_records table
const createPayrollRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_name TEXT NOT NULL,
      emp_id TEXT NOT NULL,
      role TEXT NOT NULL,
      month TEXT NOT NULL,
      year TEXT NOT NULL,
      basic_salary REAL NOT NULL,
      deductions REAL DEFAULT 0,
      net_salary REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      payment_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1
    )
  `;
  
  try {
    await dbHelper.run(query);
    try {
      await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    
    // Check if table exists and has the correct columns
    try {
      const tableInfo = await dbHelper.query('PRAGMA table_info(payroll_records)');
      const columns = tableInfo.map((col) => col.name);
      
      // Add missing columns if they don't exist
      if (!columns.includes('employee_name')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN employee_name TEXT');
      }
      if (!columns.includes('emp_id')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN emp_id TEXT');
      }
      if (!columns.includes('role')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN role TEXT');
      }
      if (!columns.includes('month')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN month TEXT');
      }
      if (!columns.includes('year')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN year TEXT');
      }
      if (!columns.includes('basic_salary')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN basic_salary REAL');
      }
      if (!columns.includes('deductions')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN deductions REAL DEFAULT 0');
      }
      if (!columns.includes('net_salary')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN net_salary REAL');
      }
      if (!columns.includes('status')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN status TEXT DEFAULT \'Pending\'');
      }
      if (!columns.includes('payment_date')) {
        await dbHelper.run('ALTER TABLE payroll_records ADD COLUMN payment_date TEXT');
      }
      
      // Create indexes only if emp_id column exists
      if (columns.includes('emp_id')) {
        try {
          await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_payroll_records_emp_id ON payroll_records(emp_id)');
        } catch (idxErr) {
          // Index might already exist, ignore
        }
      }
      if (columns.includes('month') && columns.includes('year')) {
        try {
          await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_payroll_records_month_year ON payroll_records(month, year)');
        } catch (idxErr) {
          // Index might already exist, ignore
        }
      }
    } catch (infoErr) {
      // If we can't check table info, just try to create indexes
      try {
        await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_payroll_records_emp_id ON payroll_records(emp_id)');
        await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_payroll_records_month_year ON payroll_records(month, year)');
      } catch (idxErr) {
        // Ignore index errors
      }
    }
    
    console.log('SQLite: Payroll records table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating payroll_records table:', err);
  }
};

// Create attendance table
const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time_in TEXT,
      time_out TEXT,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL,
      synced INTEGER DEFAULT 1,
      FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
    )
  `;
  
  try {
    await dbHelper.run(query);
    try {
      await dbHelper.run('ALTER TABLE attendance ADD COLUMN synced INTEGER DEFAULT 1');
    } catch (err) {
      // Column already exists, ignore
    }
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)');
    await dbHelper.run('CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)');
    console.log('SQLite: Attendance table created or already exists');
  } catch (err) {
    console.error('SQLite: Error creating attendance table:', err);
  }
};

// Synchronize all tables
const syncDatabase = async () => {
  try {
    // Verify database is writable
    try {
      await dbHelper.run('PRAGMA journal_mode=WAL;');
      console.log('SQLite: Database is writable');
    } catch (err) {
      console.error('SQLite: Database is not writable:', err);
      throw err;
    }

    // Create tables in order of dependency
    await createEmployeesTable();
    await createGCashRecordsTable();
    await createPayMayaRecordsTable();
    await createJuanPayRecordsTable();
    await createInventoryItemsTable();
    await createCategoriesTable();
    await createSalesRecordsTable();
    await createPayrollRecordsTable();
    await createAttendanceTable();
    
    console.log('SQLite: Database synchronization completed');
    return true;
  } catch (err) {
    console.error('SQLite: Error during database synchronization:', err);
    throw err;
  }
};

module.exports = { 
  syncDatabase,
  createEmployeesTable,
  createGCashRecordsTable,
  createPayMayaRecordsTable,
  createJuanPayRecordsTable,
  createInventoryItemsTable,
  createCategoriesTable,
  createSalesRecordsTable,
  createPayrollRecordsTable,
  createAttendanceTable
};
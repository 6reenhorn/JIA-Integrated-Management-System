const pool = require('./postgres');

const createEmployeesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
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
      password VARCHAR(255) NOT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('Employees table created or already exists');
  } catch (err) {
    console.error('Error creating employees table:', err);
  }
};

const createGCashRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS gcash_records (
      id SERIAL PRIMARY KEY,
      amount NUMERIC NOT NULL,
      service_charge NUMERIC DEFAULT 0,
      transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
      charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'GCash')) NOT NULL,
      reference_number VARCHAR(100),
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NULL,
      deleted_at TIMESTAMP DEFAULT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('GCash records table created or already exists');
  } catch (err) {
    console.error('Error creating gcash_records table:', err);
  }
};

const createPayMayaRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS paymaya_records (
      id SERIAL PRIMARY KEY,
      amount NUMERIC NOT NULL,
      service_charge NUMERIC DEFAULT 0,
      transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
      charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'PayMaya')) NOT NULL,
      reference_number VARCHAR(100),
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP DEFAULT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('PayMaya records table created or already exists');
  } catch (err) {
    console.error('Error creating paymaya_records table:', err);
  }
};

const createJuanPayRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS juanpay_records (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      beginnings JSONB NOT NULL DEFAULT '[]',
      ending NUMERIC NOT NULL DEFAULT 0,
      sales NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NULL,
      deleted_at TIMESTAMP DEFAULT NULL
    );
  `;

  try {
    await pool.query(query);
    console.log('JuanPay records table created or already exists');
  } catch (err) {
    console.error('Error creating juanpay_records table:', err);
  }
};

const createInventoryTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) CHECK (status IN ('In Stock', 'Low Stock', 'Out Of Stock')) DEFAULT 'In Stock',
      product_price NUMERIC NOT NULL,
      total_amount NUMERIC NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Inventory items table created or already exists');
  } catch (err) {
    console.error('Error creating inventory_items table:', err);
  }
};

const addInventoryColumns = async () => {
  try {
    // Add description column if it doesn't exist
    await pool.query(`
      ALTER TABLE inventory_items 
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    
    // Add minimum_stock column if it doesn't exist
    await pool.query(`
      ALTER TABLE inventory_items 
      ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 0;
    `);
    
    console.log('Inventory columns (description, minimum_stock) added successfully');
  } catch (err) {
    console.error('Error adding inventory columns:', err);
  }
};

const createCategoriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      category_name VARCHAR(100) UNIQUE NOT NULL,
      color VARCHAR(7) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Categories table created or already exists');
  } catch (err) {
    console.error('Error creating categories table:', err);
  }
};

const createSalesRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sales_records (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      price NUMERIC NOT NULL,
      total NUMERIC NOT NULL,
      payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Gcash', 'PayMaya', 'Juanpay')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('Sales records table created or already exists');
  } catch (err) {
    console.error('Error creating sales_records table:', err);
  }
};

const createPayrollRecordsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS payroll_records (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255),
      emp_id VARCHAR(10),
      role VARCHAR(100),
      month INTEGER,
      year INTEGER,
      basic_salary NUMERIC,
      deductions NUMERIC,
      net_salary NUMERIC,
      status VARCHAR(20),
      payment_date DATE
    );
  `;

  try {
    await pool.query(query);
    console.log('Payroll records table created or already exists');
  } catch (err) {
    console.error('Error creating payroll_records table:', err);
  }
};

const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(id),
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      time_out TIMESTAMP,
      status VARCHAR(20) DEFAULT 'Present'
    );
  `;

  try {
    await pool.query(query);
    console.log('Attendance table created or already exists');
  } catch (err) {
    console.error('Error creating attendance table:', err);
  }
};

const insertSampleEmployees = async () => {
  const sampleEmployees = [
    {
      emp_id: 'EMP001',
      name: 'John Cyril Espina',
      role: 'Manager',
      department: 'Front Desk',
      contact: 'johncyril.espina@gmail.com\n+1 (555) 123-4567\nLingion, Manolo Fortich, Bukidnon',
      status: 'Active',
      last_login: '2024-01-15 09:30:00',
      address: '123 Main Street, City, State, ZIP',
      salary: '50000',
      contact_name: 'Jane Doe',
      contact_number: '555-123-4567',
      relationship: 'Spouse',
      password: 'TempPass123'
    },
    {
      emp_id: 'EMP002',
      name: 'Den Jester Antonio',
      role: 'Admin',
      department: 'Administrative',
      contact: 'denjester.antonio@gmail.com\n+1 (555) 234-5678\nManolo Fortich, Bukidnon',
      status: 'Active',
      last_login: '2024-01-15 08:45:00',
      address: '456 Oak Avenue, City, State, ZIP',
      salary: '55000',
      contact_name: 'John Smith',
      contact_number: '555-234-5678',
      relationship: 'Parent'
    },
    {
      emp_id: 'EMP003',
      name: 'John Jaybord Casia',
      role: 'Sales Associate',
      department: 'Front Desk',
      contact: 'johnjaybord.casia@gmail.com\n+1 (555) 345-6789\nTagoloan, Misamis Oriental',
      status: 'Active',
      last_login: '2024-01-14 16:20:00',
      address: '789 Pine Road, City, State, ZIP',
      salary: '45000',
      contact_name: 'Mary Johnson',
      contact_number: '555-345-6789',
      relationship: 'Sibling'
    },
    {
      emp_id: 'EMP004',
      name: 'Sophia Marie Flores',
      role: 'Cashier',
      department: 'Front Desk',
      contact: 'sophiamarie.flores@gmail.com\n+1 (555) 456-7890\nPatag, Cagayyan de Oro City',
      status: 'Active',
      last_login: '2024-01-15 10:15:00',
      address: '321 Elm Street, City, State, ZIP',
      salary: '40000',
      contact_name: 'Robert Brown',
      contact_number: '555-456-7890',
      relationship: 'Friend'
    },
    {
      emp_id: 'EMP005',
      name: 'Glenn Mark Anino',
      role: 'Maintenance',
      department: 'Maintenance',
      contact: 'glennmark.anino@gmail.com\n+1 (555) 567-8901\nCamaman-an, Cagayyan de Oro City',
      status: 'Inactive',
      last_login: '2024-01-10 14:30:00',
      address: '654 Maple Lane, City, State, ZIP',
      salary: '35000',
      contact_name: 'N/A',
      contact_number: 'N/A',
      relationship: 'Other'
    }
  ];

  try {
    for (const employee of sampleEmployees) {
      const insertQuery = `
        INSERT INTO employees (emp_id, name, role, contact, status, last_login, address, salary, contact_name, contact_number, relationship)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (emp_id) DO NOTHING;
      `;
      const values = [
        employee.emp_id,
        employee.name,
        employee.role,
        employee.contact,
        employee.status,
        employee.last_login,
        employee.address,
        employee.salary,
        employee.contact_name,
        employee.contact_number,
        employee.relationship
      ];
      await pool.query(insertQuery, values);
    }
    console.log('Sample employees inserted');
  } catch (err) {
    console.error('Error inserting sample employees:', err);
  }
};

const updateSalesRecordsConstraint = async () => {
  try {
    await pool.query(`
      ALTER TABLE sales_records 
      DROP CONSTRAINT IF EXISTS sales_records_payment_method_check;
    `);
    
    await pool.query(`
      ALTER TABLE sales_records 
      ADD CONSTRAINT sales_records_payment_method_check 
      CHECK (payment_method IN ('Cash', 'Gcash', 'PayMaya', 'Juanpay'));
    `);
    
    console.log('Sales records payment method constraint updated successfully');
  } catch (err) {
    console.error('Error updating sales records constraint:', err);
  }
};

const updateNumericColumns = async () => {
  try {
    await pool.query(`
      ALTER TABLE gcash_records 
        ALTER COLUMN amount TYPE NUMERIC,
        ALTER COLUMN service_charge TYPE NUMERIC;
    `);
    
    await pool.query(`
      ALTER TABLE paymaya_records 
        ALTER COLUMN amount TYPE NUMERIC,
        ALTER COLUMN service_charge TYPE NUMERIC;
    `);
    
    await pool.query(`
      ALTER TABLE inventory_items 
        ALTER COLUMN product_price TYPE NUMERIC,
        ALTER COLUMN total_amount TYPE NUMERIC;
    `);
    
    await pool.query(`
      ALTER TABLE sales_records 
        ALTER COLUMN price TYPE NUMERIC,
        ALTER COLUMN total TYPE NUMERIC;
    `);
    
    await pool.query(`
      ALTER TABLE payroll_records 
        ALTER COLUMN basic_salary TYPE NUMERIC,
        ALTER COLUMN deductions TYPE NUMERIC,
        ALTER COLUMN net_salary TYPE NUMERIC;
    `);
    
    console.log('Numeric columns updated to remove precision limits');
  } catch (err) {
    console.error('Error updating numeric columns:', err);
  }
};

const syncDatabase = async () => {
  await createEmployeesTable();
  await insertSampleEmployees();
  await createGCashRecordsTable();
  await createPayMayaRecordsTable();
  await createJuanPayRecordsTable();
  await createInventoryTable();
  await addInventoryColumns();
  await createCategoriesTable();
  await createSalesRecordsTable();
  await updateSalesRecordsConstraint();
  await updateNumericColumns();
  await createPayrollRecordsTable();
  await createAttendanceTable();
};

module.exports = { syncDatabase };
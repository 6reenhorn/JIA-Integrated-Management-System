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
      relationship VARCHAR(100)
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
      amount DECIMAL(10, 2) NOT NULL,
      service_charge DECIMAL(10, 2) DEFAULT 0,
      transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
      charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'GCash')) NOT NULL,
      reference_number VARCHAR(100),
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      amount DECIMAL(10, 2) NOT NULL,
      service_charge DECIMAL(10, 2) DEFAULT 0,
      transaction_type VARCHAR(20) CHECK (transaction_type IN ('Cash-In', 'Cash-Out')) NOT NULL,
      charge_mop VARCHAR(20) CHECK (charge_mop IN ('Cash', 'PayMaya')) NOT NULL,
      reference_number VARCHAR(100),
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('PayMaya records table created or already exists');
  } catch (err) {
    console.error('Error creating paymaya_records table:', err);
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
      relationship: 'Spouse'
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

const syncDatabase = async () => {
  await createEmployeesTable();
  await insertSampleEmployees();
  await createGCashRecordsTable();
  await createPayMayaRecordsTable();
};

module.exports = { syncDatabase };

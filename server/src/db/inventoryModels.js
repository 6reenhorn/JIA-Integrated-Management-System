const pool = require('./postgres');

const createInventoryTables = async () => {
  const inventoryTableQuery = `
    CREATE TABLE IF NOT EXISTS inventory_items (
      id SERIAL PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) CHECK (status IN ('In Stock', 'Low Stock', 'Out Of Stock')) DEFAULT 'In Stock',
      product_price DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const salesTableQuery = `
    CREATE TABLE IF NOT EXISTS sales_records (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Gcash', 'PayMaya', 'Card')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const categoriesTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      color VARCHAR(7) DEFAULT '#6B7280',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(inventoryTableQuery);
    await pool.query(salesTableQuery);
    await pool.query(categoriesTableQuery);
    console.log('Inventory tables created or already exist');
  } catch (err) {
    console.error('Error creating inventory tables:', err);
  }
};

const insertSampleData = async () => {
  // Sample inventory items
  const sampleInventoryItems = [
    {
      product_name: 'Product 1',
      category: 'Category 1',
      stock: 69,
      status: 'In Stock',
      product_price: 69.69,
      total_amount: 69 * 69.69
    },
    {
      product_name: 'Product 2',
      category: 'Category 2',
      stock: 10,
      status: 'Low Stock',
      product_price: 20.20,
      total_amount: 10 * 20.20
    },
    {
      product_name: 'Product 3',
      category: 'Category 3',
      stock: 5,
      status: 'Low Stock',
      product_price: 50.00,
      total_amount: 5 * 50.00
    },
    {
      product_name: 'Product 4',
      category: 'Category 4',
      stock: 0,
      status: 'Out Of Stock',
      product_price: 5.00,
      total_amount: 0
    },
    {
      product_name: 'Product 5',
      category: 'Category 5',
      stock: 69,
      status: 'In Stock',
      product_price: 30.00,
      total_amount: 69 * 30.00
    }
  ];

  // Sample sales records
  const sampleSalesRecords = [
    {
      date: '2025-09-25',
      product_name: 'Platos',
      quantity: 2,
      price: 15.00,
      total: 30.00,
      payment_method: 'Cash'
    },
    {
      date: '2025-09-25',
      product_name: 'Nova',
      quantity: 2,
      price: 16.00,
      total: 32.00,
      payment_method: 'Gcash'
    },
    {
      date: '2025-09-25',
      product_name: 'Mobee',
      quantity: 1,
      price: 8.00,
      total: 8.00,
      payment_method: 'PayMaya'
    },
    {
      date: '2025-09-25',
      product_name: 'Pencil',
      quantity: 2,
      price: 6.00,
      total: 12.00,
      payment_method: 'Cash'
    },
    {
      date: '2025-09-25',
      product_name: '1 whole paper',
      quantity: 1,
      price: 50.00,
      total: 50.00,
      payment_method: 'Cash'
    }
  ];

  // Sample categories
  const sampleCategories = [
    { name: 'Category 1', color: '#3B82F6' },
    { name: 'Category 2', color: '#EF4444' },
    { name: 'Category 3', color: '#10B981' },
    { name: 'Category 4', color: '#F59E0B' },
    { name: 'Category 5', color: '#EC4899' }
  ];

  try {
    // Insert inventory items
    for (const item of sampleInventoryItems) {
      const insertQuery = `
        INSERT INTO inventory_items (product_name, category, stock, status, product_price, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `;
      const values = [
        item.product_name,
        item.category,
        item.stock,
        item.status,
        item.product_price,
        item.total_amount
      ];
      await pool.query(insertQuery, values);
    }

    // Insert sales records
    for (const sale of sampleSalesRecords) {
      const insertQuery = `
        INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `;
      const values = [
        sale.date,
        sale.product_name,
        sale.quantity,
        sale.price,
        sale.total,
        sale.payment_method
      ];
      await pool.query(insertQuery, values);
    }

    // Insert categories
    for (const category of sampleCategories) {
      const insertQuery = `
        INSERT INTO categories (name, color)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING;
      `;
      const values = [category.name, category.color];
      await pool.query(insertQuery, values);
    }

    console.log('Sample inventory data inserted');
  } catch (err) {
    console.error('Error inserting sample inventory data:', err);
  }
};

const syncInventoryDatabase = async () => {
  await createInventoryTables();
  await insertSampleData();
};

module.exports = { syncInventoryDatabase };
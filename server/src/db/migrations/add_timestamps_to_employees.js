// server/src/db/migrations/add_timestamps_to_employees.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function addTimestampColumns() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add created_at if it doesn't exist
    const checkCreatedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' AND column_name = 'created_at'
    `);
    
    if (checkCreatedAt.rows.length === 0) {
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('Added created_at column to employees table');
    }

    // Add updated_at if it doesn't exist
    const checkUpdatedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' AND column_name = 'updated_at'
    `);
    
    if (checkUpdatedAt.rows.length === 0) {
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN updated_at TIMESTAMP DEFAULT NULL
      `);
      console.log('Added updated_at column to employees table');
    }

    // Add deleted_at if it doesn't exist
    const checkDeletedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' AND column_name = 'deleted_at'
    `);
    
    if (checkDeletedAt.rows.length === 0) {
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
      `);
      console.log('Added deleted_at column to employees table');
    }
    
    await client.query('COMMIT');
    console.log('Successfully added timestamp columns to employees table');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding timestamp columns:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addTimestampColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function updateAttendance() {
  try {
    await client.connect();
    console.log('Connected to the database.');

    await client.query('UPDATE attendance SET employee_id = 1');
    console.log('Updated all attendance records.');

    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

updateAttendance();

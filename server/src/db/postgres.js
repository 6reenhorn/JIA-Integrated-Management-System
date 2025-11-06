const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_DTAow4dsj2Lv@ep-summer-dust-ada3kkqu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false, // For Neon, which uses self-signed certificates
  },
});

pool.on('connect', async (client) => {
  console.log('Connected to the database');
  try {
    await client.query("SET TIME ZONE 'Asia/Manila'");
//    console.log('Timezone set to Asia/Manila');
  } catch (err) {
    console.error('Error setting timezone:', err);
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

#!/usr/bin/env node
/**
 * Safe migration script to convert certain Postgres timestamp columns to timestamptz
 * interpreting existing values as Asia/Manila local wall-clock times.
 *
 * Usage: from project root
 *   node server/scripts/migrate_postgres_timestamps.js
 *
 * The script will:
 *  - Connect using server/src/db/postgres.js pool (reads DATABASE_URL env)
 *  - Inspect column data types for the attendance and employees tables
 *  - For columns of type "timestamp without time zone", run:
 *      ALTER TABLE <table> ALTER COLUMN <col> TYPE timestamptz USING <col> AT TIME ZONE 'Asia/Manila';
 *  - For other types, it will print guidance and skip.
 *
 * IMPORTANT: BACKUP your database before running this. The script prompts for confirmation.
 */

const { pool } = require('../src/db/postgres');
const readline = require('readline');

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function getColumnType(schema, table, column) {
  const res = await pool.query(
    `SELECT data_type, udt_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    [schema, table, column]
  );
  return res.rows[0] || null;
}

async function run() {
  console.log('\nPOSTGRES TIMESTAMP MIGRATION');
  console.log('This will convert TIMESTAMP WITHOUT TIME ZONE columns to TIMESTAMPTZ by interpreting existing values as Asia/Manila local wall-clock times.');
  console.log('\nMake sure you have a backup.');

  const answer = (await ask('Type YES to proceed (all caps): ')).trim();
  if (answer !== 'YES') {
    console.log('Aborting. No changes made.');
    process.exit(0);
  }

  try {
    // Check current types
    const checks = [
      { schema: 'public', table: 'attendance', column: 'time_in' },
      { schema: 'public', table: 'attendance', column: 'time_out' },
      { schema: 'public', table: 'attendance', column: 'created_at' },
      { schema: 'public', table: 'attendance', column: 'updated_at' },
      { schema: 'public', table: 'employees', column: 'last_login' }
    ];

    const toRun = [];

    for (const c of checks) {
      const col = await getColumnType(c.schema, c.table, c.column);
      if (!col) {
        console.log(`Column not found: ${c.table}.${c.column} - skipping`);
        continue;
      }
      console.log(`${c.table}.${c.column}: data_type=${col.data_type}, udt_name=${col.udt_name}`);
      // data_type can be 'timestamp without time zone' or 'timestamp with time zone'
      if (col.data_type === 'timestamp without time zone' || col.udt_name === 'timestamp') {
        // Prepare ALTER statement
        const sql = `ALTER TABLE ${c.table} ALTER COLUMN ${c.column} TYPE timestamptz USING ${c.column} AT TIME ZONE 'Asia/Manila';`;
        toRun.push({ table: c.table, column: c.column, sql });
      } else if (col.data_type === 'timestamp with time zone' || col.udt_name === 'timestamptz') {
        console.log(`Column ${c.table}.${c.column} is already timestamptz - skipping`);
      } else {
        console.log(`Column ${c.table}.${c.column} has type ${col.data_type} (udt: ${col.udt_name}) - this script only alters timestamp columns. Skipping.`);
      }
    }

    if (toRun.length === 0) {
      console.log('No ALTER statements to run. Exiting.');
      process.exit(0);
    }

    console.log('\nThe following ALTER statements will be executed:');
    toRun.forEach(t => console.log(t.sql));
    const confirm = (await ask('\nType RUN to execute these statements: ')).trim();
    if (confirm !== 'RUN') {
      console.log('Aborted by user. No changes made.');
      process.exit(0);
    }

    // Execute within a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const t of toRun) {
        console.log(`Running: ${t.sql}`);
        await client.query(t.sql);
      }
      await client.query('COMMIT');
      console.log('Migration completed successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error running migration, rolled back. Error:', err.message || err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Migration script failed:', err.message || err);
  } finally {
    // Close pool and exit
    await pool.end();
    process.exit(0);
  }
}

run();

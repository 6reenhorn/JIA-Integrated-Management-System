"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// POST /api/attendance/checkin - Check in an employee
router.post('/checkin', async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.status(400).json({ error: 'Employee ID and password are required' });
  }

  try {
    // First, verify the password
    const employeeQuery = 'SELECT password FROM employees WHERE id = $1';
    const employeeResult = await pool.query(employeeQuery, [employeeId]);
    if (employeeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    const storedPassword = employeeResult.rows[0].password;
    if (storedPassword !== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const checkQuery = 'SELECT id FROM attendance WHERE employee_id = $1 AND date = $2';
    const checkResult = await pool.query(checkQuery, [employeeId, today]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Insert check-in record
    const insertQuery = 'INSERT INTO attendance (employee_id, date, time_in, status) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)';
    await pool.query(insertQuery, [employeeId, today, 'Present']);

    res.json({ message: 'Check-in successful' });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/attendance - Get all attendance records
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM attendance ORDER BY date DESC, time_in DESC';
    const result = await pool.query(query);
    const records = result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      date: row.date,
      timeIn: row.time_in,
      timeOut: row.time_out,
      status: row.status
    }));
    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

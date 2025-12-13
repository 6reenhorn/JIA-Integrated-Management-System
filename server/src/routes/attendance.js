'use strict';
const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db/dbHelper');
const { getPHLocalTimeISO, getPHLocalDate } = require('../utils/timeUtils');
const bcrypt = require('bcryptjs');

router.post('/checkin', async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.status(400).json({ error: 'Employee ID and password are required' });
  }

  try {
    const employee = await dbHelper.queryOne(
      'SELECT * FROM employees WHERE (id = ? OR emp_id = ?) AND deleted_at IS NULL', 
      [employeeId, employeeId]
    );

    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Verify password - check if password is hashed or plain text
    const storedPassword = employee.password;
    if (!storedPassword) {
      return res.status(400).json({ error: 'Employee password not set' });
    }
    
    const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
    
    let isMatch = false;
    try {
      if (isHashed) {
        // Compare hashed password
        isMatch = await bcrypt.compare(password, storedPassword);
      } else {
        // Plain text comparison (for backwards compatibility)
        isMatch = storedPassword === password;
      }
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(400).json({ error: 'Error verifying password' });
    }
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // For admin, just return success without recording attendance
    if (employee.role.toLowerCase() === 'admin') {
      return res.json({
        success: true,
        user: {
          id: employee.id,
          empId: employee.emp_id,
          name: employee.name,
          role: employee.role,
          isAdmin: true
        },
        message: 'Admin access granted'
      });
    }

    // For regular employees, record attendance (using PH local time)
    const today = getPHLocalDate();
    const existing = await dbHelper.queryOne(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employee.id, today]
    );

    if (existing) {
      return res.json({
        success: true,
        user: {
          id: employee.id,
          empId: employee.emp_id,
          name: employee.name,
          role: employee.role,
          isAdmin: false
        },
        alreadyCheckedIn: true,
        message: 'Already checked in today'
      });
    }

    const now = getPHLocalTimeISO();
    await dbHelper.insert('attendance', {
      employee_id: employee.id,
      date: today,
      time_in: now,
      status: 'Present',
      created_at: now,
      updated_at: now
    });

    // Update last_login in employees table (using PH local time)
    await dbHelper.update('employees', employee.id, {
      last_login: now
    });

    res.json({
      success: true,
      user: {
        id: employee.id,
        empId: employee.emp_id,
        name: employee.name,
        role: employee.role,
        isAdmin: false
      },
      alreadyCheckedIn: false,
      message: 'Check-in successful'
    });

  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/checkout', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  try {
    const employee = await dbHelper.queryOne(
      'SELECT * FROM employees WHERE (id = ? OR emp_id = ?) AND deleted_at IS NULL', 
      [employeeId, employeeId]
    );

    if (!employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // For admin, just return success without recording attendance
    if (employee.role.toLowerCase() === 'admin') {
      return res.json({
        success: true,
        message: 'Admin checkout successful'
      });
    }

    // Find the most recent attendance record for this employee
    // Unlike checkin which creates a new record, checkout always updates the most recent one
    const attendanceRecord = await dbHelper.queryOne(
      'SELECT id FROM attendance WHERE employee_id = ? AND deleted_at IS NULL ORDER BY date DESC, time_in DESC LIMIT 1',
      [employee.id]
    );

    if (!attendanceRecord) {
      return res.status(400).json({ error: 'No attendance record found to checkout' });
    }

    // Update the attendance record with time_out (using PH local time)
    const now = getPHLocalTimeISO();
    await dbHelper.update('attendance', attendanceRecord.id, {
      time_out: now,
      updated_at: now
    });

    res.json({
      success: true,
      message: 'Check-out successful'
    });

  } catch (err) {
    console.error('Error during check-out:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to format time in 12-hour format (HH:MM AM/PM)
// Parse stored timestamps robustly and display them in Philippines timezone (Asia/Manila)
// using Intl.DateTimeFormat to avoid manual offset math and double-shifting.
const formatTime = (timeValue) => {
  if (timeValue === null || timeValue === undefined) return null;
  try {
    let dateObj;

    if (typeof timeValue === 'number') {
      // Treat numbers as milliseconds since epoch
      dateObj = new Date(timeValue);
    } else if (typeof timeValue === 'string') {
      let t = timeValue.trim();
      // Normalize SQL datetime with a space to an ISO-like string
      if (t.includes(' ') && !t.includes('T')) {
        // Some databases store 'YYYY-MM-DD HH:MM:SS.sss' without timezone
        // Treat it as local/naive time by attaching 'Z' to avoid incorrect local parsing later
        // but prefer parsing as-is first
        const tryIso = t.replace(' ', 'T');
        const parsed = Date.parse(tryIso);
        if (!isNaN(parsed)) {
          dateObj = new Date(parsed);
        } else {
          // As a fallback, append Z (assume UTC) and parse
          dateObj = new Date(tryIso + 'Z');
        }
      } else {
        // Let Date.parse handle ISO strings with timezone (Z or +08:00)
        const parsed = Date.parse(t);
        if (!isNaN(parsed)) {
          dateObj = new Date(parsed);
        } else {
          // As a last resort, try adding Z
          const parsedZ = Date.parse(t + 'Z');
          if (!isNaN(parsedZ)) dateObj = new Date(parsedZ);
          else return null;
        }
      }
    } else {
      return null;
    }

    if (!dateObj || isNaN(dateObj.getTime())) return null;

    // Use Intl.DateTimeFormat to format the time in Asia/Manila timezone reliably
    const dtf = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });

    return dtf.format(dateObj);
  } catch (err) {
    return null;
  }
};

router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query(`
      SELECT 
        a.id AS attendance_id,
        e.name,
        e.emp_id,
        e.role,
        a.date,
        a.time_in,
        a.time_out,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.role != 'admin' AND e.role != 'Admin' AND e.deleted_at IS NULL AND a.deleted_at IS NULL
      ORDER BY a.date DESC, a.time_in DESC
    `);

    const records = rows.map(row => {
      // Format date as ISO string - frontend will format it using date formatter
      let dateStr = row.date;
      if (dateStr && !dateStr.includes('T')) {
        // If it's just a date string (YYYY-MM-DD), convert to ISO
        dateStr = new Date(dateStr + 'T00:00:00').toISOString();
      }
      
      return {
        attendanceId: row.attendance_id,
        name: row.name,
        empId: row.emp_id,
        role: row.role,
        date: dateStr || row.date,
        timeIn: formatTime(row.time_in),
        timeOut: formatTime(row.time_out),
        status: row.status
      };
    });

    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

module.exports = router;
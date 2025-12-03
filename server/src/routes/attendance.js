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

// Helper function to format time in 12-hour format (HH:MM AM/PM)
const formatTime = (timeValue) => {
  if (!timeValue && timeValue !== 0) return null;
  try {
    // Handle both string and number (Unix timestamp) inputs
    let date;
    if (typeof timeValue === 'number') {
      // If it's a number, treat it as milliseconds since epoch
      date = new Date(timeValue);
    } else if (typeof timeValue === 'string') {
      // Handle SQL datetime format: "2025-11-30 06:49:27.565"
      // Convert to ISO format by replacing space with 'T'
      let timeStr = timeValue.trim();
      if (timeStr.includes(' ') && !timeStr.includes('T')) {
        // Replace space with 'T' to make it ISO-like: "2025-11-30T06:49:27.565"
        timeStr = timeStr.replace(' ', 'T');
      }
      date = new Date(timeStr);
    } else {
      return null;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch {
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
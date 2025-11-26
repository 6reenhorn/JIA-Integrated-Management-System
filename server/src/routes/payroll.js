"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/payroll - Fetch all payroll records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payroll_records ORDER BY id');

    // Reverse month map
    const reverseMonthMap = {
      1: 'January', 2: 'February', 3: 'March', 4: 'April',
      5: 'May', 6: 'June', 7: 'July', 8: 'August',
      9: 'September', 10: 'October', 11: 'November', 12: 'December'
    };

    const payrollRecords = result.rows.map(row => ({
      id: row.id,
      employeeName: row.employee_name,
      empId: row.emp_id,
      role: row.role,
      month: reverseMonthMap[row.month] || row.month,
      year: row.year,
      basicSalary: row.basic_salary,
      deductions: row.deductions,
      netSalary: row.net_salary,
      status: row.status,
      paymentDate: row.payment_date || null
    }));
    res.json(payrollRecords);
  } catch (err) {
    console.error('Error fetching payroll records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payroll - Add a new payroll record
router.post('/', async (req, res) => {
  const {
    employeeName,
    empId,
    role,
    month,
    year,
    basicSalary,
    deductions,
    netSalary,
    status,
    paymentDate
  } = req.body;

  // Month conversion map
  const monthMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  try {
    const query = `
      INSERT INTO payroll_records (employee_name, emp_id, role, month, year, basic_salary, deductions, net_salary, status, payment_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      employeeName,
      empId,
      role,
      monthMap[month] || month, // Convert month name to number
      parseInt(year),           // Convert year to integer
      basicSalary,
      deductions,
      netSalary,
      status,
      paymentDate || null
    ];

    console.log('Inserting values:', values); // Debug log

    const result = await pool.query(query, values);
    const newRecord = result.rows[0];

    const payrollRecord = {
      id: newRecord.id,
      employeeName: newRecord.employee_name,
      empId: newRecord.emp_id,
      role: newRecord.role,
      month: newRecord.month,
      year: newRecord.year,
      basicSalary: newRecord.basic_salary,
      deductions: newRecord.deductions,
      netSalary: newRecord.net_salary,
      status: newRecord.status,
      paymentDate: newRecord.payment_date || null
    };

    res.status(201).json(payrollRecord);
  } catch (err) {
    console.error('Error adding payroll record:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
});

// DELETE /api/payroll/:id - Delete a payroll record by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(String(id), 10);
  if (Number.isNaN(idNum)) {
    return res.status(400).json({ error: 'Invalid payroll record id' });
  }

  try {
    const query = 'DELETE FROM payroll_records WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [idNum]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    res.json({ message: 'Payroll record deleted successfully' });
  } catch (err) {
    console.error('Error deleting payroll record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/payroll/:id - Update a payroll record by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(String(id), 10);
  
  if (Number.isNaN(idNum)) {
    return res.status(400).json({ error: 'Invalid payroll record id' });
  }

  const {
    employeeName,
    empId,
    role,
    month,
    year,
    basicSalary,
    deductions,
    netSalary,
    status,
    paymentDate
  } = req.body;

  // Month conversion map
  const monthMap = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  // Reverse month map for response
  const reverseMonthMap = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December'
  };

  try {
    const query = `
      UPDATE payroll_records 
      SET employee_name = $1, 
          emp_id = $2, 
          role = $3, 
          month = $4, 
          year = $5, 
          basic_salary = $6, 
          deductions = $7, 
          net_salary = $8, 
          status = $9, 
          payment_date = $10
      WHERE id = $11
      RETURNING *
    `;
    
    const values = [
      employeeName,
      empId,
      role,
      monthMap[month] || month, // Convert month name to number
      parseInt(year),           // Convert year to integer
      parseFloat(basicSalary),  // Add parseFloat
      parseFloat(deductions),   // Add parseFloat
      parseFloat(netSalary),    // Add parseFloat
      status,
      paymentDate && paymentDate !== '' ? paymentDate : null, // Just pass as-is or null
      idNum
    ];

    console.log('Updating payroll record with values:', values); // Debug log

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const updatedRecord = result.rows[0];

    const payrollRecord = {
      id: updatedRecord.id,
      employeeName: updatedRecord.employee_name,
      empId: updatedRecord.emp_id,
      role: updatedRecord.role,
      month: reverseMonthMap[updatedRecord.month] || updatedRecord.month,
      year: updatedRecord.year,
      basicSalary: updatedRecord.basic_salary,
      deductions: updatedRecord.deductions,
      netSalary: updatedRecord.net_salary,
      status: updatedRecord.status,
      paymentDate: updatedRecord.payment_date || null
    };

    res.json(payrollRecord);
  } catch (err) {
    console.error('Error updating payroll record:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
});

module.exports = router;
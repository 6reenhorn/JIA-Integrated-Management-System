"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/employees - Fetch all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id');
    const employees = result.rows.map(row => ({
      id: row.id,
      empId: row.emp_id,
      name: row.name,
      role: row.role,
      department: row.department,
      contact: row.contact,
      status: row.status,
      lastLogin: row.last_login ? row.last_login.toISOString().slice(0, 16).replace('T', ' ') : 'Never',
      avatar: row.avatar,
      address: row.address,
      salary: row.salary,
      contactName: row.contact_name,
      contactNumber: row.contact_number,
      relationship: row.relationship
    }));
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - Add a new employee
router.post('/', async (req, res) => {
  const {
    name,
    role,
    department,
    contact,
    status,
    avatar,
    address,
    salary,
    contactName,
    contactNumber,
    relationship
  } = req.body;

  try {
    // Generate empId
    const empIdResult = await pool.query('SELECT COALESCE(MAX(CAST(SUBSTRING(emp_id FROM 4) AS INTEGER)), 0) as max_id FROM employees');
    const maxId = parseInt(empIdResult.rows[0].max_id) + 1;
    const empId = `EMP${String(maxId).padStart(3, '0')}`;

    const query = `
      INSERT INTO employees (emp_id, name, role, department, contact, status, avatar, address, salary, contact_name, contact_number, relationship)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      empId,
      name,
      role,
      department || '',
      contact,
      status || 'Active',
      avatar,
      address,
      salary,
      contactName,
      contactNumber,
      relationship
    ];

    const result = await pool.query(query, values);
    const newEmployee = result.rows[0];

    const employee = {
      id: newEmployee.id,
      empId: newEmployee.emp_id,
      name: newEmployee.name,
      role: newEmployee.role,
      department: newEmployee.department,
      contact: newEmployee.contact,
      status: newEmployee.status,
      lastLogin: 'Never',
      avatar: newEmployee.avatar,
      address: newEmployee.address,
      salary: newEmployee.salary,
      contactName: newEmployee.contact_name,
      contactNumber: newEmployee.contact_number,
      relationship: newEmployee.relationship
    };

    res.status(201).json(employee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - Update an employee
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    role,
    department,
    contact,
    status,
    avatar,
    address,
    salary,
    contactName,
    contactNumber,
    relationship
  } = req.body;

  try {
    const query = `
      UPDATE employees
      SET name = $1, role = $2, department = $3, contact = $4, status = $5, avatar = $6, address = $7, salary = $8, contact_name = $9, contact_number = $10, relationship = $11
      WHERE id = $12
      RETURNING *
    `;
    const values = [
      name,
      role,
      department,
      contact,
      status,
      avatar,
      address,
      salary,
      contactName,
      contactNumber,
      relationship,
      id
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const updatedEmployee = result.rows[0];
    const employee = {
      id: updatedEmployee.id,
      empId: updatedEmployee.emp_id,
      name: updatedEmployee.name,
      role: updatedEmployee.role,
      department: updatedEmployee.department,
      contact: updatedEmployee.contact,
      status: updatedEmployee.status,
      lastLogin: updatedEmployee.last_login ? updatedEmployee.last_login.toISOString().slice(0, 16).replace('T', ' ') : 'Never',
      avatar: updatedEmployee.avatar,
      address: updatedEmployee.address,
      salary: updatedEmployee.salary,
      contactName: updatedEmployee.contact_name,
      contactNumber: updatedEmployee.contact_number,
      relationship: updatedEmployee.relationship
    };

    res.json(employee);
    return;
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// DELETE /api/employees/:id - Delete an employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    res.json({ message: 'Employee deleted successfully' });
    return;
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

module.exports = router;



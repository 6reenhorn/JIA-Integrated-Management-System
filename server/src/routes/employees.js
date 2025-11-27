'use strict';
const express = require('express');
const { dbHelper } = require('../db/dbHelper');

const router = express.Router();

// Helper to map DB row to response format
const mapEmployee = (row) => ({
  id: row.id,
  empId: row.emp_id,
  name: row.name || (row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : ''),
  firstName: row.first_name || null,
  lastName: row.last_name || null,
  role: row.role,
  department: row.department,
  contact: row.contact,
  status: row.status,
  lastLogin: row.last_login || 'Never',
  avatar: row.avatar,
  address: row.address,
  salary: row.salary,
  contactName: row.contact_name,
  contactNumber: row.contact_number,
  relationship: row.relationship,
  password: row.password
});

// GET /api/employees - Fetch all employees
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query('SELECT * FROM employees WHERE deleted_at IS NULL ORDER BY id DESC');
    const employees = rows.map(mapEmployee);
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - Add a new employee
router.post('/', async (req, res) => {
  try {
    const {
      name, firstName, lastName, role, department, contact, status, avatar, address, 
      salary, contactName, contactNumber, relationship, password
    } = req.body;

    // Generate empId
    const maxIdRow = await dbHelper.queryOne(
      'SELECT COALESCE(MAX(CAST(SUBSTR(emp_id, 4) AS INTEGER)), 0) as max_id FROM employees'
    );
    const maxId = parseInt(maxIdRow.max_id) + 1;
    const empId = `EMP${maxId.toString().padStart(3, '0')}`;

    // Use provided name or construct from firstName/lastName
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');

    const employeeData = {
      emp_id: empId,
      name: fullName,
      first_name: firstName || null,
      last_name: lastName || null,
      role,
      department,
      contact,
      status: status || 'Active',
      avatar: avatar || null,
      address: address || null,
      salary: salary || null,
      contact_name: contactName || null,
      contact_number: contactNumber || null,
      relationship: relationship || null,
      password: password || 'password123' // In a real app, hash the password
    };

    const result = await dbHelper.insert('employees', employeeData);
    
    // Debug: Verify the record was created with synced = 0
    const verifyRecord = await dbHelper.queryOne('SELECT id, emp_id, synced FROM employees WHERE id = ?', [result.id]);
    if (verifyRecord) {
      console.log(`[SYNC DEBUG] New employee created - ID: ${verifyRecord.id}, emp_id: ${verifyRecord.emp_id}, synced: ${verifyRecord.synced}`);
      if (verifyRecord.synced !== 0) {
        console.warn(`[SYNC WARNING] New employee should have synced=0 but has synced=${verifyRecord.synced}`);
      }
    }

    const newEmployee = {
      id: result.id,
      empId,
      name: fullName,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      department,
      contact,
      status: status || 'Active',
      avatar: avatar || null,
      address: address || null,
      salary: salary || null,
      contactName: contactName || null,
      contactNumber: contactNumber || null,
      relationship: relationship || null
    };

    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - Update an employee
router.put('/:id', async (req, res) => {
  console.log(`[EMPLOYEE PUT] ========== ROUTE CALLED ==========`);
  console.log(`[EMPLOYEE PUT] Params:`, req.params);
  console.log(`[EMPLOYEE PUT] Body:`, req.body);
  
  try {
    const { id } = req.params;
    const employeeId = parseInt(id, 10);
    
    console.log(`[EMPLOYEE PUT] Parsed employeeId: ${employeeId}`);
    
    if (isNaN(employeeId)) {
      console.log(`[EMPLOYEE PUT] ERROR: Invalid employee ID: ${id}`);
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const {
      name,
      firstName,
      lastName,
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
      password
    } = req.body;

    // Use provided name or construct from firstName/lastName, or keep existing if not provided
    let fullName = name;
    if (!fullName && firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (!fullName && firstName) {
      fullName = firstName;
    } else if (!fullName && lastName) {
      fullName = lastName;
    }

    // Check current state before update
    const beforeUpdate = await dbHelper.getById('employees', employeeId);
    if (!beforeUpdate || beforeUpdate.deleted_at) {
      console.log(`[DEBUG] ERROR: Employee ${employeeId} not found!`);
      return res.status(404).json({ error: 'Employee not found' });
    }
    console.log(`[DEBUG] Before update - id: ${beforeUpdate.id}, emp_id: ${beforeUpdate.emp_id}, synced: ${beforeUpdate.synced}, name: ${beforeUpdate.name}`);

    // Use dbHelper.update to automatically mark as synced = 0
    console.log(`[DEBUG] ========== EMPLOYEE UPDATE START ==========`);
    await dbHelper.update('employees', employeeId, {
      name: fullName || null,
      first_name: firstName || null,
      last_name: lastName || null,
      role: role,
      department: department || null,
      contact: contact,
      status: status,
      avatar: avatar || null,
      address: address || null,
      salary: salary,
      contact_name: contactName || null,
      contact_number: contactNumber || null,
      relationship: relationship || null,
      password: password
    });
    
    const updatedEmployee = await dbHelper.getById('employees', employeeId);
    
    // Debug: Verify synced flag was set to 0
    if (updatedEmployee) {
      console.log(`[DEBUG] After update - id: ${updatedEmployee.id}, emp_id: ${updatedEmployee.emp_id}, synced: ${updatedEmployee.synced}, name: ${updatedEmployee.name}`);
      
      if (updatedEmployee.synced !== 0 && updatedEmployee.synced !== '0') {
        console.log(`[DEBUG] WARNING: synced is not 0! It is: ${updatedEmployee.synced} (type: ${typeof updatedEmployee.synced})`);
      } else {
        console.log(`[DEBUG] SUCCESS: synced = 0 confirmed!`);
      }
    } else {
      console.log(`[DEBUG] ERROR: Employee ${employeeId} not found after update!`);
    }
    console.log(`[DEBUG] ========== EMPLOYEE UPDATE END ==========`);

    const employee = mapEmployee(updatedEmployee);
    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:id - Soft delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id, 10);
    
    console.log(`Attempting to soft delete employee with ID: ${id} (parsed: ${employeeId})`);
    
    if (isNaN(employeeId)) {
      console.log(`Invalid employee ID: ${id}`);
      return res.status(400).json({ error: 'Invalid employee ID' });
    }
    
    // Check if employee exists and is not already deleted
    const employee = await dbHelper.queryOne('SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL', [employeeId]);
    if (!employee) {
      console.log(`Employee ${employeeId} not found or already deleted`);
      // Check if it exists but is deleted
      const deletedEmployee = await dbHelper.queryOne('SELECT id, deleted_at FROM employees WHERE id = ?', [employeeId]);
      if (deletedEmployee) {
        return res.status(404).json({ error: 'Employee already deleted' });
      }
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log(`Soft deleting employee:`, { id: employee.id, name: employee.name, emp_id: employee.emp_id });

    // Use soft delete - set deleted_at timestamp
    await dbHelper.delete('employees', employeeId);

    // Cascade soft delete: Also soft delete all attendance records for this employee
    const attendanceCount = await dbHelper.run(
      `UPDATE attendance 
       SET deleted_at = CURRENT_TIMESTAMP, synced = 0 
       WHERE employee_id = ? AND deleted_at IS NULL`,
      [employeeId]
    );
    console.log(`Soft deleted ${attendanceCount.changes || 0} attendance records for employee ${employeeId}`);

    console.log(`Successfully soft deleted employee ${employeeId}`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
import { Router } from 'express';
import { dbHelper } from '../db/dbHelper';

const router = Router();

// GET /api/employees - Fetch all employees
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query('SELECT * FROM employees WHERE deleted_at IS NULL ORDER BY id DESC');
    const employees = rows.map((row: any) => ({
      id: row.id,
      empId: row.emp_id,
      name: row.name || (row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : ''),
      firstName: row.first_name || null,
      lastName: row.last_name || null,
      role: row.role,
      department: row.department || null,
      contact: row.contact,
      status: row.status,
      lastLogin: row.last_login ? new Date(row.last_login).toISOString().slice(0, 16).replace('T', ' ') : 'Never',
      avatar: row.avatar || null,
      address: row.address || null,
      salary: row.salary,
      contactName: row.contact_name || null,
      contactNumber: row.contact_number || null,
      relationship: row.relationship || null,
      password: row.password
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
    firstName,
    lastName,
    role,
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

  try {
    // Generate empId - get max emp_id number
    const maxIdResult = await dbHelper.query('SELECT MAX(CAST(SUBSTR(emp_id, 4) AS INTEGER)) as max_id FROM employees WHERE emp_id LIKE "EMP%"');
    const maxId = (maxIdResult[0]?.max_id || 0) + 1;
    const empId = `EMP${String(maxId).padStart(3, '0')}`;

    // Use provided name or construct from firstName/lastName
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');

    const query = `
      INSERT INTO employees (emp_id, name, first_name, last_name, role, contact, status, avatar, address, salary, contact_name, contact_number, relationship, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      empId,
      fullName,
      firstName || null,
      lastName || null,
      role,
      contact,
      status || 'Active',
      avatar || null,
      address || null,
      salary,
      contactName || null,
      contactNumber || null,
      relationship || null,
      password
    ];

    const result = await dbHelper.run(query, values);
    const newEmployee = await dbHelper.getById('employees', result.lastID);

    const employee = {
      id: newEmployee.id,
      empId: newEmployee.emp_id,
      name: newEmployee.name || (newEmployee.first_name && newEmployee.last_name ? `${newEmployee.first_name} ${newEmployee.last_name}` : ''),
      firstName: newEmployee.first_name || null,
      lastName: newEmployee.last_name || null,
      role: newEmployee.role,
      department: newEmployee.department || null,
      contact: newEmployee.contact,
      status: newEmployee.status,
      lastLogin: 'Never',
      avatar: newEmployee.avatar || null,
      address: newEmployee.address || null,
      salary: newEmployee.salary,
      contactName: newEmployee.contact_name || null,
      contactNumber: newEmployee.contact_number || null,
      relationship: newEmployee.relationship || null,
      password: newEmployee.password
    };

    res.status(201).json(employee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/employees/:id - Update an employee
router.put('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;
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

  try {
    // Use provided name or construct from firstName/lastName, or keep existing if not provided
    let fullName = name;
    if (!fullName && firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (!fullName && firstName) {
      fullName = firstName;
    } else if (!fullName && lastName) {
      fullName = lastName;
    }

    const query = `
      UPDATE employees
      SET name = ?, first_name = ?, last_name = ?, role = ?, department = ?, contact = ?, status = ?, avatar = ?, address = ?, salary = ?, contact_name = ?, contact_number = ?, relationship = ?, password = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      fullName || null,
      firstName || null,
      lastName || null,
      role,
      department || null,
      contact,
      status,
      avatar || null,
      address || null,
      salary,
      contactName || null,
      contactNumber || null,
      relationship || null,
      password,
      id
    ];

    await dbHelper.run(query, values);
    const updatedEmployee = await dbHelper.getById('employees', id);
    
    if (!updatedEmployee || updatedEmployee.deleted_at) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const employee = {
      id: updatedEmployee.id,
      empId: updatedEmployee.emp_id,
      name: updatedEmployee.name || (updatedEmployee.first_name && updatedEmployee.last_name ? `${updatedEmployee.first_name} ${updatedEmployee.last_name}` : ''),
      firstName: updatedEmployee.first_name || null,
      lastName: updatedEmployee.last_name || null,
      role: updatedEmployee.role,
      department: updatedEmployee.department || null,
      contact: updatedEmployee.contact,
      status: updatedEmployee.status,
      lastLogin: updatedEmployee.last_login ? new Date(updatedEmployee.last_login).toISOString().slice(0, 16).replace('T', ' ') : 'Never',
      avatar: updatedEmployee.avatar || null,
      address: updatedEmployee.address || null,
      salary: updatedEmployee.salary,
      contactName: updatedEmployee.contact_name || null,
      contactNumber: updatedEmployee.contact_number || null,
      relationship: updatedEmployee.relationship || null,
      password: updatedEmployee.password
    };

    res.json(employee);
    return;
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// DELETE /api/employees/:id - Soft delete an employee
router.delete('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;
  const employeeId = parseInt(id, 10);

  try {
    console.log(`Attempting to soft delete employee with ID: ${id} (parsed: ${employeeId})`);
    
    if (isNaN(employeeId)) {
      console.log(`Invalid employee ID: ${id}`);
      res.status(400).json({ error: 'Invalid employee ID' });
      return;
    }
    
    // Check if employee exists and is not already deleted
    const employee = await dbHelper.queryOne('SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL', [employeeId]);
    if (!employee) {
      console.log(`Employee ${employeeId} not found or already deleted`);
      // Check if it exists but is deleted
      const deletedEmployee = await dbHelper.queryOne('SELECT id, deleted_at FROM employees WHERE id = ?', [employeeId]);
      if (deletedEmployee) {
        res.status(404).json({ error: 'Employee already deleted' });
        return;
      }
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    console.log(`Soft deleting employee:`, { id: employee.id, name: employee.name, emp_id: employee.emp_id });

    // Use soft delete - set deleted_at timestamp
    await dbHelper.delete('employees', employeeId);

    console.log(`Successfully soft deleted employee ${employeeId}`);
    res.json({ message: 'Employee deleted successfully' });
    return;
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' });
    return;
  }
});

export default router;

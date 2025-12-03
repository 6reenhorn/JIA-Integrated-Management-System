import { Router } from 'express';
import { DBHelper } from '../db/dbHelper';

const router = Router();

// Log all requests to employees routes for debugging
router.use((req, res, next) => {
  console.log(`[EMPLOYEES ROUTE] ${req.method} ${req.path}`, {
    params: req.params,
    query: req.query,
    bodyKeys: req.body ? Object.keys(req.body) : []
  });
  next();
});

// GET /api/employees - Fetch all employees
router.get('/', async (req, res) => {
  try {
    const rows = await DBHelper.query('SELECT * FROM employees WHERE deleted_at IS NULL ORDER BY id DESC');
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
      lastLogin: row.last_login && row.last_login !== null && row.last_login !== '' ? new Date(row.last_login).toISOString().slice(0, 16).replace('T', ' ') : 'Never',
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
    const maxIdResult = await DBHelper.query('SELECT MAX(CAST(SUBSTR(emp_id, 4) AS INTEGER)) as max_id FROM employees WHERE emp_id LIKE "EMP%"') as any[];
    const maxId = (maxIdResult[0]?.max_id || 0) + 1;
    const empId = `EMP${String(maxId).padStart(3, '0')}`;

    // Parse names: if lastName contains multiple words, split them
    // Last word becomes lastName, rest (plus original firstName) becomes firstName
    let parsedFirstName = firstName || '';
    let parsedLastName = lastName || '';
    
    console.log(`[EMPLOYEE CREATE] Original firstName: "${firstName}", lastName: "${lastName}"`);
    
    if (parsedLastName && parsedLastName.trim()) {
      const lastNameWords = parsedLastName.trim().split(/\s+/);
      if (lastNameWords.length > 1) {
        // Last word becomes lastName
        parsedLastName = lastNameWords[lastNameWords.length - 1];
        // Everything before last word (plus original firstName) becomes firstName
        const middleNames = lastNameWords.slice(0, -1).join(' ');
        parsedFirstName = parsedFirstName ? `${parsedFirstName} ${middleNames}`.trim() : middleNames;
        console.log(`[EMPLOYEE CREATE] Parsed - firstName: "${parsedFirstName}", lastName: "${parsedLastName}"`);
      }
    }

    // Use provided name or construct from parsed firstName/lastName
    const fullName = name || (parsedFirstName && parsedLastName ? `${parsedFirstName} ${parsedLastName}` : parsedFirstName || parsedLastName || '');

    // Generate password if not provided or empty
    let finalPassword = password;
    if (!finalPassword || (typeof finalPassword === 'string' && finalPassword.trim() === '')) {
      // Generate random password 8-10 characters
      const length = Math.floor(Math.random() * 3) + 8;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      finalPassword = '';
      for (let i = 0; i < length; i++) {
        finalPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      console.log(`[EMPLOYEE CREATE] Generated password for new employee (password was missing/empty)`);
    } else {
      console.log(`[EMPLOYEE CREATE] Using provided password (length: ${finalPassword.length})`);
    }

    // Use DBHelper.insert to automatically set synced = 0 for new records
    const result = await DBHelper.insert('employees', {
      emp_id: empId,
      name: fullName,
      first_name: parsedFirstName || null,
      last_name: parsedLastName || null,
      role: role,
      contact: contact,
      status: status || 'Active',
      avatar: avatar || null,
      address: address || null,
      salary: salary,
      contact_name: contactName || null,
      contact_number: contactNumber || null,
      relationship: relationship || null,
      password: finalPassword,
      last_login: null  // Set last_login to null for new employees
    });

    const lastId = typeof result.lastInsertRowid === 'bigint' ? Number(result.lastInsertRowid) : result.lastInsertRowid;
    const newEmployee = await DBHelper.getById('employees', lastId) as any;

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
      lastLogin: 'N/A',
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
  console.log(`[EMPLOYEE PUT] ========== ROUTE CALLED ==========`);
  console.log(`[EMPLOYEE PUT] Params:`, req.params);
  console.log(`[EMPLOYEE PUT] Body:`, req.body);
  
  const { id } = req.params;
  const employeeId = parseInt(id, 10);
  
  console.log(`[EMPLOYEE PUT] Parsed employeeId: ${employeeId}`);
  
  if (isNaN(employeeId)) {
    console.log(`[EMPLOYEE PUT] ERROR: Invalid employee ID: ${id}`);
    res.status(400).json({ error: 'Invalid employee ID' });
    return;
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

  try {
    // Parse names: if lastName contains multiple words, split them
    // Last word becomes lastName, rest (plus original firstName) becomes firstName
    let parsedFirstName = firstName;
    let parsedLastName = lastName;
    
    if (parsedLastName && parsedLastName.trim()) {
      const lastNameWords = parsedLastName.trim().split(/\s+/);
      if (lastNameWords.length > 1) {
        // Last word becomes lastName
        parsedLastName = lastNameWords[lastNameWords.length - 1];
        // Everything before last word (plus original firstName) becomes firstName
        const middleNames = lastNameWords.slice(0, -1).join(' ');
        parsedFirstName = parsedFirstName ? `${parsedFirstName} ${middleNames}`.trim() : middleNames;
      }
    }

    // Use provided name or construct from parsed firstName/lastName, or keep existing if not provided
    let fullName = name;
    if (!fullName && parsedFirstName && parsedLastName) {
      fullName = `${parsedFirstName} ${parsedLastName}`;
    } else if (!fullName && parsedFirstName) {
      fullName = parsedFirstName;
    } else if (!fullName && parsedLastName) {
      fullName = parsedLastName;
    }

    // Use DBHelper.update to automatically mark as synced = 0
    console.log(`[DEBUG] ========== EMPLOYEE UPDATE START ==========`);
    console.log(`[DEBUG] Updating employee with id: ${employeeId} (original: ${id})`);
    
    // Check current state before update
    const beforeUpdate = await DBHelper.getById('employees', employeeId) as any;
    if (!beforeUpdate) {
      console.log(`[DEBUG] ERROR: Employee ${employeeId} not found!`);
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    console.log(`[DEBUG] Before update - id: ${beforeUpdate.id}, emp_id: ${beforeUpdate.emp_id}, synced: ${beforeUpdate.synced}, name: ${beforeUpdate.name}`);
    
    // Perform the update
    const updateResult = await DBHelper.update('employees', employeeId, {
      name: fullName || null,
      first_name: parsedFirstName || null,
      last_name: parsedLastName || null,
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
    console.log(`[DEBUG] DBHelper.update() returned:`, updateResult ? 'success' : 'null');
    
    // Verify the update worked
    const updatedEmployee = await DBHelper.getById('employees', employeeId) as any;
    
    // Debug: Verify synced flag was set to 0
    if (updatedEmployee) {
      console.log(`[DEBUG] After update - id: ${updatedEmployee.id}, emp_id: ${updatedEmployee.emp_id}, synced: ${updatedEmployee.synced}, name: ${updatedEmployee.name}`);
      
      // Double-check by querying directly with both id and emp_id
      const directCheckById = await DBHelper.queryOne(
        'SELECT id, emp_id, synced, name FROM employees WHERE id = ?',
        [employeeId]
      ) as any;
      console.log(`[DEBUG] Direct check by id - id: ${directCheckById?.id}, emp_id: ${directCheckById?.emp_id}, synced: ${directCheckById?.synced}, name: ${directCheckById?.name}`);
      
      if (updatedEmployee.emp_id) {
        const directCheckByEmpId = await DBHelper.queryOne(
          'SELECT id, emp_id, synced, name FROM employees WHERE emp_id = ?',
          [updatedEmployee.emp_id]
        ) as any;
        console.log(`[DEBUG] Direct check by emp_id - id: ${directCheckByEmpId?.id}, emp_id: ${directCheckByEmpId?.emp_id}, synced: ${directCheckByEmpId?.synced}, name: ${directCheckByEmpId?.name}`);
      }
      
      if (updatedEmployee.synced !== 0 && updatedEmployee.synced !== '0') {
        console.log(`[DEBUG] WARNING: synced is not 0! It is: ${updatedEmployee.synced} (type: ${typeof updatedEmployee.synced})`);
      } else {
        console.log(`[DEBUG] SUCCESS: synced = 0 confirmed!`);
      }
    } else {
      console.log(`[DEBUG] ERROR: Employee ${employeeId} not found after update!`);
    }
    console.log(`[DEBUG] ========== EMPLOYEE UPDATE END ==========`);
    
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
      lastLogin: updatedEmployee.last_login && updatedEmployee.last_login !== null && updatedEmployee.last_login !== '' ? new Date(updatedEmployee.last_login).toISOString().slice(0, 16).replace('T', ' ') : 'Never',
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
    const employee = await DBHelper.queryOne('SELECT * FROM employees WHERE id = ? AND deleted_at IS NULL', [employeeId]) as any;
    if (!employee) {
      console.log(`Employee ${employeeId} not found or already deleted`);
      // Check if it exists but is deleted
      const deletedEmployee = await DBHelper.queryOne('SELECT id, deleted_at FROM employees WHERE id = ?', [employeeId]) as any;
      if (deletedEmployee) {
        res.status(404).json({ error: 'Employee already deleted' });
        return;
      }
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    console.log(`Soft deleting employee:`, { id: employee.id, name: employee.name, emp_id: employee.emp_id });

    // Use soft delete - set deleted_at timestamp
    await DBHelper.delete('employees', employeeId);

    // Cascade soft delete: Also soft delete all attendance records for this employee
    const attendanceCount = await DBHelper.execute(
      `UPDATE attendance 
       SET deleted_at = CURRENT_TIMESTAMP, synced = 0 
       WHERE employee_id = ? AND deleted_at IS NULL`,
      [employeeId]
    );
    console.log(`Soft deleted ${attendanceCount.changes || 0} attendance records for employee ${employeeId}`);

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

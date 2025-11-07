import { Router } from 'express';
import pool from '../db/postgres';

const router = Router();

// GET /api/payroll - Fetch all payroll records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payroll_records ORDER BY id DESC');
    const payrollRecords = result.rows.map(row => ({
      id: row.id,
      employeeName: row.employee_name,
      empId: row.emp_id,
      role: row.role,
      month: row.month,
      year: row.year,
      basicSalary: row.basic_salary,
      deductions: row.deductions,
      netSalary: row.net_salary,
      status: row.status,
      paymentDate: row.payment_date ? (() => {
        const date = new Date(row.payment_date);
        const YY = date.getFullYear() % 100;
        const DD = String(date.getDate()).padStart(2, '0');
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const Hr = String(date.getHours()).padStart(2, '0');
        const Min = String(date.getMinutes()).padStart(2, '0');
        return `${YY}-${DD}-${MM} ${Hr}-${Min}`;
      })() : null
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
      month,
      year,
      basicSalary,
      deductions,
      netSalary,
      status,
      paymentDate || null
    ];

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
      paymentDate: newRecord.payment_date ? (() => {
        const date = new Date(newRecord.payment_date);
        const YY = date.getFullYear() % 100;
        const DD = String(date.getDate()).padStart(2, '0');
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const Hr = String(date.getHours()).padStart(2, '0');
        const Min = String(date.getMinutes()).padStart(2, '0');
        return `${YY}-${DD}-${MM} ${Hr}-${Min}`;
      })() : null
    };

    res.status(201).json(payrollRecord);
  } catch (err) {
    console.error('Error adding payroll record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/payroll/:id - Delete a payroll record by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id as unknown as string, 10);
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

export default router;

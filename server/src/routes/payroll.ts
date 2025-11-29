import { Router } from 'express';
import { dbHelper } from '../db/dbHelper';

const router = Router();

// Helper function to format payment date
const formatPaymentDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    const YY = date.getFullYear() % 100;
    const DD = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const Hr = String(date.getHours()).padStart(2, '0');
    const Min = String(date.getMinutes()).padStart(2, '0');
    return `${YY}-${DD}-${MM} ${Hr}-${Min}`;
  } catch {
    return dateStr;
  }
};

// GET /api/payroll - Fetch all payroll records
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query('SELECT * FROM payroll_records WHERE deleted_at IS NULL ORDER BY id DESC');
    const payrollRecords = rows.map((row: any) => ({
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
      paymentDate: formatPaymentDate(row.payment_date)
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
    // Use dbHelper.insert to automatically set synced = 0 for new records
    const result = await dbHelper.insert('payroll_records', {
      employee_name: employeeName,
      emp_id: empId,
      role: role,
      month: month,
      year: year,
      basic_salary: basicSalary,
      deductions: deductions,
      net_salary: netSalary,
      status: status,
      payment_date: paymentDate || null
    });

    const newRecord = await dbHelper.getById('payroll_records', result.id);

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
      paymentDate: formatPaymentDate(newRecord.payment_date)
    };

    res.status(201).json(payrollRecord);
  } catch (err) {
    console.error('Error adding payroll record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/payroll/:id - Update a payroll record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
    return res.status(400).json({ error: 'Invalid payroll record id' });
  }

  const {
    basicSalary,
    deductions,
    netSalary,
    status,
    paymentDate
  } = req.body;

  try {
    const record = await dbHelper.getById('payroll_records', idNum);
    if (!record || record.deleted_at) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Use dbHelper.update which automatically marks records as synced = 0
    await dbHelper.update('payroll_records', idNum, {
      basic_salary: basicSalary,
      deductions: deductions,
      net_salary: netSalary,
      status: status,
      payment_date: paymentDate || null
    });

    const updatedRecord = await dbHelper.getById('payroll_records', idNum);
    const payrollRecord = {
      id: updatedRecord.id,
      employeeName: updatedRecord.employee_name,
      empId: updatedRecord.emp_id,
      role: updatedRecord.role,
      month: updatedRecord.month,
      year: updatedRecord.year,
      basicSalary: updatedRecord.basic_salary,
      deductions: updatedRecord.deductions,
      netSalary: updatedRecord.net_salary,
      status: updatedRecord.status,
      paymentDate: formatPaymentDate(updatedRecord.payment_date)
    };

    res.json(payrollRecord);
  } catch (err) {
    console.error('Error updating payroll record:', err);
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
    const record = await dbHelper.getById('payroll_records', idNum);
    if (!record || record.deleted_at) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Use soft delete which automatically marks as synced = 0 for sync
    await dbHelper.delete('payroll_records', idNum);

    res.json({ message: 'Payroll record deleted successfully' });
  } catch (err) {
    console.error('Error deleting payroll record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

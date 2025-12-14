import { Router } from 'express';
import { DBHelper } from '../db/dbHelper';

const router = Router();

// Helper function to format payment date in Asia/Manila timezone
const formatPaymentDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    // Format as YYYY-MM-DD HH:mm:ss in Asia/Manila timezone
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date);

    const y = parts.find(p => p.type === 'year')?.value;
    const mo = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    const h = parts.find(p => p.type === 'hour')?.value;
    const mi = parts.find(p => p.type === 'minute')?.value;
    const s = parts.find(p => p.type === 'second')?.value;

    if (y && mo && d && h && mi && s) {
      return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
    }
    return null;
  } catch {
    return dateStr;
  }
};

// GET /api/payroll - Fetch all payroll records
router.get('/', async (req, res) => {
  try {
    const rows = await DBHelper.query('SELECT * FROM payroll_records WHERE deleted_at IS NULL ORDER BY id DESC');
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
    // Use DBHelper.insert to automatically set synced = 0 for new records
    const result = await DBHelper.insert('payroll_records', {
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

    const lastId = typeof result.lastInsertRowid === 'bigint' ? Number(result.lastInsertRowid) : result.lastInsertRowid;
    
    // Immediately verify the record was created with synced = 0
    const verifyRecord = await DBHelper.queryOne(
      'SELECT id, emp_id, month, year, synced FROM payroll_records WHERE id = ?',
      [lastId]
    ) as any;
    
    if (verifyRecord) {
      console.log(`[PAYROLL DEBUG] New payroll record created - ID: ${verifyRecord.id}, emp_id: ${verifyRecord.emp_id}, month: ${verifyRecord.month}, year: ${verifyRecord.year}, synced: ${verifyRecord.synced} (type: ${typeof verifyRecord.synced})`);
      if (verifyRecord.synced !== 0 && verifyRecord.synced !== '0') {
        console.error(`[PAYROLL ERROR] New payroll record should have synced=0 but has synced=${verifyRecord.synced} (type: ${typeof verifyRecord.synced})`);
        // Force set it to 0
        await DBHelper.execute(
          'UPDATE payroll_records SET synced = 0 WHERE id = ?',
          [lastId]
        );
        console.log(`[PAYROLL FIX] Forced synced to 0 for record ${lastId}`);
      } else {
        console.log(`[PAYROLL SUCCESS] Record created with synced=0 - ready to be pushed to PostgreSQL`);
        
        // Try to push immediately (don't wait for scheduled sync)
        try {
          const { pushTableToPostgres } = require('../services/dbSyncService');
          console.log(`[PAYROLL PUSH] Attempting immediate push to PostgreSQL...`);
          await pushTableToPostgres('payroll_records', 'id', [
            'id', 'employee_name', 'emp_id', 'role', 'month', 'year', 
            'basic_salary', 'deductions', 'net_salary', 'status', 'payment_date',
            'created_at', 'updated_at', 'deleted_at'
          ]);
          console.log(`[PAYROLL PUSH] Immediate push completed`);
        } catch (pushError) {
          console.error(`[PAYROLL PUSH] Immediate push failed (will retry on next scheduled sync):`, pushError.message);
          // Don't fail the request - the scheduled sync will handle it
        }
      }
      
      // Double-check after a short delay to ensure it's still there
      setTimeout(async () => {
        const checkAgain = await DBHelper.queryOne(
          'SELECT id, emp_id, month, year, synced, deleted_at FROM payroll_records WHERE id = ?',
          [lastId]
        ) as any;
        if (checkAgain) {
          console.log(`[PAYROLL CHECK] Record still exists after creation - ID: ${checkAgain.id}, synced: ${checkAgain.synced}, deleted_at: ${checkAgain.deleted_at}`);
        } else {
          console.error(`[PAYROLL ERROR] Record ${lastId} disappeared after creation!`);
        }
      }, 2000);
    }
    
    const newRecord = await DBHelper.getById('payroll_records', lastId) as any;

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
router.put('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum)) {
      res.status(400).json({ error: 'Invalid payroll record id' });
      return;
  }

  const {
    basicSalary,
    deductions,
    netSalary,
    status,
    paymentDate
  } = req.body;

  try {
    const record = await DBHelper.getById('payroll_records', idNum) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'Payroll record not found' });
      return;
    }

    // Use DBHelper.update which automatically marks records as synced = 0
    await DBHelper.update('payroll_records', idNum, {
      basic_salary: basicSalary,
      deductions: deductions,
      net_salary: netSalary,
      status: status,
      payment_date: paymentDate || null
    });

    const updatedRecord = await DBHelper.getById('payroll_records', idNum) as any;
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
router.delete('/:id', async (req, res): Promise<void> => {
  const { id } = req.params;
  const idNum = parseInt(id as unknown as string, 10);
  if (Number.isNaN(idNum)) {
      res.status(400).json({ error: 'Invalid payroll record id' });
      return;
  }

  try {
    const record = await DBHelper.getById('payroll_records', idNum) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'Payroll record not found' });
      return;
    }

    // Use soft delete which automatically marks as synced = 0 for sync
    await DBHelper.softDelete('payroll_records', idNum);

    res.json({ message: 'Payroll record deleted successfully' });
  } catch (err) {
    console.error('Error deleting payroll record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

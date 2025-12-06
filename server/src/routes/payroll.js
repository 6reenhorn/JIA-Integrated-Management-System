// server/src/routes/payroll.js
const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db/dbHelper');

// Helper function to return payment date as ISO string (frontend will format it)
const formatPaymentDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    // Return ISO string - frontend will format it using date formatter
    return date.toISOString();
  } catch {
    return null;
  }
};

// Get all payroll records
router.get('/', async (req, res) => {
    try {
        const rows = await dbHelper.query('SELECT * FROM payroll_records WHERE deleted_at IS NULL ORDER BY id DESC');
        const payrollRecords = rows.map((row) => ({
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
        res.status(500).json({ 
            error: 'Failed to fetch payroll records',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Create new payroll record
router.post('/', async (req, res) => {
    try {
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
        
        // dbHelper.insert returns { id: result.lastID, ...data } for SQLite
        const recordId = result.id;
        if (!recordId) {
          throw new Error('Failed to get payroll record ID after insert');
        }
        
        // Immediately verify the record was created with synced = 0
        const verifyRecord = await dbHelper.queryOne(
            'SELECT id, emp_id, month, year, synced FROM payroll_records WHERE id = ?',
            [recordId]
        );
        
        if (verifyRecord) {
            console.log(`[PAYROLL DEBUG] New payroll record created - ID: ${verifyRecord.id}, emp_id: ${verifyRecord.emp_id}, month: ${verifyRecord.month}, year: ${verifyRecord.year}, synced: ${verifyRecord.synced} (type: ${typeof verifyRecord.synced})`);
            if (verifyRecord.synced !== 0 && verifyRecord.synced !== '0') {
                console.error(`[PAYROLL ERROR] New payroll record should have synced=0 but has synced=${verifyRecord.synced} (type: ${typeof verifyRecord.synced})`);
                // Force set it to 0
                await dbHelper.run(
                    'UPDATE payroll_records SET synced = 0 WHERE id = ?',
                    [recordId]
                );
                console.log(`[PAYROLL FIX] Forced synced to 0 for record ${recordId}`);
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
        }
        
        const newRecord = await dbHelper.getById('payroll_records', recordId);
        if (!newRecord) {
          throw new Error('Failed to retrieve newly created payroll record');
        }

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
        console.error('Error creating payroll record:', err);
        res.status(500).json({ 
            error: 'Failed to create payroll record',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get payroll record by ID
router.get('/:id', async (req, res) => {
    try {
        const record = await dbHelper.getById('payroll_records', req.params.id);
        
        if (!record || record.deleted_at) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        
        const payrollRecord = {
            id: record.id,
            employeeName: record.employee_name,
            empId: record.emp_id,
            role: record.role,
            month: record.month,
            year: record.year,
            basicSalary: record.basic_salary,
            deductions: record.deductions,
            netSalary: record.net_salary,
            status: record.status,
            paymentDate: formatPaymentDate(record.payment_date)
        };
        
        res.json(payrollRecord);
    } catch (err) {
        console.error('Error fetching payroll record:', err);
        res.status(500).json({ 
            error: 'Failed to fetch payroll record',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Update payroll record
router.put('/:id', async (req, res) => {
    try {
        const { 
            basicSalary,
            deductions,
            netSalary,
            status,
            paymentDate
        } = req.body;
        
        const idNum = parseInt(req.params.id, 10);
        if (isNaN(idNum)) {
            return res.status(400).json({ error: 'Invalid payroll record id' });
        }
        
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
        res.status(500).json({ 
            error: 'Failed to update payroll record',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Delete payroll record
router.delete('/:id', async (req, res) => {
    try {
        const record = await dbHelper.getById('payroll_records', req.params.id);
        if (!record || record.deleted_at) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        // Use soft delete which automatically marks as synced = 0 for sync
        await dbHelper.delete('payroll_records', req.params.id);
        res.json({ message: 'Payroll record deleted successfully' });
    } catch (err) {
        console.error('Error deleting payroll record:', err);
        res.status(500).json({ 
            error: 'Failed to delete payroll record',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;
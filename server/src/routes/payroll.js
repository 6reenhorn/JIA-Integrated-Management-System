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

        const query = `
            INSERT INTO payroll_records (employee_name, emp_id, role, month, year, basic_salary, deductions, net_salary, status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

        const result = await dbHelper.run(query, values);
        const recordId = result.lastID;
        if (!recordId) {
          throw new Error('Failed to get payroll record ID after insert');
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
            status
        } = req.body;
        
        const record = await dbHelper.getById('payroll_records', req.params.id);
        if (!record || record.deleted_at) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }
        
        await dbHelper.run(
            `UPDATE payroll_records 
             SET basic_salary = ?,
                 deductions = ?,
                 net_salary = ?,
                 status = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                basicSalary,
                deductions,
                netSalary,
                status,
                req.params.id
            ]
        );

        const updatedRecord = await dbHelper.getById('payroll_records', req.params.id);
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

        await dbHelper.hardDelete('payroll_records', req.params.id);
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
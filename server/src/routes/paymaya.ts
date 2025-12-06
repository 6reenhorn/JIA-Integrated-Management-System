import express, { Request, Response, Router } from 'express';
import { DBHelper } from '../db/dbHelper';

const router: Router = express.Router();

// Helper function to format date - handles Date objects, strings, and various formats
const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return '';
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) return '';
      const year = dateValue.getFullYear();
      const month = dateValue.getMonth() + 1;
      const day = dateValue.getDate();
      
      // Validate that we got valid numbers BEFORE creating the string
      if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return '';
      
      // Now safely create the formatted string
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    }
    
    // If it's a string
    const dateStr = String(dateValue).trim();
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === 'NaN' || dateStr.includes('NaN')) return '';
    
    // If it's already in YYYY-MM-DD format, return it (remove time part if present)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.split('T')[0].split(' ')[0]; // Remove time part if present
    }
    
    // Try parsing as a date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Validate that we got valid numbers BEFORE creating the string
    if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return '';
    
    // Now safely create the formatted string
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  } catch (error) {
    console.error('Error formatting date in paymaya route:', error, dateValue);
    return '';
  }
};

// GET /api/paymaya - Fetch all PayMaya records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await DBHelper.query('SELECT * FROM paymaya_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
    const records = rows.map((row: any) => ({
      id: row.id.toString(),
      amount: parseFloat(row.amount || 0),
      serviceCharge: parseFloat(row.service_charge || 0),
      transactionType: row.transaction_type,
      chargeMOP: row.charge_mop,
      referenceNumber: row.reference_number || '',
      date: formatDate(row.date)
    }));
    res.json(records);
  } catch (err) {
    console.error('Error fetching PayMaya records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/paymaya - Add a new PayMaya record
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    amount,
    serviceCharge,
    transactionType,
    chargeMOP,
    referenceNumber,
    date
  } = req.body;

  try {
    const query = `
      INSERT INTO paymaya_records (amount, service_charge, transaction_type, charge_mop, reference_number, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      amount,
      serviceCharge || 0,
      transactionType,
      chargeMOP,
      referenceNumber || null,
      date
    ];

    const result = await DBHelper.execute(query, values);
    const lastId = typeof result.lastInsertRowid === 'bigint' ? Number(result.lastInsertRowid) : result.lastInsertRowid;
    const newRecord = await DBHelper.getById('paymaya_records', lastId) as any;

    const record = {
      id: newRecord.id.toString(),
      amount: parseFloat(newRecord.amount || 0),
      serviceCharge: parseFloat(newRecord.service_charge || 0),
      transactionType: newRecord.transaction_type,
      chargeMOP: newRecord.charge_mop,
      referenceNumber: newRecord.reference_number || '',
      date: formatDate(newRecord.date)
    };

    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/paymaya/:id - Soft delete a PayMaya record
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await DBHelper.getById('paymaya_records', id) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'PayMaya record not found or already deleted' });
      return;
    }

    await DBHelper.execute('UPDATE paymaya_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'PayMaya record deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Error deleting PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/paymaya/:id - Update a PayMaya record
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    amount,
    serviceCharge,
    transactionType,
    chargeMOP,
    referenceNumber,
    date
  } = req.body;

  try {
    const record = await DBHelper.getById('paymaya_records', id) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'PayMaya record not found or already deleted' });
      return;
    }

    // Use DBHelper.update which automatically marks records as synced = 0
    await DBHelper.update('paymaya_records', id, {
      amount,
      service_charge: serviceCharge || 0,
      transaction_type: transactionType,
      charge_mop: chargeMOP,
      reference_number: referenceNumber || null,
      date
    });
    const updatedRecord = await DBHelper.getById('paymaya_records', id) as any;
    
    const result = {
      id: updatedRecord.id.toString(),
      amount: parseFloat(updatedRecord.amount || 0),
      serviceCharge: parseFloat(updatedRecord.service_charge || 0),
      transactionType: updatedRecord.transaction_type,
      chargeMOP: updatedRecord.charge_mop,
      referenceNumber: updatedRecord.reference_number || '',
      date: formatDate(updatedRecord.date)
    };

    res.json(result);
  } catch (err) {
    console.error('Error updating PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
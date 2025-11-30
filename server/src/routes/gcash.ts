import express, { Request, Response, Router } from 'express';
import { DBHelper } from '../db/dbHelper';

const router: Router = express.Router();

// Helper function to format date - handles Date objects, strings, and various formats
const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) {
    if (process.env.NODE_ENV === 'development') {
      console.log('GCash formatDate: received null/undefined/empty value');
    }
    return '';
  }
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        if (process.env.NODE_ENV === 'development') {
          console.log('GCash formatDate: Invalid Date object');
        }
        return '';
      }
      const year = dateValue.getFullYear();
      const month = dateValue.getMonth() + 1;
      const day = dateValue.getDate();
      
      // Validate that we got valid numbers BEFORE creating the string
      if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        if (process.env.NODE_ENV === 'development') {
          console.log('GCash formatDate: Invalid date values in Date object', { year, month, day });
        }
        return '';
      }
      
      // Now safely create the formatted string
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      return `${year}-${monthStr}-${dayStr}`;
    }
    
    // If it's a string
    const dateStr = String(dateValue).trim();
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === 'NaN' || dateStr.includes('NaN')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('GCash formatDate: Invalid string value (contains NaN)', dateStr);
      }
      return '';
    }
    
    // If it's already in YYYY-MM-DD format, return it (remove time part if present)
    // Match YYYY-MM-DD with optional time part (T or space)
    const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s|$)/);
    if (ymdMatch) {
      // Validate the date parts are reasonable
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      if (year >= 1970 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
      }
    }
    
    // Try parsing as a date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      if (process.env.NODE_ENV === 'development') {
        console.log('GCash formatDate: Failed to parse date string', dateStr);
      }
      return '';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Validate that we got valid numbers BEFORE creating the string
    if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      if (process.env.NODE_ENV === 'development') {
        console.log('GCash formatDate: Invalid date values after parsing', { year, month, day, original: dateStr });
      }
      return '';
    }
    
    // Now safely create the formatted string
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  } catch (error) {
    console.error('Error formatting date in gcash route:', error, dateValue);
    return '';
  }
};

// GET /api/gcash - Fetch all GCash records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await DBHelper.query('SELECT * FROM gcash_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
    const records = rows.map((row: any) => {
      const formattedDate = formatDate(row.date);
      // Debug: log the date value to see what format it's in
      if (process.env.NODE_ENV === 'development' && rows.indexOf(row) === 0) {
        console.log('Sample GCash date - Raw:', row.date, 'Type:', typeof row.date, 'Is Date:', row.date instanceof Date, 'Formatted:', formattedDate);
      }
      
      return {
        id: row.id.toString(),
        amount: parseFloat(row.amount || 0),
        serviceCharge: parseFloat(row.service_charge || 0),
        transactionType: row.transaction_type,
        chargeMOP: row.charge_mop,
        referenceNumber: row.reference_number || '',
        date: formattedDate || '' // Return empty string instead of undefined
      };
    });
    res.json(records);
  } catch (err) {
    console.error('Error fetching GCash records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gcash - Add a new GCash record
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
      INSERT INTO gcash_records (amount, service_charge, transaction_type, charge_mop, reference_number, date)
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
    const newRecord = await DBHelper.getById('gcash_records', lastId) as any;

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
    console.error('Error adding GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/gcash/:id - Soft delete a GCash record
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await DBHelper.getById('gcash_records', id) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    await DBHelper.execute('UPDATE gcash_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'GCash record deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Error deleting GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/gcash/:id - Update a GCash record
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
    const record = await DBHelper.getById('gcash_records', id) as any;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    // Use DBHelper.update which automatically marks records as synced = 0
    await DBHelper.update('gcash_records', id, {
      amount,
      service_charge: serviceCharge || 0,
      transaction_type: transactionType,
      charge_mop: chargeMOP,
      reference_number: referenceNumber || null,
      date
    });
    const updatedRecord = await DBHelper.getById('gcash_records', id) as any;
    
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
    console.error('Error updating GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
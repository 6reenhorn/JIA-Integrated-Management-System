import express, { Request, Response, Router } from 'express';
import { dbHelper } from '../db/dbHelper';

const router: Router = express.Router();

interface JuanPayRecord {
  id: string;
  date: string;
  beginnings: number[];
  ending: number;
  sales: number;
}

interface JuanPayDBRecord {
  id: number;
  date: Date;
  beginnings: number[];
  ending: string;
  sales: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface JuanPayRequestBody {
  date: string;
  beginnings?: number[];
  ending?: number;
  sales?: number;
}

// Helper function to format date
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
    console.error('Error formatting date in juanpay route:', error, dateValue);
    return '';
  }
};

// Helper function to transform DB record to API response
const transformRecord = (row: any): JuanPayRecord => {
  let beginnings: number[] = [];
  try {
    if (row.beginnings) {
      if (typeof row.beginnings === 'string') {
        beginnings = JSON.parse(row.beginnings);
      } else if (Array.isArray(row.beginnings)) {
        beginnings = row.beginnings;
      }
    }
  } catch {
    beginnings = [];
  }
  
  return {
    id: row.id.toString(),
    date: formatDate(row.date),
    beginnings: beginnings,
    ending: parseFloat(row.ending || 0),
    sales: parseFloat(row.sales || 0)
  };
};

// GET /api/juanpay - Fetch all JuanPay records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await dbHelper.query('SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
    const records = rows.map((row: any) => transformRecord(row));
    res.json(records);
  } catch (err) {
    console.error('Error fetching JuanPay records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/juanpay - Add a new JuanPay record
router.post('/', async (req: Request<{}, {}, JuanPayRequestBody>, res: Response): Promise<void> => {
  const { date, beginnings, ending, sales } = req.body;

  try {
    const query = `
      INSERT INTO juanpay_records (date, beginnings, ending, sales)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      date,
      JSON.stringify(beginnings || []),
      ending || 0,
      sales || 0
    ];

    const result = await dbHelper.run(query, values);
    const newRecord = await dbHelper.getById('juanpay_records', result.lastID);
    const record = transformRecord(newRecord);

    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/juanpay/:id - Update a JuanPay record
router.put('/:id', async (req: Request<{ id: string }, {}, JuanPayRequestBody>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { date, beginnings, ending, sales } = req.body;

  try {
    const record = await dbHelper.getById('juanpay_records', id);
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    // Use dbHelper.update which automatically marks records as synced = 0
    const beginningsJson = Array.isArray(beginnings) ? JSON.stringify(beginnings) : beginnings;
    await dbHelper.update('juanpay_records', id, {
      date,
      beginnings: beginningsJson,
      ending: ending || 0,
      sales: sales || 0
    });
    const updatedRecord = await dbHelper.getById('juanpay_records', id);
    const result = transformRecord(updatedRecord);

    res.json(result);
  } catch (err) {
    console.error('Error updating JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/juanpay/:id - Soft delete a JuanPay record
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const record = await dbHelper.getById('juanpay_records', id);
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    await dbHelper.run('UPDATE juanpay_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'JuanPay record deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Error deleting JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
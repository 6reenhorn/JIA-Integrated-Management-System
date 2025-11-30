import express, { Request, Response, Router } from 'express';
import { DBHelper } from '../db/dbHelper';

const router: Router = express.Router();

interface JuanPayRecord {
  id: string;
  date: string;
  beginnings: Array<{ amount: number }>;
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
  let beginnings: Array<{ amount: number }> = [];
  try {
    if (row.beginnings !== null && row.beginnings !== undefined) {
      let parsedBeginnings: number[] = [];
      
      // Handle different data types
      if (typeof row.beginnings === 'string') {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(row.beginnings);
          parsedBeginnings = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If not valid JSON, treat as single number string
          const num = parseFloat(row.beginnings);
          if (!isNaN(num)) {
            parsedBeginnings = [num];
          }
        }
      } else if (Array.isArray(row.beginnings)) {
        // Already an array
        parsedBeginnings = row.beginnings;
      } else if (typeof row.beginnings === 'number') {
        // Single number - convert to array with one element
        parsedBeginnings = [row.beginnings];
      }
      
      // Convert array of numbers to array of objects with amount property
      beginnings = parsedBeginnings.map((amount: number) => ({ amount }));
    }
  } catch (err) {
    console.error('Error transforming beginnings in juanpay record:', err, row);
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
    const rows = await DBHelper.query('SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC') as any[];
    const records = rows.map((row: any) => transformRecord(row));
    console.log('JuanPay GET - Raw rows count:', rows.length);
    console.log('JuanPay GET - First raw row:', rows[0]);
    console.log('JuanPay GET - Transformed records count:', records.length);
    console.log('JuanPay GET - First transformed record:', records[0]);
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
    // Convert beginnings array to JSON string for storage
    // If beginnings is an array of objects with amount property, extract just the amounts
    let beginningsArray: number[] = [];
    if (Array.isArray(beginnings)) {
      beginningsArray = beginnings.map((b: any) => {
        if (typeof b === 'object' && b !== null && 'amount' in b) {
          return b.amount;
        }
        return typeof b === 'number' ? b : 0;
      });
    } else if (typeof beginnings === 'number') {
      beginningsArray = [beginnings];
    }

    // Use DBHelper.insert to automatically set synced = 0 for new records
    const result = await DBHelper.insert('juanpay_records', {
      date,
      beginnings: JSON.stringify(beginningsArray),
      ending: ending || 0,
      sales: sales || 0
    });

    const lastId = typeof result.lastInsertRowid === 'bigint' ? Number(result.lastInsertRowid) : result.lastInsertRowid;
    const newRecord = await DBHelper.getById('juanpay_records', lastId) as JuanPayDBRecord | undefined;
    
    if (!newRecord) {
      res.status(500).json({ error: 'Failed to retrieve created record' });
      return;
    }

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
    const record = await DBHelper.getById('juanpay_records', id) as JuanPayDBRecord | undefined;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    // Convert beginnings array to JSON string for storage
    // If beginnings is an array of objects with amount property, extract just the amounts
    let beginningsArray: number[] = [];
    if (Array.isArray(beginnings)) {
      beginningsArray = beginnings.map((b: any) => {
        if (typeof b === 'object' && b !== null && 'amount' in b) {
          return b.amount;
        }
        return typeof b === 'number' ? b : 0;
      });
    } else if (typeof beginnings === 'number') {
      beginningsArray = [beginnings];
    }

    // Use DBHelper.update which automatically marks records as synced = 0
    await DBHelper.update('juanpay_records', id, {
      date,
      beginnings: JSON.stringify(beginningsArray),
      ending: ending || 0,
      sales: sales || 0
    });
    const updatedRecord = await DBHelper.getById('juanpay_records', id) as JuanPayDBRecord | undefined;
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
    const record = await DBHelper.getById('juanpay_records', id) as JuanPayDBRecord | undefined;
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    // Use DBHelper.softDelete which automatically marks records as synced = 0
    await DBHelper.softDelete('juanpay_records', id);

    res.json({ message: 'JuanPay record deleted successfully', id: parseInt(id) });
  } catch (err) {
    console.error('Error deleting JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
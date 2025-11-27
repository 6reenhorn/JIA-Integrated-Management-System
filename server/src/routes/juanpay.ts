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
const formatDate = (dateStr: string | Date): string => {
  try {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return typeof dateStr === 'string' ? dateStr : '';
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

    const query = `
      UPDATE juanpay_records
      SET date = ?, beginnings = ?, ending = ?, sales = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      date,
      JSON.stringify(beginnings || []),
      ending || 0,
      sales || 0,
      id
    ];

    await dbHelper.run(query, values);
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
import express, { Request, Response, Router } from 'express';
import pool from '../db/postgres';

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
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to transform DB record to API response
const transformRecord = (row: JuanPayDBRecord): JuanPayRecord => ({
  id: row.id.toString(),
  date: formatDate(row.date),
  beginnings: row.beginnings || [],
  ending: parseFloat(row.ending),
  sales: parseFloat(row.sales)
});

// GET /api/juanpay - Fetch all JuanPay records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<JuanPayDBRecord>(
      'SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC'
    );
    const records = result.rows.map(transformRecord);
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
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      date,
      JSON.stringify(beginnings || []),
      ending || 0,
      sales || 0
    ];

    const result = await pool.query<JuanPayDBRecord>(query, values);
    const newRecord = result.rows[0];
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
    const query = `
      UPDATE juanpay_records
      SET date = $1, beginnings = $2, ending = $3, sales = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING *
    `;
    const values = [
      date,
      JSON.stringify(beginnings || []),
      ending || 0,
      sales || 0,
      id
    ];

    const result = await pool.query<JuanPayDBRecord>(query, values);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    const updatedRecord = result.rows[0];
    const record = transformRecord(updatedRecord);

    res.json(record);
  } catch (err) {
    console.error('Error updating JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/juanpay/:id - Soft delete a JuanPay record
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE juanpay_records
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query<JuanPayDBRecord>(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    res.json({ message: 'JuanPay record deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import express, { Request, Response, Router } from 'express';
import pool from '../db/postgres';

const router: Router = express.Router();

// GET /api/paymaya - Fetch all PayMaya records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM paymaya_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
    const records = result.rows.map(row => {
      const d = row.date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        id: row.id.toString(),
        amount: parseFloat(row.amount),
        serviceCharge: parseFloat(row.service_charge),
        transactionType: row.transaction_type,
        chargeMOP: row.charge_mop,
        referenceNumber: row.reference_number || '',
        date: `${year}-${month}-${day}`
      };
    });
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
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      amount,
      serviceCharge || 0,
      transactionType,
      chargeMOP,
      referenceNumber || null,
      date
    ];

    const result = await pool.query(query, values);
    const newRecord = result.rows[0];

    const d = newRecord.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const record = {
      id: newRecord.id.toString(),
      amount: parseFloat(newRecord.amount),
      serviceCharge: parseFloat(newRecord.service_charge),
      transactionType: newRecord.transaction_type,
      chargeMOP: newRecord.charge_mop,
      referenceNumber: newRecord.reference_number || '',
      date: `${year}-${month}-${day}`
    };

    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soft delete a Paymaya record by ID
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE paymaya_records
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'PayMaya record not found or already deleted' });
      return;
    }

    res.json({ message: 'PayMaya record deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
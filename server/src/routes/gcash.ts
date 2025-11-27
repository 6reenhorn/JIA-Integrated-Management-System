import express, { Request, Response, Router } from 'express';
import { dbHelper } from '../db/dbHelper';

const router: Router = express.Router();

// Helper function to format date
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
};

// GET /api/gcash - Fetch all GCash records
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await dbHelper.query('SELECT * FROM gcash_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
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

    const result = await dbHelper.run(query, values);
    const newRecord = await dbHelper.getById('gcash_records', result.lastID);

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
    const record = await dbHelper.getById('gcash_records', id);
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    await dbHelper.run('UPDATE gcash_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

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
    const record = await dbHelper.getById('gcash_records', id);
    if (!record || record.deleted_at) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    const query = `
      UPDATE gcash_records
      SET amount = ?, service_charge = ?, transaction_type = ?, charge_mop = ?, reference_number = ?, date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;
    const values = [
      amount,
      serviceCharge || 0,
      transactionType,
      chargeMOP,
      referenceNumber || null,
      date,
      id
    ];

    await dbHelper.run(query, values);
    const updatedRecord = await dbHelper.getById('gcash_records', id);
    
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
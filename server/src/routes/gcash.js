'use strict';
const express = require('express');
const { dbHelper } = require('../db/dbHelper');
const { getPHLocalTimeISO, getPHLocalDate } = require('../utils/timeUtils');

const router = express.Router();

// Helper to format date
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to map DB row to response format
const mapGCashRecord = (row) => ({
  id: row.id.toString(),
  amount: parseFloat(row.amount),
  serviceCharge: parseFloat(row.service_charge),
  transactionType: row.transaction_type,
  chargeMOP: row.charge_mop,
  referenceNumber: row.reference_number || '',
  date: formatDate(row.date)
});

// GET /api/gcash - Fetch all GCash records
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query(`
      SELECT * FROM gcash_records
      WHERE deleted_at IS NULL
      ORDER BY date DESC, id DESC
    `);

    const records = rows.map(mapGCashRecord);
    res.json(records);
  } catch (err) {
    console.error('Error fetching GCash records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gcash - Add a new GCash record
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      serviceCharge,
      transactionType,
      chargeMOP,
      referenceNumber,
      date
    } = req.body;

    const result = await dbHelper.insert('gcash_records', {
      amount,
      service_charge: serviceCharge,
      transaction_type: transactionType,
      charge_mop: chargeMOP,
      reference_number: referenceNumber || null,
      date: date || getPHLocalDate()
    });

    // For SQLite, insert returns { id: ..., ...data }
    // For PostgreSQL, insert returns the full row
    const recordId = result.id || result.lastID || result.insertId;
    if (!recordId) {
      throw new Error('Failed to get GCash record ID after insert');
    }

    const newRecordData = await dbHelper.getById('gcash_records', recordId);
    if (!newRecordData) {
      throw new Error('Failed to retrieve newly created GCash record');
    }

    res.status(201).json(mapGCashRecord(newRecordData));
  } catch (err) {
    console.error('Error adding GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/gcash/:id - Update a GCash record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      serviceCharge,
      transactionType,
      chargeMOP,
      referenceNumber,
      date
    } = req.body;

    await dbHelper.update('gcash_records', id, {
      amount,
      service_charge: serviceCharge,
      transaction_type: transactionType,
      charge_mop: chargeMOP,
      reference_number: referenceNumber || null,
      date: date
    });

    const updated = await dbHelper.queryOne('SELECT * FROM gcash_records WHERE id = ?', [id]);
    
    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(mapGCashRecord(updated));
  } catch (err) {
    console.error('Error updating GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/gcash/:id - Soft delete a GCash record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await dbHelper.update('gcash_records', id, {
      deleted_at: getPHLocalTimeISO()
    });

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
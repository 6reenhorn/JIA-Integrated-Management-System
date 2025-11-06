"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/gcash - Fetch all GCash records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gcash_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
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
    console.error('Error fetching GCash records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gcash - Add a new GCash record
router.post('/', async (req, res) => {
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
    console.error('Error adding GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/gcash/:id - Soft delete a GCash record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE gcash_records
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    res.json({ message: 'GCash record deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/gcash/:id - Update a GCash record
router.put('/:id', async (req, res) => {
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
    const query = `
      UPDATE gcash_records
      SET amount = $1, service_charge = $2, transaction_type = $3, charge_mop = $4, reference_number = $5, date = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND deleted_at IS NULL
      RETURNING *
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

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'GCash record not found or already deleted' });
      return;
    }

    const updatedRecord = result.rows[0];
    const d = updatedRecord.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const record = {
      id: updatedRecord.id.toString(),
      amount: parseFloat(updatedRecord.amount),
      serviceCharge: parseFloat(updatedRecord.service_charge),
      transactionType: updatedRecord.transaction_type,
      chargeMOP: updatedRecord.charge_mop,
      referenceNumber: updatedRecord.reference_number || '',
      date: `${year}-${month}-${day}`
    };

    res.json(record);
  } catch (err) {
    console.error('Error updating GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
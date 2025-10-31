"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/gcash - Fetch all GCash records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gcash_records ORDER BY date DESC, id DESC');
    const records = result.rows.map(row => ({
      id: row.id.toString(),
      amount: parseFloat(row.amount),
      serviceCharge: parseFloat(row.service_charge),
      transactionType: row.transaction_type,
      chargeMOP: row.charge_mop,
      referenceNumber: row.reference_number || '',
      date: row.date.toISOString().split('T')[0]
    }));
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

    const record = {
      id: newRecord.id.toString(),
      amount: parseFloat(newRecord.amount),
      serviceCharge: parseFloat(newRecord.service_charge),
      transactionType: newRecord.transaction_type,
      chargeMOP: newRecord.charge_mop,
      referenceNumber: newRecord.reference_number || '',
      date: newRecord.date.toISOString().split('T')[0]
    };

    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding GCash record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
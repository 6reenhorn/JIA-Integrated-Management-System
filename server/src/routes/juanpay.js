"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/juanpay - Fetch all JuanPay records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC'
    );
    const records = result.rows.map(row => {
      const d = row.date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        id: row.id.toString(),
        date: `${year}-${month}-${day}`,
        beginnings: row.beginnings || [],
        ending: parseFloat(row.ending),
        sales: parseFloat(row.sales)
      };
    });
    res.json(records);
  } catch (err) {
    console.error('Error fetching JuanPay records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/juanpay - Add a new JuanPay record
router.post('/', async (req, res) => {
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

    const result = await pool.query(query, values);
    const newRecord = result.rows[0];

    const d = newRecord.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const record = {
      id: newRecord.id.toString(),
      date: `${year}-${month}-${day}`,
      beginnings: newRecord.beginnings || [],
      ending: parseFloat(newRecord.ending),
      sales: parseFloat(newRecord.sales)
    };

    res.status(201).json(record);
  } catch (err) {
    console.error('Error adding JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/juanpay/:id - Update a JuanPay record
router.put('/:id', async (req, res) => {
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

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'JuanPay record not found or already deleted' });
      return;
    }

    const updatedRecord = result.rows[0];
    const d = updatedRecord.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const record = {
      id: updatedRecord.id.toString(),
      date: `${year}-${month}-${day}`,
      beginnings: updatedRecord.beginnings || [],
      ending: parseFloat(updatedRecord.ending),
      sales: parseFloat(updatedRecord.sales)
    };

    res.json(record);
  } catch (err) {
    console.error('Error updating JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/juanpay/:id - Soft delete a JuanPay record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE juanpay_records
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
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

module.exports = router;
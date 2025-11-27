'use strict';
const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db/dbHelper');

// Helper to format date in PH timezone
const formatDatePH = (date) => {
  const d = new Date(date);
  const phDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = phDate.getFullYear();
  const month = String(phDate.getMonth() + 1).padStart(2, '0');
  const day = String(phDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to safely parse JSON
const safeJsonParse = (str, defaultValue = []) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

// GET all JuanPay records
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query(
      'SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC'
    );

    const records = rows.map(row => {
      // Safely parse the 'beginnings' field
      const beginnings = safeJsonParse(row.beginnings, []);
      
      return {
        id: row.id.toString(),
        date: formatDatePH(row.date),
        beginnings,
        ending: parseFloat(row.ending) || 0,
        sales: parseFloat(row.sales) || 0
      };
    });

    res.json(records);
  } catch (err) {
    console.error('Error fetching JuanPay records:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST add a new JuanPay record
router.post('/', async (req, res) => {
  try {
    const { date, beginnings, ending, sales } = req.body;

    const result = await dbHelper.insert('juanpay_records', {
      date: date || new Date().toISOString(),
      beginnings: JSON.stringify(beginnings || []),
      ending: ending || 0,
      sales: sales || 0
    });

    // For SQLite, insert returns { id: ..., ...data }
    // For PostgreSQL, insert returns the full row
    const recordId = result.id || result.lastID || result.insertId;
    if (!recordId) {
      throw new Error('Failed to get JuanPay record ID after insert');
    }

    const newRecordData = await dbHelper.getById('juanpay_records', recordId);
    if (!newRecordData) {
      throw new Error('Failed to retrieve newly created JuanPay record');
    }

    const beginningsArray = safeJsonParse(newRecordData.beginnings, []);

    const newRecord = {
      id: newRecordData.id.toString(),
      date: formatDatePH(newRecordData.date),
      beginnings: Array.isArray(beginningsArray) ? beginningsArray : [],
      ending: parseFloat(newRecordData.ending || 0),
      sales: parseFloat(newRecordData.sales || 0)
    };

    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error adding JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ============================================
// PUT update a JuanPay record
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, beginnings, ending, sales } = req.body;

    await dbHelper.update('juanpay_records', id, {
      date: date || new Date().toISOString(),
      beginnings: JSON.stringify(beginnings || []),
      ending: ending || 0,
      sales: sales || 0,
      updated_at: new Date().toISOString()
    });

    const updated = await dbHelper.queryOne('SELECT * FROM juanpay_records WHERE id = ?', [id]);
    
    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const updatedRecord = {
      id: updated.id.toString(),
      date: formatDatePH(updated.date),
      beginnings: updated.beginnings ? JSON.parse(updated.beginnings) : [],
      ending: parseFloat(updated.ending || 0),
      sales: parseFloat(updated.sales || 0)
    };

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DELETE a JuanPay record (soft delete)
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await dbHelper.update('juanpay_records', id, {
      deleted_at: new Date().toISOString()
    });

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting JuanPay record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
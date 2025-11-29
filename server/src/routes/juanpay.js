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
const safeJsonParse = (value, defaultValue = []) => {
  try {
    // If it's already an array, return it
    if (Array.isArray(value)) {
      return value;
    }
    // If it's null or undefined, return default
    if (value === null || value === undefined) {
      return defaultValue;
    }
    // If it's already an object (but not an array), it might be a parsed JSON object
    // Check if it looks like it should be an array
    if (typeof value === 'object') {
      // If it has a length property and numeric keys, it might be an array-like object
      if (value.length !== undefined && typeof value.length === 'number') {
        try {
          return Array.from(value);
        } catch {
          // If conversion fails, try to stringify and parse
          return JSON.parse(JSON.stringify(value));
        }
      }
      // If it's a plain object, try to stringify and parse to ensure it's valid
      // This handles cases where SQLite returns objects differently
      const stringified = JSON.stringify(value);
      if (stringified === '{}') {
        return defaultValue;
      }
      return JSON.parse(stringified);
    }
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // If it's an empty string, return default
      if (value.trim() === '' || value.trim() === 'null') {
        return defaultValue;
      }
      // If the string is "[object Object]", it means an object was stringified incorrectly
      if (value === '[object Object]') {
        console.warn('Received "[object Object]" string, returning default');
        return defaultValue;
      }
      return JSON.parse(value);
    }
    // For any other type, return default
    return defaultValue;
  } catch (e) {
    // Don't log the error if it's just because value is already parsed
    if (e.message && !e.message.includes('Unexpected token')) {
      console.error('Error parsing JSON:', e.message, 'Value type:', typeof value);
    }
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
      // The safeJsonParse function now handles all cases
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
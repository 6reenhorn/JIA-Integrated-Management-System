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

// Helper function to parse pipe-separated beginnings
const parseBeginnings = (value) => {
  try {
    // If it's null or undefined, return empty string
    if (value === null || value === undefined) {
      return '';
    }
    // If it's already a string, return it
    if (typeof value === 'string') {
      // Handle legacy JSON format - convert to pipe-separated
      if (value.trim().startsWith('[')) {
        try {
          const arr = JSON.parse(value);
          if (Array.isArray(arr)) {
            return arr.map(item => {
              if (typeof item === 'object' && item.amount) return item.amount;
              return item;
            }).join('|');
          }
        } catch {
          return '';
        }
      }
      return value;
    }
    // If it's an array (shouldn't happen but handle it)
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'object' && item.amount) return item.amount;
        return item;
      }).join('|');
    }
    return '';
  } catch (e) {
    console.error('Error parsing beginnings:', e.message);
    return '';
  }
};

// GET all JuanPay records
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query(
      'SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC'
    );

    const records = rows.map(row => {
      const beginnings = parseBeginnings(row.beginnings);
      
      return {
        id: row.id.toString(),
        date: formatDatePH(row.date),
        beginnings: beginnings,
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
    let beginningsStr = '';
    if (Array.isArray(beginnings)) {
      beginningsStr = beginnings
        .map(b => typeof b === 'object' && b.amount ? b.amount : b)
        .filter(val => val !== null && val !== undefined && val !== '')
        .join('|');
    } else if (typeof beginnings === 'string') {
      beginningsStr = beginnings;
    }

    const result = await dbHelper.insert('juanpay_records', {
      date: date || new Date().toISOString(),
      beginnings: beginningsStr,
      ending: ending || 0,
      sales: sales || 0
    });

    const recordId = result.id || result.lastID || result.insertId;
    if (!recordId) {
      throw new Error('Failed to get JuanPay record ID after insert');
    }

    const newRecordData = await dbHelper.getById('juanpay_records', recordId);
    if (!newRecordData) {
      throw new Error('Failed to retrieve newly created JuanPay record');
    }

    const newRecord = {
      id: newRecordData.id.toString(),
      date: formatDatePH(newRecordData.date),
      beginnings: parseBeginnings(newRecordData.beginnings),
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

    // Convert array to pipe-separated string or use string directly
    let beginningsStr = '';
    if (Array.isArray(beginnings)) {
      beginningsStr = beginnings
        .map(b => typeof b === 'object' && b.amount ? b.amount : b)
        .filter(val => val !== null && val !== undefined && val !== '')
        .join('|');
    } else if (typeof beginnings === 'string') {
      beginningsStr = beginnings;
    }

    await dbHelper.update('juanpay_records', id, {
      date: date || new Date().toISOString(),
      beginnings: beginningsStr,
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
      beginnings: parseBeginnings(updated.beginnings),
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
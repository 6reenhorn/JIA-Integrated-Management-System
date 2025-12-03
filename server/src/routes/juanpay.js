'use strict';
const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db/dbHelper');
const { getPHLocalTimeISO, getPHLocalDate } = require('../utils/timeUtils');

// Helper to format date in PH timezone
const formatDatePH = (date) => {
  const d = new Date(date);
  const phDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = phDate.getFullYear();
  const month = String(phDate.getMonth() + 1).padStart(2, '0');
  const day = String(phDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to safely parse JSON and ensure it returns an array
const safeJsonParse = (value, defaultValue = []) => {
  try {
    // If it's already an array, ensure it's in the correct format
    if (Array.isArray(value)) {
      // Ensure each element has the correct structure (object with amount property)
      return value.map(item => {
        if (typeof item === 'object' && item !== null && 'amount' in item) {
          return item;
        }
        // If it's a number, convert to object with amount property
        if (typeof item === 'number') {
          return { amount: item };
        }
        // If it's a string that looks like a number, parse it
        if (typeof item === 'string' && !isNaN(parseFloat(item))) {
          return { amount: parseFloat(item) };
        }
        // Default to 0 if we can't parse
        return { amount: 0 };
      });
    }
    // If it's null or undefined, return default
    if (value === null || value === undefined) {
      return defaultValue;
    }
    // If it's already an object (but not an array), convert it to array format
    if (typeof value === 'object') {
      // If it has a length property and numeric keys, it might be an array-like object
      if (value.length !== undefined && typeof value.length === 'number') {
        try {
          const arr = Array.from(value);
          return arr.map(item => {
            if (typeof item === 'object' && item !== null && 'amount' in item) {
              return item;
            }
            if (typeof item === 'number') {
              return { amount: item };
            }
            return { amount: 0 };
          });
        } catch {
          // If conversion fails, try to stringify and parse
          const stringified = JSON.stringify(value);
          const parsed = JSON.parse(stringified);
          if (Array.isArray(parsed)) {
            return parsed.map(item => {
              if (typeof item === 'object' && item !== null && 'amount' in item) {
                return item;
              }
              if (typeof item === 'number') {
                return { amount: item };
              }
              return { amount: 0 };
            });
          }
        }
      }
      // If it's a plain object (not array-like), check if it has an amount property
      // This might be a single beginning object that was stored incorrectly
      if ('amount' in value) {
        return [{ amount: typeof value.amount === 'number' ? value.amount : parseFloat(value.amount) || 0 }];
      }
      // If it's an empty object, return default
      const stringified = JSON.stringify(value);
      if (stringified === '{}') {
        return defaultValue;
      }
      // Try to parse it - might be a JSON object that needs conversion
      try {
        const parsed = JSON.parse(stringified);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'object' && item !== null && 'amount' in item) {
              return item;
            }
            if (typeof item === 'number') {
              return { amount: item };
            }
            return { amount: 0 };
          });
        }
        // If parsed is an object with amount, convert to array
        if (typeof parsed === 'object' && parsed !== null && 'amount' in parsed) {
          return [{ amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0 }];
        }
      } catch {
        // If parsing fails, return default
        return defaultValue;
      }
      // If we can't convert it, return default
      return defaultValue;
    }
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // If it's an empty string, return default
      if (value.trim() === '' || value.trim() === 'null') {
        return defaultValue;
      }
      // If the string is "[object Object]", it means an object was stringified incorrectly
      if (value === '[object Object]' || value.includes('[object Object]')) {
        console.warn('Received "[object Object]" string, returning default');
        return defaultValue;
      }
      const parsed = JSON.parse(value);
      // Ensure parsed result is an array
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'object' && item !== null && 'amount' in item) {
            return item;
          }
          if (typeof item === 'number') {
            return { amount: item };
          }
          return { amount: 0 };
        });
      }
      // If parsed is an object with amount, convert to array
      if (typeof parsed === 'object' && parsed !== null && 'amount' in parsed) {
        return [{ amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0 }];
      }
      // If parsed is a number, convert to array
      if (typeof parsed === 'number') {
        return [{ amount: parsed }];
      }
      return defaultValue;
    }
    // If it's a number, convert to array format
    if (typeof value === 'number') {
      return [{ amount: value }];
    }
    // For any other type, return default (empty array)
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON in safeJsonParse:', e.message, 'Value type:', typeof value, 'Value:', value);
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
      const beginnings = safeJsonParse(row.beginnings, []);
      
      return {
        id: row.id.toString(),
        date: formatDatePH(row.date),
        beginnings: Array.isArray(beginnings) ? beginnings : [],
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

    // Ensure beginnings is always an array and extract amounts
    let beginningsArray = [];
    if (Array.isArray(beginnings)) {
      beginningsArray = beginnings.map(b => {
        if (typeof b === 'object' && b !== null && 'amount' in b) {
          return typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0;
        }
        return typeof b === 'number' ? b : parseFloat(b) || 0;
      });
    } else if (typeof beginnings === 'number') {
      beginningsArray = [beginnings];
    } else if (beginnings && typeof beginnings === 'object' && !Array.isArray(beginnings)) {
      // Handle single object case
      if ('amount' in beginnings) {
        beginningsArray = [typeof beginnings.amount === 'number' ? beginnings.amount : parseFloat(beginnings.amount) || 0];
      }
    } else if (typeof beginnings === 'string') {
      // Fallback: Handle pipe-separated string format (for backward compatibility)
      if (beginnings.includes('|')) {
        beginningsArray = beginnings.split('|')
          .map(val => parseFloat(val.trim()))
          .filter(val => !isNaN(val));
      } else {
        // Single number string
        const num = parseFloat(beginnings);
        if (!isNaN(num)) {
          beginningsArray = [num];
        }
      }
    }

    const result = await dbHelper.insert('juanpay_records', {
      date: date || getPHLocalDate(),
      beginnings: JSON.stringify(beginningsArray),
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

    const parsedBeginnings = safeJsonParse(newRecordData.beginnings, []);

    const newRecord = {
      id: newRecordData.id.toString(),
      date: formatDatePH(newRecordData.date),
      beginnings: Array.isArray(parsedBeginnings) ? parsedBeginnings : [],
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

    // Ensure beginnings is always an array and extract amounts
    let beginningsArray = [];
    if (Array.isArray(beginnings)) {
      beginningsArray = beginnings.map(b => {
        if (typeof b === 'object' && b !== null && 'amount' in b) {
          return typeof b.amount === 'number' ? b.amount : parseFloat(b.amount) || 0;
        }
        return typeof b === 'number' ? b : parseFloat(b) || 0;
      });
    } else if (typeof beginnings === 'number') {
      beginningsArray = [beginnings];
    } else if (beginnings && typeof beginnings === 'object' && !Array.isArray(beginnings)) {
      // Handle single object case
      if ('amount' in beginnings) {
        beginningsArray = [typeof beginnings.amount === 'number' ? beginnings.amount : parseFloat(beginnings.amount) || 0];
      }
    } else if (typeof beginnings === 'string') {
      // Fallback: Handle pipe-separated string format (for backward compatibility)
      if (beginnings.includes('|')) {
        beginningsArray = beginnings.split('|')
          .map(val => parseFloat(val.trim()))
          .filter(val => !isNaN(val));
      } else {
        // Single number string
        const num = parseFloat(beginnings);
        if (!isNaN(num)) {
          beginningsArray = [num];
        }
      }
    }

    await dbHelper.update('juanpay_records', id, {
      date: date || getPHLocalDate(),
      beginnings: JSON.stringify(beginningsArray),
      ending: ending || 0,
      sales: sales || 0,
      updated_at: getPHLocalTimeISO()
    });

    const updated = await dbHelper.queryOne('SELECT * FROM juanpay_records WHERE id = ?', [id]);
    
    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const parsedBeginnings = safeJsonParse(updated.beginnings, []);
    
    const updatedRecord = {
      id: updated.id.toString(),
      date: formatDatePH(updated.date),
      beginnings: Array.isArray(parsedBeginnings) ? parsedBeginnings : [],
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
      deleted_at: getPHLocalTimeISO()
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
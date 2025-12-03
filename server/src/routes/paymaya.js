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

// ============================================
// GET all PayMaya records
// ============================================
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query(
      'SELECT * FROM paymaya_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC'
    );

    const records = rows.map(row => ({
      id: row.id.toString(),
      amount: parseFloat(row.amount),
      serviceCharge: parseFloat(row.service_charge),
      transactionType: row.transaction_type,
      chargeMOP: row.charge_mop,
      referenceNumber: row.reference_number || '',
      date: formatDatePH(row.date)
    }));

    res.json(records);
  } catch (err) {
    console.error('Error fetching PayMaya records:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POST add a new PayMaya record
// ============================================
router.post('/', async (req, res) => {
  try {
    const { amount, serviceCharge, transactionType, chargeMOP, referenceNumber, date } = req.body;

    const result = await dbHelper.insert('paymaya_records', {
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
      throw new Error('Failed to get PayMaya record ID after insert');
    }

    const newRecordData = await dbHelper.getById('paymaya_records', recordId);
    if (!newRecordData) {
      throw new Error('Failed to retrieve newly created PayMaya record');
    }

    const newRecord = {
      id: newRecordData.id.toString(),
      amount: parseFloat(newRecordData.amount),
      serviceCharge: parseFloat(newRecordData.service_charge),
      transactionType: newRecordData.transaction_type,
      chargeMOP: newRecordData.charge_mop,
      referenceNumber: newRecordData.reference_number || '',
      date: formatDatePH(newRecordData.date)
    };

    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error adding PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// PUT update a PayMaya record
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, serviceCharge, transactionType, chargeMOP, referenceNumber, date } = req.body;

    await dbHelper.update('paymaya_records', id, {
      amount,
      service_charge: serviceCharge,
      transaction_type: transactionType,
      charge_mop: chargeMOP,
      reference_number: referenceNumber || null,
      date,
      updated_at: getPHLocalTimeISO()
    });

    const updated = await dbHelper.queryOne('SELECT * FROM paymaya_records WHERE id = ?', [id]);
    
    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const updatedRecord = {
      id: updated.id.toString(),
      amount: parseFloat(updated.amount),
      serviceCharge: parseFloat(updated.service_charge),
      transactionType: updated.transaction_type,
      chargeMOP: updated.charge_mop,
      referenceNumber: updated.reference_number || '',
      date: formatDatePH(updated.date)
    };

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DELETE a PayMaya record (soft delete)
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const info = await dbHelper.update('paymaya_records', id, {
      deleted_at: getPHLocalTimeISO()
    });

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting PayMaya record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// GET /api/inventory - Fetch all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_items ORDER BY id');
    const inventoryItems = result.rows.map(row => ({
      id: row.id,
      productName: row.product_name,
      category: row.category,
      stock: row.stock,
      status: row.status,
      productPrice: parseFloat(row.product_price),
      totalAmount: parseFloat(row.total_amount),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json(inventoryItems);
  } catch (err) {
    console.error('Error fetching inventory items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/inventory - Add a new inventory item
router.post('/', async (req, res) => {
  const {
    productName,
    category,
    stock,
    productPrice
  } = req.body;

  try {
    // Calculate total amount and determine status
    const totalAmount = stock * productPrice;
    const status = stock === 0 ? 'Out Of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

    const query = `
      INSERT INTO inventory_items (product_name, category, stock, status, product_price, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      productName,
      category,
      stock,
      status,
      productPrice,
      totalAmount
    ];

    const result = await pool.query(query, values);
    const newItem = result.rows[0];

    const inventoryItem = {
      id: newItem.id,
      productName: newItem.product_name,
      category: newItem.category,
      stock: newItem.stock,
      status: newItem.status,
      productPrice: parseFloat(newItem.product_price),
      totalAmount: parseFloat(newItem.total_amount),
      createdAt: newItem.created_at,
      updatedAt: newItem.updated_at
    };

    res.status(201).json(inventoryItem);
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    productName,
    category,
    stock,
    productPrice
  } = req.body;

  try {
    // Recalculate total amount and status
    const totalAmount = stock * productPrice;
    const status = stock === 0 ? 'Out Of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

    const query = `
      UPDATE inventory_items
      SET product_name = $1, category = $2, stock = $3, status = $4, product_price = $5, total_amount = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      productName,
      category,
      stock,
      status,
      productPrice,
      totalAmount,
      id
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    const updatedItem = result.rows[0];
    const inventoryItem = {
      id: updatedItem.id,
      productName: updatedItem.product_name,
      category: updatedItem.category,
      stock: updatedItem.stock,
      status: updatedItem.status,
      productPrice: parseFloat(updatedItem.product_price),
      totalAmount: parseFloat(updatedItem.total_amount),
      createdAt: updatedItem.created_at,
      updatedAt: updatedItem.updated_at
    };

    res.json(inventoryItem);
    return;
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    res.json({ message: 'Inventory item deleted successfully' });
    return;
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

module.exports = router;
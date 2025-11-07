"use strict";
const express = require('express');
const pool = require('../db/postgres');

const router = express.Router();

// ============================================
// CATEGORY ROUTES
// ============================================

// GET /api/inventory/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_name ASC');
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.category_name,
      color: row.color,
      createdAt: row.created_at
    }));
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST /api/inventory/categories - Add a new category
router.post('/categories', async (req, res) => {
  const { name, color } = req.body;

  console.log('Received category data:', { name, color });

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const query = `
      INSERT INTO categories (category_name, color)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [name, color || '#6B7280'];

    const result = await pool.query(query, values);
    const newCategory = result.rows[0];

    const category = {
      id: newCategory.id,
      name: newCategory.category_name,
      color: newCategory.color,
      createdAt: newCategory.created_at
    };

    console.log('Category added successfully:', category);
    res.status(201).json(category);
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ============================================
// SALES ROUTES
// ============================================

// GET /api/inventory/sales - Fetch all sales records
router.get('/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales_records ORDER BY date DESC, id DESC');
    const salesRecords = result.rows.map(row => ({
      id: row.id,
      date: row.date.toISOString().split('T')[0],
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price),
      total: parseFloat(row.total),
      paymentMethod: row.payment_method,
      createdAt: row.created_at
    }));
    res.json(salesRecords);
  } catch (err) {
    console.error('Error fetching sales records:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST /api/inventory/sales - Add a new sales record
router.post('/sales', async (req, res) => {
  const { date, productName, quantity, price, paymentMethod } = req.body;

  console.log('Received sales data:', { date, productName, quantity, price, paymentMethod });

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate payment method
  const validPaymentMethods = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
  }

  try {
    const total = quantity * price;
    
    console.log('Calculated total:', total);

    const query = `
      INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [date, productName, quantity, price, total, paymentMethod];

    const result = await pool.query(query, values);
    const newSale = result.rows[0];

    const salesRecord = {
      id: newSale.id,
      date: newSale.date.toISOString().split('T')[0],
      productName: newSale.product_name,
      quantity: newSale.quantity,
      price: parseFloat(newSale.price),
      total: parseFloat(newSale.total),
      paymentMethod: newSale.payment_method,
      createdAt: newSale.created_at
    };

    console.log('Sales record added successfully:', salesRecord);
    res.status(201).json(salesRecord);
  } catch (err) {
    console.error('Error adding sales record:', err);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      code: err.code
    });
  }
});

// PUT /api/inventory/sales/:id - Update a sales record
router.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { date, productName, quantity, price, paymentMethod } = req.body;

  console.log('Updating sales record:', { id, date, productName, quantity, price, paymentMethod });

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate payment method
  const validPaymentMethods = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
  }

  try {
    const total = quantity * price;

    const query = `
      UPDATE sales_records
      SET date = $1, product_name = $2, quantity = $3, price = $4, total = $5, 
          payment_method = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [date, productName, quantity, price, total, paymentMethod, id];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    const updatedSale = result.rows[0];
    const salesRecord = {
      id: updatedSale.id,
      date: updatedSale.date.toISOString().split('T')[0],
      productName: updatedSale.product_name,
      quantity: updatedSale.quantity,
      price: parseFloat(updatedSale.price),
      total: parseFloat(updatedSale.total),
      paymentMethod: updatedSale.payment_method,
      createdAt: updatedSale.created_at
    };

    console.log('Sales record updated successfully:', salesRecord);
    res.json(salesRecord);
  } catch (err) {
    console.error('Error updating sales record:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// DELETE /api/inventory/sales/:id - Delete a sales record
router.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM sales_records WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    console.log('Sales record deleted successfully');
    res.json({ message: 'Sales record deleted successfully' });
  } catch (err) {
    console.error('Error deleting sales record:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ============================================
// INVENTORY ITEM ROUTES
// ============================================

// GET /api/inventory - Fetch all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory_items ORDER BY id ASC');
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
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST /api/inventory - Add a new inventory item
router.post('/', async (req, res) => {
  const { productName, category, stock, productPrice } = req.body;

  console.log('Received inventory data:', { productName, category, stock, productPrice });

  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const totalAmount = stock * productPrice;
    const status = stock === 0 ? 'Out Of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

    console.log('Calculated values:', { totalAmount, status });

    const query = `
      INSERT INTO inventory_items (product_name, category, stock, status, product_price, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount];

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

    console.log('Inventory item added successfully:', inventoryItem);
    res.status(201).json(inventoryItem);
  } catch (err) {
    console.error('Error adding inventory item:', err);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      code: err.code
    });
  }
});

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { productName, category, stock, productPrice } = req.body;

  console.log('Updating inventory item:', { id, productName, category, stock, productPrice });

  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const totalAmount = stock * productPrice;
    const status = stock === 0 ? 'Out Of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

    const query = `
      UPDATE inventory_items
      SET product_name = $1, category = $2, stock = $3, status = $4, 
          product_price = $5, total_amount = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount, id];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
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

    console.log('Inventory item updated successfully:', inventoryItem);
    res.json(inventoryItem);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    console.log('Inventory item deleted successfully');
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
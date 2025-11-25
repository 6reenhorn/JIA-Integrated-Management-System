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

    res.status(201).json(category);
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

router.delete('/categories/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  const decodedCategoryName = decodeURIComponent(categoryName);

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check if category exists
    const categoryCheck = await client.query(
      'SELECT * FROM categories WHERE category_name = $1',
      [decodedCategoryName]
    );
    
    if (categoryCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Category not found' });
    }

    // 2. Check if there are products using this category
    const productsCheck = await client.query(
      'SELECT COUNT(*) FROM inventory_items WHERE category = $1',
      [decodedCategoryName]
    );
    
    const productCount = parseInt(productsCheck.rows[0].count);
    
    if (productCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Cannot delete category "${decodedCategoryName}". ${productCount} product(s) are using this category.`,
        productCount 
      });
    }

    // 3. Delete the category
    await client.query('DELETE FROM categories WHERE category_name = $1', [decodedCategoryName]);

    await client.query('COMMIT');
    
    res.json({ 
      message: 'Category deleted successfully',
      categoryName: decodedCategoryName
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting category:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message 
    });
  } finally {
    client.release();
  }
});

// ============================================
// SALES ROUTES (WITH INVENTORY DEDUCTION)
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

// POST /api/inventory/sales - Add a new sales record AND deduct from inventory
router.post('/sales', async (req, res) => {
  const { date, productName, quantity, price, paymentMethod } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validPaymentMethods = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
  }

  // Start a database transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check if product exists in inventory
    const inventoryCheck = await client.query(
      'SELECT id, stock, product_price, minimum_stock FROM inventory_items WHERE product_name = $1',
      [productName]
    );

    if (inventoryCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Product "${productName}" not found in inventory. Please add it to inventory first.` 
      });
    }

    const inventoryItem = inventoryCheck.rows[0];
    const currentStock = inventoryItem.stock;
    const minStock = inventoryItem.minimum_stock || 5;

    // 2. Check if there's enough stock
    if (currentStock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock for "${productName}". Available: ${currentStock}, Requested: ${quantity}` 
      });
    }

    // 3. Calculate new stock and determine status
    const newStock = currentStock - quantity;
    const newTotalAmount = newStock * inventoryItem.product_price;
    const newStatus = newStock === 0 ? 'Out Of Stock' : newStock <= minStock ? 'Low Stock' : 'In Stock';

    // 4. Update inventory
    await client.query(
      `UPDATE inventory_items 
       SET stock = $1, status = $2, total_amount = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newStock, newStatus, newTotalAmount, inventoryItem.id]
    );

    // 5. Insert sales record
    const total = quantity * price;
    const salesQuery = `
      INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const salesValues = [date, productName, quantity, price, total, paymentMethod];
    const salesResult = await client.query(salesQuery, salesValues);
    const newSale = salesResult.rows[0];

    // Commit the transaction
    await client.query('COMMIT');

    const salesRecord = {
      id: newSale.id,
      date: newSale.date.toISOString().split('T')[0],
      productName: newSale.product_name,
      quantity: newSale.quantity,
      price: parseFloat(newSale.price),
      total: parseFloat(newSale.total),
      paymentMethod: newSale.payment_method,
      createdAt: newSale.created_at,
      // Include updated inventory info
      inventoryUpdate: {
        previousStock: currentStock,
        newStock: newStock,
        newStatus: newStatus
      }
    };

    res.status(201).json(salesRecord);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding sales record:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      code: err.code
    });
  } finally {
    client.release();
  }
});

// PUT /api/inventory/sales/:id - Update a sales record (with inventory adjustment)
router.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { date, productName, quantity, price, paymentMethod } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validPaymentMethods = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Get the old sales record
    const oldSaleResult = await client.query(
      'SELECT product_name, quantity FROM sales_records WHERE id = $1',
      [id]
    );

    if (oldSaleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sales record not found' });
    }

    const oldSale = oldSaleResult.rows[0];
    const oldProductName = oldSale.product_name;
    const oldQuantity = oldSale.quantity;

    // 2. Restore old inventory
    await client.query(
      `UPDATE inventory_items 
       SET stock = stock + $1, 
           total_amount = (stock + $1) * product_price,
           status = CASE 
             WHEN (stock + $1) = 0 THEN 'Out Of Stock'
             WHEN (stock + $1) <= COALESCE(minimum_stock, 5) THEN 'Low Stock'
             ELSE 'In Stock'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE product_name = $2`,
      [oldQuantity, oldProductName]
    );

    // 3. Check new product inventory
    const inventoryCheck = await client.query(
      'SELECT id, stock, product_price, minimum_stock FROM inventory_items WHERE product_name = $1',
      [productName]
    );

    if (inventoryCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Product "${productName}" not found in inventory` 
      });
    }

    const inventoryItem = inventoryCheck.rows[0];
    const currentStock = inventoryItem.stock;
    const minStock = inventoryItem.minimum_stock || 5;

    if (currentStock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Insufficient stock for "${productName}". Available: ${currentStock}, Requested: ${quantity}` 
      });
    }

    // 4. Deduct new quantity from inventory
    const newStock = currentStock - quantity;
    const newTotalAmount = newStock * inventoryItem.product_price;
    const newStatus = newStock === 0 ? 'Out Of Stock' : newStock <= minStock ? 'Low Stock' : 'In Stock';

    await client.query(
      `UPDATE inventory_items 
       SET stock = $1, status = $2, total_amount = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newStock, newStatus, newTotalAmount, inventoryItem.id]
    );

    // 5. Update sales record
    const total = quantity * price;
    const salesQuery = `
      UPDATE sales_records
      SET date = $1, product_name = $2, quantity = $3, price = $4, total = $5, 
          payment_method = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const salesValues = [date, productName, quantity, price, total, paymentMethod, id];
    const salesResult = await client.query(salesQuery, salesValues);
    const updatedSale = salesResult.rows[0];

    await client.query('COMMIT');

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

    res.json(salesRecord);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating sales record:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/inventory/sales/:id - Delete a sales record (restore inventory)
router.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Get the sales record to restore inventory
    const salesResult = await client.query(
      'SELECT product_name, quantity FROM sales_records WHERE id = $1',
      [id]
    );
    
    if (salesResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sales record not found' });
    }

    const sale = salesResult.rows[0];

    // 2. Restore inventory
    await client.query(
      `UPDATE inventory_items 
       SET stock = stock + $1, 
           total_amount = (stock + $1) * product_price,
           status = CASE 
             WHEN (stock + $1) = 0 THEN 'Out Of Stock'
             WHEN (stock + $1) <= COALESCE(minimum_stock, 5) THEN 'Low Stock'
             ELSE 'In Stock'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE product_name = $2`,
      [sale.quantity, sale.product_name]
    );

    // 3. Delete sales record
    await client.query('DELETE FROM sales_records WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({ 
      message: 'Sales record deleted and inventory restored successfully',
      restoredQuantity: sale.quantity,
      productName: sale.product_name
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting sales record:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
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
      description: row.description || '',
      minimumStock: row.minimum_stock || 5,
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
  const { productName, category, stock, productPrice, description, minimumStock } = req.body;

  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const totalAmount = stock * productPrice;
    const minStock = minimumStock || 5;
    const status = stock === 0 ? 'Out Of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';

    const query = `
      INSERT INTO inventory_items (product_name, category, stock, status, product_price, total_amount, description, minimum_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount, description || '', minStock];

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
      description: newItem.description || '',
      minimumStock: newItem.minimum_stock || 5,
      createdAt: newItem.created_at,
      updatedAt: newItem.updated_at
    };

    res.status(201).json(inventoryItem);
  } catch (err) {
    console.error('Error adding inventory item:', err);
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
  const { productName, category, stock, productPrice, description, minimumStock } = req.body;

  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const totalAmount = stock * productPrice;
    const minStock = minimumStock || 5;
    const status = stock === 0 ? 'Out Of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';

    const query = `
      UPDATE inventory_items
      SET product_name = $1, category = $2, stock = $3, status = $4, 
          product_price = $5, total_amount = $6, description = $7, 
          minimum_stock = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount, description || '', minStock, id];

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
      description: updatedItem.description || '',
      minimumStock: updatedItem.minimum_stock || 5,
      createdAt: updatedItem.created_at,
      updatedAt: updatedItem.updated_at
    };

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

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;

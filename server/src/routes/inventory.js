"use strict";
const express = require('express');
const { dbHelper } = require('../db/dbHelper');

const router = express.Router();

// Helper to format date as ISO string - frontend will format it using date formatter
const formatDateForResponse = (dateStr) => {
  if (!dateStr) return null;
  try {
    // If it's already an ISO string, return it
    if (dateStr.includes('T')) {
      return dateStr;
    }
    // If it's just a date string (YYYY-MM-DD), convert to ISO
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString();
  } catch {
    return dateStr;
  }
};

// ============================================
// CATEGORY ROUTES
// ============================================

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const rows = await dbHelper.query('SELECT * FROM categories ORDER BY category_name ASC');
    const categories = rows.map(r => ({
      id: r.id,
      name: r.category_name,
      color: r.color,
      createdAt: r.created_at
    }));
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST category
router.post('/categories', async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const result = await dbHelper.insert('categories', {
      category_name: name,
      color: color || '#6B7280'
    });

    // For SQLite, insert returns { id: ..., ...data }
    // For PostgreSQL, insert returns the full row
    const categoryId = result.id || result.lastID;
    
    if (!categoryId) {
      throw new Error('Failed to get category ID after insert');
    }

    const newCat = await dbHelper.getById('categories', categoryId);
    
    if (!newCat) {
      throw new Error('Failed to retrieve newly created category');
    }

    res.status(201).json({
      id: newCat.id,
      name: newCat.category_name,
      color: newCat.color,
      createdAt: newCat.created_at
    });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// DELETE category (if no products use it)
router.delete('/categories/:categoryName', async (req, res) => {
  const decodedCategoryName = decodeURIComponent(req.params.categoryName);

  try {
    const cat = await dbHelper.queryOne('SELECT * FROM categories WHERE category_name = ?', [decodedCategoryName]);
    if (!cat) return res.status(404).json({ error: 'Category not found' });

    const countResult = await dbHelper.queryOne('SELECT COUNT(*) AS count FROM inventory_items WHERE category = ?', [decodedCategoryName]);
    const productCount = parseInt(countResult?.count || countResult?.c || 0, 10);

    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${productCount} product(s) use it.`,
        productCount 
      });
    }

    await dbHelper.run('DELETE FROM categories WHERE category_name = ?', [decodedCategoryName]);
    res.json({ message: 'Category deleted successfully', categoryName: decodedCategoryName });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT category
router.put('/categories/:categoryName', async (req, res) => {
  const decodedCategoryName = decodeURIComponent(req.params.categoryName);
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const cat = await dbHelper.queryOne('SELECT * FROM categories WHERE category_name = ?', [decodedCategoryName]);
    if (!cat) return res.status(404).json({ error: 'Category not found' });

    // Check for duplicate name
    if (name !== decodedCategoryName) {
      const dup = await dbHelper.queryOne('SELECT * FROM categories WHERE category_name = ?', [name]);
      if (dup) return res.status(400).json({ error: `Category "${name}" already exists` });
    }

    await dbHelper.run(
      'UPDATE categories SET category_name = ?, color = ? WHERE category_name = ?',
      [name, color || '#6B7280', decodedCategoryName]
    );

    // Update inventory items if name changed
    if (name !== decodedCategoryName) {
      await dbHelper.run(
        'UPDATE inventory_items SET category = ?, synced = 0 WHERE category = ?',
        [name, decodedCategoryName]
      );
    }

    const updatedCat = await dbHelper.queryOne('SELECT * FROM categories WHERE category_name = ?', [name]);
    res.json({ 
      id: updatedCat.id, 
      name: updatedCat.category_name, 
      color: updatedCat.color, 
      createdAt: updatedCat.created_at 
    });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// SALES ROUTES
// ============================================

// Helper to map sales record
const mapSalesRecord = (r) => ({
  id: r.id,
  date: formatDateForResponse(r.date),
  productName: r.product_name,
  quantity: r.quantity,
  price: parseFloat(r.price),
  total: parseFloat(r.total),
  paymentMethod: r.payment_method,
  createdAt: r.created_at ? formatDateForResponse(r.created_at) : null
});

// GET sales
router.get('/sales', async (req, res) => {
  try {
    const rows = await dbHelper.query(`
      SELECT * FROM sales_records 
      ORDER BY date DESC, id DESC
    `);
    const sales = rows.map(mapSalesRecord);
    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST sale (deduct inventory)
router.post('/sales', async (req, res) => {
  const { date, productName, quantity, price, paymentMethod } = req.body;
  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validPayment = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPayment.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  try {
    // Check product availability
    const prod = await dbHelper.queryOne('SELECT * FROM inventory_items WHERE product_name = ?', [productName]);
    if (!prod) {
      return res.status(404).json({ error: `Product "${productName}" not found` });
    }
    if (prod.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${prod.stock}` });
    }

    const newStock = prod.stock - quantity;
    const newStatus = newStock === 0 ? 'Out Of Stock' 
                    : newStock <= (prod.minimum_stock || 5) ? 'Low Stock' 
                    : 'In Stock';
    const newTotalAmount = newStock * prod.product_price;

    // Update inventory
    await dbHelper.run(
      'UPDATE inventory_items SET stock=?, status=?, total_amount=?, synced=0 WHERE id=?',
      [newStock, newStatus, newTotalAmount, prod.id]
    );

    // Create sales record
    const total = quantity * price;
    const info = await dbHelper.insert('sales_records', {
      date,
      product_name: productName,
      quantity,
      price,
      total,
      payment_method: paymentMethod
    });

    // For SQLite, insert returns { id: ..., ...data }
    // For PostgreSQL, insert returns the full row
    const saleId = info.id || info.lastID || info.insertId;
    if (!saleId) {
      throw new Error('Failed to get sales record ID after insert');
    }

    const newSale = await dbHelper.getById('sales_records', saleId);
    if (!newSale) {
      throw new Error('Failed to retrieve newly created sales record');
    }

    res.status(201).json({
      ...mapSalesRecord(newSale),
      inventoryUpdate: {
        previousStock: newSale.previousStock,
        newStock: newSale.newStock,
        newStatus: newSale.newStatus
      }
    });
  } catch (err) {
    console.error('Error adding sale:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE sales record
router.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { date, productName, quantity, price, paymentMethod } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validPayment = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPayment.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  try {
    const saleId = parseInt(id, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sales record ID' });
    }

    const oldSale = await dbHelper.queryOne('SELECT * FROM sales_records WHERE id = ?', [saleId]);
    if (!oldSale) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    // Restore previous inventory
    await dbHelper.run(`
      UPDATE inventory_items
      SET stock = stock + ?, 
          total_amount = (stock + ?) * product_price,
          status = CASE 
            WHEN (stock + ?) = 0 THEN 'Out Of Stock'
            WHEN (stock + ?) <= COALESCE(minimum_stock,5) THEN 'Low Stock'
            ELSE 'In Stock'
          END
      WHERE product_name = ?
    `, [oldSale.quantity, oldSale.quantity, oldSale.quantity, oldSale.quantity, oldSale.product_name]);

    // Deduct new inventory
    const item = await dbHelper.queryOne('SELECT * FROM inventory_items WHERE product_name = ?', [productName]);
    if (!item) {
      return res.status(404).json({ error: `Product "${productName}" not found` });
    }
    if (item.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock for "${productName}". Available: ${item.stock}` });
    }

    const newStock = item.stock - quantity;
    const newStatus = newStock === 0 ? 'Out Of Stock' 
                    : newStock <= (item.minimum_stock || 5) ? 'Low Stock' 
                    : 'In Stock';
    const newTotal = newStock * item.product_price;

    await dbHelper.run(
      'UPDATE inventory_items SET stock=?, status=?, total_amount=?, synced=0 WHERE id=?',
      [newStock, newStatus, newTotal, item.id]
    );

      const total = quantity * price;
      await dbHelper.run(`
        UPDATE sales_records
        SET date=?, product_name=?, quantity=?, price=?, total=?, payment_method=?, synced=0
        WHERE id=?
      `, [date, productName, quantity, price, total, paymentMethod, saleId]);

    const updatedSale = await dbHelper.getById('sales_records', saleId);
    if (!updatedSale) {
      return res.status(404).json({ error: 'Failed to retrieve updated sales record' });
    }

    res.json(mapSalesRecord(updatedSale));
  } catch (err) {
    console.error('Error updating sale:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE sales record
router.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const saleId = parseInt(id, 10);
    if (isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sales record ID' });
    }

    const sale = await dbHelper.queryOne('SELECT * FROM sales_records WHERE id = ?', [saleId]);
    if (!sale) {
      return res.status(404).json({ error: 'Sales record not found' });
    }

    await dbHelper.run(`
      UPDATE inventory_items
      SET stock = stock + ?, 
          total_amount = (stock + ?) * product_price,
          status = CASE 
            WHEN (stock + ?) = 0 THEN 'Out Of Stock'
            WHEN (stock + ?) <= COALESCE(minimum_stock,5) THEN 'Low Stock'
            ELSE 'In Stock'
          END,
          synced = 0
      WHERE product_name = ?
    `, [sale.quantity, sale.quantity, sale.quantity, sale.quantity, sale.product_name]);

    await dbHelper.hardDelete('sales_records', saleId);

    res.json({ 
      message: 'Sales record deleted and inventory restored successfully',
      restoredQuantity: sale.quantity,
      productName: sale.product_name
    });
  } catch (err) {
    console.error('Error deleting sale:', err);
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// INVENTORY ITEM ROUTES
// ============================================

// Helper to map inventory item
const mapInventoryItem = (r) => ({
  id: r.id,
  productName: r.product_name,
  category: r.category,
  stock: r.stock,
  status: r.status,
  productPrice: parseFloat(r.product_price),
  totalAmount: parseFloat(r.total_amount),
  description: r.description || '',
  minimumStock: r.minimum_stock || 5,
  createdAt: r.created_at,
  updatedAt: r.updated_at
});

// GET inventory items
router.get('/', async (req, res) => {
  try {
    const rows = await dbHelper.query('SELECT * FROM inventory_items ORDER BY id ASC');
    const items = rows.map(mapInventoryItem);
    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST inventory item
router.post('/', async (req, res) => {
  const { productName, category, stock, productPrice, description, minimumStock } = req.body;
  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const totalAmount = stock * productPrice;
    const minStock = minimumStock || 5;
    const status = stock === 0 ? 'Out Of Stock' 
                 : stock <= minStock ? 'Low Stock' 
                 : 'In Stock';

    const result = await dbHelper.insert('inventory_items', {
      product_name: productName,
      category,
      stock,
      status,
      product_price: productPrice,
      total_amount: totalAmount,
      description: description || '',
      minimum_stock: minStock
    });

    // For SQLite, insert returns { id: ..., ...data }
    // For PostgreSQL, insert returns the full row
    const itemId = result.id || result.lastID || result.insertId;
    
    if (!itemId) {
      throw new Error('Failed to get inventory item ID after insert');
    }

    const newItem = await dbHelper.getById('inventory_items', itemId);
    
    if (!newItem) {
      throw new Error('Failed to retrieve newly created inventory item');
    }

    res.status(201).json(mapInventoryItem(newItem));
  } catch (err) {
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// UPDATE inventory item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { productName, category, stock, productPrice, description, minimumStock } = req.body;

  if (!productName || !category || stock === undefined || !productPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid inventory item ID' });
    }

    const totalAmount = stock * productPrice;
    const minStock = minimumStock || 5;
    const status = stock === 0 ? 'Out Of Stock' 
                 : stock <= minStock ? 'Low Stock' 
                 : 'In Stock';

    const updated = await dbHelper.update('inventory_items', itemId, {
      product_name: productName,
      category,
      stock,
      status,
      product_price: productPrice,
      total_amount: totalAmount,
      description: description || '',
      minimum_stock: minStock
    });

    if (!updated) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const updatedItem = await dbHelper.getById('inventory_items', itemId);
    res.json(mapInventoryItem(updatedItem));
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid inventory item ID' });
    }

    const item = await dbHelper.getById('inventory_items', itemId);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await dbHelper.hardDelete('inventory_items', itemId);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
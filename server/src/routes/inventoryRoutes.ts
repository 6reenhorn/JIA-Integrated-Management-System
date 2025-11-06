import { Router, Request, Response } from 'express';
import pool from '../db/postgres';

const router = Router();

// Types
interface InventoryItem {
  id: number;
  productName: string;
  category: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out Of Stock';
  productPrice: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SalesRecord {
  id: number;
  date: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
  createdAt?: Date;
}

interface Category {
  id: number;
  name: string;
  color: string;
  createdAt?: Date;
}

// ============================================
// CATEGORY ROUTES
// ============================================

// GET /api/inventory/categories - Fetch all categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_name ASC');
    const categories: Category[] = result.rows.map((row): Category => ({
      id: row.id,
      name: row.category_name,
      color: row.color,
      createdAt: row.created_at
    }));
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/inventory/categories - Add a new category
router.post('/categories', async (req: Request, res: Response): Promise<void> => {
  const { name, color }: { name: string; color?: string } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
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

    const category: Category = {
      id: newCategory.id,
      name: newCategory.category_name,
      color: newCategory.color,
      createdAt: newCategory.created_at
    };

    res.status(201).json(category);
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// SALES ROUTES
// ============================================

// GET /api/inventory/sales - Fetch all sales records
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM sales_records ORDER BY date DESC, id DESC');
    const salesRecords: SalesRecord[] = result.rows.map((row): SalesRecord => ({
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/inventory/sales - Add a new sales record
router.post('/sales', async (req: Request, res: Response): Promise<void> => {
  const {
    date,
    productName,
    quantity,
    price,
    paymentMethod
  }: {
    date: string;
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
  } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const total = quantity * price;

    const query = `
      INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [date, productName, quantity, price, total, paymentMethod];

    const result = await pool.query(query, values);
    const newSale = result.rows[0];

    const salesRecord: SalesRecord = {
      id: newSale.id,
      date: newSale.date.toISOString().split('T')[0],
      productName: newSale.product_name,
      quantity: newSale.quantity,
      price: parseFloat(newSale.price),
      total: parseFloat(newSale.total),
      paymentMethod: newSale.payment_method,
      createdAt: newSale.created_at
    };

    res.status(201).json(salesRecord);
  } catch (err) {
    console.error('Error adding sales record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/inventory/sales/:id - Update a sales record
router.put('/sales/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    date,
    productName,
    quantity,
    price,
    paymentMethod
  }: {
    date: string;
    productName: string;
    quantity: number;
    price: number;
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Card';
  } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
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
      res.status(404).json({ error: 'Sales record not found' });
      return;
    }

    const updatedSale = result.rows[0];
    const salesRecord: SalesRecord = {
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
    console.error('Error updating sales record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/inventory/sales/:id - Delete a sales record
router.delete('/sales/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM sales_records WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sales record not found' });
      return;
    }

    res.json({ message: 'Sales record deleted successfully' });
  } catch (err) {
    console.error('Error deleting sales record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// INVENTORY ITEM ROUTES
// ============================================

// GET /api/inventory - Fetch all inventory items
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM inventory_items ORDER BY id ASC');
    const inventoryItems: InventoryItem[] = result.rows.map((row): InventoryItem => ({
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
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    productName,
    category,
    stock,
    productPrice
  }: {
    productName: string;
    category: string;
    stock: number;
    productPrice: number;
  } = req.body;

  if (!productName || !category || stock === undefined || !productPrice) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Calculate total amount and determine status
    const totalAmount = stock * productPrice;
    const status = stock === 0 ? 'Out Of Stock' : stock <= 10 ? 'Low Stock' : 'In Stock';

    const query = `
      INSERT INTO inventory_items (product_name, category, stock, status, product_price, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount];

    const result = await pool.query(query, values);
    const newItem = result.rows[0];

    const inventoryItem: InventoryItem = {
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
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    productName,
    category,
    stock,
    productPrice
  }: {
    productName: string;
    category: string;
    stock: number;
    productPrice: number;
  } = req.body;

  if (!productName || !category || stock === undefined || !productPrice) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Recalculate total amount and status
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
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    const updatedItem = result.rows[0];
    const inventoryItem: InventoryItem = {
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
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
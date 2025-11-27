import { Router, Request, Response } from 'express';
import { dbHelper } from '../db/dbHelper';

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
  paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
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
    const rows = await dbHelper.query('SELECT * FROM categories ORDER BY category_name ASC');
    const categories: Category[] = rows.map((row: any): Category => ({
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
      VALUES (?, ?)
    `;
    const values = [name, color || '#6B7280'];

    const result = await dbHelper.run(query, values);
    const newCategory = await dbHelper.getById('categories', result.lastID);

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

// DELETE /api/inventory/categories/:categoryName - Delete a category
router.delete('/categories/:categoryName', async (req: Request, res: Response): Promise<void> => {
  const { categoryName } = req.params;
  const decodedCategoryName = decodeURIComponent(categoryName);
  
  try {
    // 1. Check if category exists
    const categoryCheck = await dbHelper.queryOne(
      'SELECT * FROM categories WHERE category_name = ?',
      [decodedCategoryName]
    );
    
    if (!categoryCheck) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // 2. Check if there are products using this category
    const productsCheck = await dbHelper.queryOne(
      'SELECT COUNT(*) as count FROM inventory_items WHERE category = ?',
      [decodedCategoryName]
    );
    
    const productCount = parseInt(productsCheck?.count || '0');
    
    if (productCount > 0) {
      res.status(400).json({ 
        error: `Cannot delete category "${decodedCategoryName}". ${productCount} product(s) are using this category.`,
        productCount 
      });
      return;
    }

    // 3. Delete the category
    await dbHelper.run('DELETE FROM categories WHERE category_name = ?', [decodedCategoryName]);
    
    res.json({ 
      message: 'Category deleted successfully',
      categoryName: decodedCategoryName
    });
    
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});


router.put('/categories/:categoryName', async (req: Request, res: Response): Promise<void> => {
  const { categoryName } = req.params;
  const decodedCategoryName = decodeURIComponent(categoryName);
  const { name, color }: { name: string; color?: string } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required' });
    return;
  }
  
  try {
    // 1. Check if category exists
    const categoryCheck = await dbHelper.queryOne(
      'SELECT * FROM categories WHERE category_name = ?',
      [decodedCategoryName]
    );
    
    if (!categoryCheck) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // 2. If name is being changed, check if new name already exists
    if (name !== decodedCategoryName) {
      const duplicateCheck = await dbHelper.queryOne(
        'SELECT * FROM categories WHERE category_name = ?',
        [name]
      );
      
      if (duplicateCheck) {
        res.status(400).json({ 
          error: `Category name "${name}" already exists. Please choose a different name.`
        });
        return;
      }
    }

    // 3. Update the category
    await dbHelper.run(
      'UPDATE categories SET category_name = ?, color = ? WHERE category_name = ?',
      [name, color || '#6B7280', decodedCategoryName]
    );
    const updatedCategory = await dbHelper.queryOne(
      'SELECT * FROM categories WHERE category_name = ?',
      [name]
    );

    // 4. Update all inventory items that use this category (if name changed)
    if (name !== decodedCategoryName) {
      await dbHelper.run(
        'UPDATE inventory_items SET category = ? WHERE category = ?',
        [name, decodedCategoryName]
      );
    }
    
    const category: Category = {
      id: updatedCategory.id,
      name: updatedCategory.category_name,
      color: updatedCategory.color,
      createdAt: updatedCategory.created_at
    };

    res.json(category);
    
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});


// ============================================
// SALES ROUTES
// ============================================

// GET /api/inventory/sales - Fetch all sales records
router.get('/sales', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await dbHelper.query('SELECT * FROM sales_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC');
    const salesRecords: SalesRecord[] = rows.map((row: any): SalesRecord => ({
      id: row.id,
      date: row.date ? (typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0]) : '',
      productName: row.product_name,
      quantity: row.quantity,
      price: parseFloat(row.price || 0),
      total: parseFloat(row.total || 0),
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
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
  } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Validate payment method
  const validPaymentMethods: Array<'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay'> = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
    return;
  }

  try {
    const total = quantity * price;

    const query = `
      INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [date, productName, quantity, price, total, paymentMethod];

    const result = await dbHelper.run(query, values);
    const newSale = await dbHelper.getById('sales_records', result.lastID);

    const salesRecord: SalesRecord = {
      id: newSale.id,
      date: newSale.date ? (typeof newSale.date === 'string' ? newSale.date : new Date(newSale.date).toISOString().split('T')[0]) : '',
      productName: newSale.product_name,
      quantity: newSale.quantity,
      price: parseFloat(newSale.price || 0),
      total: parseFloat(newSale.total || 0),
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
    paymentMethod: 'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay';
  } = req.body;

  if (!date || !productName || !quantity || !price || !paymentMethod) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Validate payment method
  const validPaymentMethods: Array<'Cash' | 'Gcash' | 'PayMaya' | 'Juanpay'> = ['Cash', 'Gcash', 'PayMaya', 'Juanpay'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    res.status(400).json({ 
      error: 'Invalid payment method. Must be one of: Cash, Gcash, PayMaya, Juanpay' 
    });
    return;
  }

  try {
    const total = quantity * price;

    const query = `
      UPDATE sales_records
      SET date = ?, product_name = ?, quantity = ?, price = ?, total = ?, 
          payment_method = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const values = [date, productName, quantity, price, total, paymentMethod, id];

    await dbHelper.run(query, values);
    const updatedSale = await dbHelper.getById('sales_records', id);
    
    if (!updatedSale) {
      res.status(404).json({ error: 'Sales record not found' });
      return;
    }

    const salesRecord: SalesRecord = {
      id: updatedSale.id,
      date: updatedSale.date ? (typeof updatedSale.date === 'string' ? updatedSale.date : new Date(updatedSale.date).toISOString().split('T')[0]) : '',
      productName: updatedSale.product_name,
      quantity: updatedSale.quantity,
      price: parseFloat(updatedSale.price || 0),
      total: parseFloat(updatedSale.total || 0),
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
    const record = await dbHelper.getById('sales_records', id);
    if (!record) {
      res.status(404).json({ error: 'Sales record not found' });
      return;
    }

    await dbHelper.hardDelete('sales_records', id);

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
    const rows = await dbHelper.query('SELECT * FROM inventory_items WHERE deleted_at IS NULL ORDER BY id ASC');
    const inventoryItems: InventoryItem[] = rows.map((row: any): InventoryItem => ({
      id: row.id,
      productName: row.product_name,
      category: row.category,
      stock: row.stock,
      status: row.status,
      productPrice: parseFloat(row.product_price || 0),
      totalAmount: parseFloat(row.total_amount || 0),
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
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount];

    const result = await dbHelper.run(query, values);
    const newItem = await dbHelper.getById('inventory_items', result.lastID);

    const inventoryItem: InventoryItem = {
      id: newItem.id,
      productName: newItem.product_name,
      category: newItem.category,
      stock: newItem.stock,
      status: newItem.status,
      productPrice: parseFloat(newItem.product_price || 0),
      totalAmount: parseFloat(newItem.total_amount || 0),
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
      SET product_name = ?, category = ?, stock = ?, status = ?, 
          product_price = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const values = [productName, category, stock, status, productPrice, totalAmount, id];

    await dbHelper.run(query, values);
    const updatedItem = await dbHelper.getById('inventory_items', id);
    
    if (!updatedItem) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    const inventoryItem: InventoryItem = {
      id: updatedItem.id,
      productName: updatedItem.product_name,
      category: updatedItem.category,
      stock: updatedItem.stock,
      status: updatedItem.status,
      productPrice: parseFloat(updatedItem.product_price || 0),
      totalAmount: parseFloat(updatedItem.total_amount || 0),
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
    const record = await dbHelper.getById('inventory_items', id);
    if (!record) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    await dbHelper.hardDelete('inventory_items', id);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ UNHANDLED REJECTION', reason);
});

let mainWindow: BrowserWindow | null = null;
let syncInterval: NodeJS.Timeout | null = null;

console.log('🚀 Electron app starting...');

// Dynamic imports for CommonJS compatibility
let syncFromPostgresToSQLite: any;
let syncFromSQLiteToPostgres: any;
let initializeSQLite: any;
let getSQLite: any;

// Initialize imports
async function initializeImports() {
    console.log('🔄 Loading sync/sqlite modules...');
    const syncModule = await import('./sync.js');
    const sqliteModule = await import('./sqlite.js');
    syncFromPostgresToSQLite = syncModule.syncFromPostgresToSQLite;
    syncFromSQLiteToPostgres = syncModule.syncFromSQLiteToPostgres;
    initializeSQLite = sqliteModule.initializeSQLite;
    getSQLite = sqliteModule.getSQLite;
    console.log('✅ Loaded sync/sqlite modules');
}

// Create the main application window
app.on('ready', async () => {
    console.log('📱 app.on("ready") fired');
    
    try {
        // Initialize dynamic imports first
        console.log('🔄 Calling initializeImports...');
        await initializeImports();
        console.log('✅ Loaded sync/sqlite modules');
    } catch (err) {
        console.error('❌ initializeImports failed', err);
        process.exit(1);
    }

    try {
        // Initialize SQLite database
        console.log('🔄 Calling initializeSQLite...');
        await initializeSQLite();
        console.log('✅ SQLite initialized');
    } catch (err) {
        console.error('❌ initializeSQLite failed', err);
        process.exit(1);
    }
    
    console.log('📦 Creating BrowserWindow...');
    mainWindow = new BrowserWindow({
        width: 1200,
        minWidth: 1200,
        height: 600,
        minHeight: 600,
        frame: false,
        show: false,
        backgroundColor: '#02367B',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true
        }
    });

    // Set Content Security Policy to prevent unsafe-eval (only in production)
    if (!isDev()) {
        mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [
                        "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "font-src 'self'; " +
                        "connect-src 'self' http://localhost:3001 ws://localhost:3001; " +
                        "object-src 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self';"
                    ]
                }
            });
        });
    }
    mainWindow.menuBarVisible = false;

    // Attach event listeners BEFORE loading
    mainWindow.webContents.once('did-finish-load', () => {
        console.log('✅ Renderer loaded');
    });
    mainWindow.webContents.once('did-fail-load', (_event, code, desc, validatedURL, isMainFrame) => {
        console.error('❌ Renderer failed to load', { code, desc, validatedURL, isMainFrame });
    });

    mainWindow.once('ready-to-show', () => {
        console.log('ℹ️ ready-to-show event fired');
        mainWindow?.show();
        mainWindow?.maximize();
        console.log('ℹ️ Window shown and maximized');
        if (isDev()) {
            mainWindow?.webContents.openDevTools();
        }
    });

    try {
        if (isDev()) {
            console.log('ℹ️ Loading renderer from dev server');
            await mainWindow.loadURL('http://localhost:3000');
        } else {
            // Try multiple possible paths for dist-react (varies based on asar/unpacked)
            const possiblePaths = [
                path.join(app.getAppPath(), 'dist-react', 'index.html'),
                path.join(__dirname, '..', 'dist-react', 'index.html'),
                path.join(process.resourcesPath, 'app', 'dist-react', 'index.html'),
                path.join(process.resourcesPath, 'dist-react', 'index.html'),
            ];
            
            let foundPath = '';
            for (const p of possiblePaths) {
                console.log('ℹ️ Checking path:', p);
                if (require('fs').existsSync(p)) {
                    console.log('✅ Found renderer at:', p);
                    foundPath = p;
                    break;
                }
            }
            
            if (!foundPath) {
                console.error('❌ Could not find index.html in any of:', possiblePaths);
                throw new Error('index.html not found');
            }
            
            await mainWindow.loadFile(foundPath);
        }
    } catch (err) {
        console.error('❌ Renderer load threw', err);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        // Clear sync interval when window closes
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
    });

    console.log('✅ App ready with window shown');
    
    // 🔥 INITIAL SYNC - Non-blocking, happens after window is visible
    console.log('🔄 Starting initial sync (non-blocking)...');
    (async () => {
        try {
            console.log('🚀 Attempting to sync with PostgreSQL...');
            await syncFromPostgresToSQLite();
            console.log('✅ Initial sync completed');
            startBackgroundSync();
        } catch (error) {
            console.log('⚠️ Starting in offline mode:', error);
            // App will use SQLite cache
        }
    })().catch(err => {
        console.error('❌ Sync error (caught):', err);
    });
});

// 🔄 Background sync function
function startBackgroundSync() {
    syncInterval = setInterval(async () => {
        try {
            console.log('🔄 Background sync starting...');
            await syncFromSQLiteToPostgres(); // Push local changes first
            await syncFromPostgresToSQLite(); // Then pull latest data
            console.log('✅ Background sync completed');
        } catch (error) {
            console.log('⚠️ Background sync failed (offline?):', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        app.emit('ready');
    }
});

// Handle window control events from renderer process
ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow?.close();
});

// 🌐 Handle online/offline events from renderer
ipcMain.on('online', async () => {
    console.log('🌐 Connection restored - syncing...');
    try {
        await syncFromSQLiteToPostgres(); // Push any offline changes
        await syncFromPostgresToSQLite(); // Pull latest data
        console.log('✅ Online sync completed');
        
        // Restart background sync if it was stopped
        if (!syncInterval) {
            startBackgroundSync();
        }
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
});

ipcMain.on('offline', () => {
    console.log('📴 Connection lost - entering offline mode');
    // Stop background sync to avoid errors
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
});

// 🔄 Manual sync trigger (optional - for a "Sync Now" button in UI)
ipcMain.handle('manual-sync', async () => {
    try {
        console.log('🔄 Manual sync triggered...');
        await syncFromSQLiteToPostgres();
        await syncFromPostgresToSQLite();
        return { success: true, message: 'Sync completed successfully' };
    } catch (error: any) {
        console.error('❌ Manual sync failed:', error);
        return { success: false, message: error.message };
    }
});

// IPC Data API — Employees, Attendance, Payroll
// Helper mappers to convert SQLite rows to renderer-friendly shapes
function mapEmployeeRow(row: any) {
    return {
        id: row.id,
        name: row.name ?? '',
        empId: row.emp_id ?? '',
        role: row.role ?? '',
        contact: row.contact ?? '',
        status: row.status ?? 'Active',
        lastLogin: row.last_login ?? '',
        avatar: row.avatar ?? undefined,
        address: row.address ?? '',
        salary: row.salary ?? '',
        contactName: row.contact_name ?? '',
        contactNumber: row.contact_number ?? '',
        relationship: row.relationship ?? '',
        password: row.password ?? ''
    };
}

ipcMain.handle('data:get-employees', async () => {
    const db = getSQLite();
    const rows = db.prepare('SELECT * FROM employees ORDER BY id DESC').all();
    return rows.map(mapEmployeeRow);
});

ipcMain.handle('data:get-attendance', async () => {
    const db = getSQLite();
    const rows = db.prepare(
        `SELECT a.id as attendanceId, e.name, e.emp_id as empId, e.role,
                a.date, a.time_in as timeIn, a.time_out as timeOut, a.status
         FROM attendance a
         LEFT JOIN employees e ON e.id = a.employee_id
         ORDER BY a.date DESC`
    ).all();
    // Normalize nulls
    return rows.map((r: any) => ({
        attendanceId: r.attendanceId,
        name: r.name ?? '',
        empId: r.empId ?? '',
        role: r.role ?? '',
        date: r.date ?? '',
        timeIn: r.timeIn ?? '',
        timeOut: r.timeOut ?? '',
        status: r.status ?? 'Present'
    }));
});

ipcMain.handle('data:get-payroll', async () => {
    const db = getSQLite();
    const rows = db.prepare(
        `SELECT id,
                employee_name as employeeName,
                emp_id as empId,
                role,
                month,
                year,
                basic_salary as basicSalary,
                deductions,
                net_salary as netSalary,
                status,
                payment_date as paymentDate
         FROM payroll_records
         ORDER BY id DESC`
    ).all();
    return rows.map((r: any) => ({
        id: r.id,
        employeeName: r.employeeName ?? '',
        empId: r.empId ?? '',
        role: r.role ?? '',
        month: String(r.month ?? ''),
        year: String(r.year ?? ''),
        basicSalary: Number(r.basicSalary ?? 0),
        deductions: Number(r.deductions ?? 0),
        netSalary: Number(r.netSalary ?? 0),
        status: r.status ?? 'Pending',
        paymentDate: r.paymentDate ?? undefined
    }));
});

ipcMain.handle('data:add-employee', async (_event, payload: any) => {
    const db = getSQLite();
    // Generate an emp_id for local record
    const empId = `EMP-${Date.now()}`;
    const stmt = db.prepare(`
        INSERT INTO employees (
            emp_id, name, role, contact, status, avatar,
            address, salary, contact_name, contact_number,
            relationship, password, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    const info = stmt.run(
        empId,
        payload.name ?? '',
        payload.role ?? '',
        payload.contact ?? '',
        payload.status ?? 'Active',
        payload.avatar ?? null,
        payload.address ?? '',
        payload.salary ?? '',
        payload.contactName ?? '',
        payload.contactNumber ?? '',
        payload.relationship ?? '',
        payload.password ?? ''
    );
    const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid as number);
    return mapEmployeeRow(row);
});

ipcMain.handle('data:update-employee', async (_event, payload: any) => {
    const db = getSQLite();
    const sets = [
        'name = ?', 'role = ?', 'contact = ?', 'status = ?', 'avatar = ?',
        'address = ?', 'salary = ?', 'contact_name = ?', 'contact_number = ?', 'relationship = ?', 'password = ?',
        'synced = 0'
    ];
    const params = [
        payload.name ?? '',
        payload.role ?? '',
        payload.contact ?? '',
        payload.status ?? 'Active',
        payload.avatar ?? null,
        payload.address ?? '',
        payload.salary ?? '',
        payload.contactName ?? '',
        payload.contactNumber ?? '',
        payload.relationship ?? '',
        payload.password ?? ''
    ];
    db.prepare(`UPDATE employees SET ${sets.join(', ')} WHERE id = ?`).run(...params, payload.id);
    const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(payload.id);
    return mapEmployeeRow(row);
});

ipcMain.handle('data:delete-employee', async (_event, id: number) => {
    const db = getSQLite();
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    return { success: true };
});

// Inventory IPC
function mapInventoryRow(row: any) {
    return {
        id: row.id,
        productName: row.product_name ?? '',
        category: row.category ?? '',
        stock: Number(row.stock ?? 0),
        status: row.status ?? 'In Stock',
        productPrice: Number(row.product_price ?? 0),
        totalAmount: Number(row.total_amount ?? 0),
        description: row.description ?? '',
        minimumStock: Number(row.minimum_stock ?? 0),
        createdAt: row.created_at ?? '',
        updatedAt: row.updated_at ?? ''
    };
}

function mapCategoryRow(row: any) {
    return {
        id: row.id,
        name: row.category_name ?? '',
        color: row.color ?? '#6B7280',
        createdAt: row.created_at ?? ''
    };
}

function mapSalesRow(row: any) {
    return {
        id: row.id,
        date: row.date ?? '',
        productName: row.product_name ?? '',
        quantity: Number(row.quantity ?? 0),
        price: Number(row.price ?? 0),
        total: Number(row.total ?? 0),
        paymentMethod: row.payment_method ?? 'Cash'
    };
}

function formatDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
}

function mapGCashRow(row: any) {
    return {
        id: String(row.id),
        amount: Number(row.amount ?? 0),
        serviceCharge: Number(row.service_charge ?? 0),
        transactionType: row.transaction_type ?? '',
        chargeMOP: row.charge_mop ?? '',
        referenceNumber: row.reference_number ?? '',
        date: formatDate(row.date)
    };
}

function mapPayMayaRow(row: any) {
    return {
        id: String(row.id),
        amount: Number(row.amount ?? 0),
        serviceCharge: Number(row.service_charge ?? 0),
        transactionType: row.transaction_type ?? '',
        chargeMOP: row.charge_mop ?? '',
        referenceNumber: row.reference_number ?? '',
        date: formatDate(row.date)
    };
}

function mapJuanPayRow(row: any) {
    return {
        id: String(row.id),
        date: formatDate(row.date),
        beginnings: row.beginnings ?? '',
        ending: Number(row.ending ?? 0),
        sales: Number(row.sales ?? 0),
        createdAt: row.created_at ?? '',
        updatedAt: row.updated_at ?? ''
    };
}

ipcMain.handle('inventory:get-items', async () => {
    const db = getSQLite();
    const rows = db.prepare('SELECT * FROM inventory_items ORDER BY id DESC').all();
    return rows.map(mapInventoryRow);
});

ipcMain.handle('inventory:add-item', async (_e, payload: any) => {
    const db = getSQLite();
    const total = Number(payload.productPrice ?? 0) * Number(payload.stock ?? 0);
    const info = db.prepare(`
        INSERT INTO inventory_items (
            product_name, category, stock, status, product_price, total_amount,
            description, minimum_stock, created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)
    `).run(
        payload.productName ?? '',
        payload.category ?? '',
        Number(payload.stock ?? 0),
        payload.status ?? 'In Stock',
        Number(payload.productPrice ?? 0),
        total,
        payload.description ?? '',
        Number(payload.minimumStock ?? 0)
    );
    const row = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(info.lastInsertRowid as number);
    return mapInventoryRow(row);
});

ipcMain.handle('inventory:update-item', async (_e, payload: any) => {
    const db = getSQLite();
    const total = Number(payload.productPrice ?? 0) * Number(payload.stock ?? 0);
    db.prepare(`
        UPDATE inventory_items SET
            product_name = ?, category = ?, stock = ?, status = ?,
            product_price = ?, total_amount = ?, description = ?, minimum_stock = ?,
            updated_at = datetime('now'), synced = 0
        WHERE id = ?
    `).run(
        payload.productName ?? '',
        payload.category ?? '',
        Number(payload.stock ?? 0),
        payload.status ?? 'In Stock',
        Number(payload.productPrice ?? 0),
        total,
        payload.description ?? '',
        Number(payload.minimumStock ?? 0),
        payload.id
    );
    const row = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(payload.id);
    return mapInventoryRow(row);
});

ipcMain.handle('inventory:delete-item', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
    return { success: true };
});

ipcMain.handle('inventory:get-categories', async () => {
    const db = getSQLite();
    const rows = db.prepare('SELECT * FROM categories ORDER BY id DESC').all();
    return rows.map(mapCategoryRow);
});

ipcMain.handle('inventory:add-category', async (_e, payload: any) => {
    const db = getSQLite();
    // check existing by name
    const existing = db.prepare('SELECT * FROM categories WHERE category_name = ?').get(payload.name ?? '') as any;
    if (existing) {
        db.prepare('UPDATE categories SET color = ?, synced = 0 WHERE id = ?').run(payload.color ?? '#6B7280', existing.id);
        const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(existing.id);
        return mapCategoryRow(row);
    }
    const info = db.prepare(`
        INSERT INTO categories (category_name, color, created_at, synced)
        VALUES (?, ?, datetime('now'), 0)
    `).run(payload.name ?? '', payload.color ?? '#6B7280');
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid as number);
    return mapCategoryRow(row);
});

ipcMain.handle('inventory:update-category', async (_e, payload: any) => {
    const db = getSQLite();
    db.prepare('UPDATE categories SET category_name = ?, color = ?, synced = 0 WHERE category_name = ?')
      .run(payload.newName ?? '', payload.color ?? '#6B7280', payload.oldName ?? '');
    const row = db.prepare('SELECT * FROM categories WHERE category_name = ?').get(payload.newName ?? '');
    return mapCategoryRow(row);
});

ipcMain.handle('inventory:delete-category', async (_e, name: string) => {
    const db = getSQLite();
    db.prepare('DELETE FROM categories WHERE category_name = ?').run(name);
    return { success: true };
});

ipcMain.handle('inventory:get-sales', async () => {
    const db = getSQLite();
    const rows = db.prepare('SELECT * FROM sales_records ORDER BY id DESC').all();
    return rows.map(mapSalesRow);
});

ipcMain.handle('inventory:add-sale', async (_e, payload: any) => {
    const db = getSQLite();
    // Check product exists and stock
    const product = db.prepare('SELECT * FROM inventory_items WHERE product_name = ?').get(payload.productName ?? '') as any;
    if (!product) throw new Error(`Product '${payload.productName}' not found in inventory`);
    const qty = Number(payload.quantity ?? 0);
    if (Number(product.stock ?? 0) < qty) {
        throw new Error(`Insufficient stock for ${payload.productName}. Available: ${product.stock}`);
    }
    // Insert sale
    const total = Number(payload.price ?? 0) * qty;
    const info = db.prepare(`
        INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method, created_at, synced)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 0)
    `).run(payload.date ?? '', payload.productName ?? '', qty, Number(payload.price ?? 0), total, payload.paymentMethod ?? 'Cash');
    // Update stock & total
    const newStock = Number(product.stock) - qty;
    const newTotalAmount = Number(product.product_price ?? 0) * newStock;
    db.prepare('UPDATE inventory_items SET stock = ?, total_amount = ?, updated_at = datetime(\'now\'), synced = 0 WHERE id = ?')
      .run(newStock, newTotalAmount, product.id);
    const row = db.prepare('SELECT * FROM sales_records WHERE id = ?').get(info.lastInsertRowid as number);
    return mapSalesRow(row);
});

ipcMain.handle('inventory:update-sale', async (_e, payload: any) => {
    const db = getSQLite();
    const total = Number(payload.price ?? 0) * Number(payload.quantity ?? 0);
    db.prepare(`
        UPDATE sales_records SET
            date = ?, product_name = ?, quantity = ?, price = ?, total = ?, payment_method = ?,
            updated_at = datetime('now'), synced = 0
        WHERE id = ?
    `).run(payload.date ?? '', payload.productName ?? '', Number(payload.quantity ?? 0), Number(payload.price ?? 0), total, payload.paymentMethod ?? 'Cash', payload.id);
    const row = db.prepare('SELECT * FROM sales_records WHERE id = ?').get(payload.id);
    return mapSalesRow(row);
});

ipcMain.handle('inventory:delete-sale', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare('DELETE FROM sales_records WHERE id = ?').run(id);
    return { success: true };
});

// Attendance IPC
ipcMain.handle('attendance:checkin', async (_e, payload: any) => {
    const db = getSQLite();
    // Find employee by id or emp_id
    let emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(payload.employeeId) as any;
    if (!emp) {
        emp = db.prepare('SELECT * FROM employees WHERE emp_id = ?').get(payload.employeeId) as any;
    }
    if (!emp) throw new Error('Employee not found');
    if (String(emp.password ?? '') !== String(payload.password ?? '')) throw new Error('Invalid password');
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const timeIn = today.toTimeString().slice(0, 8);
    // Insert attendance (replace if exists for today)
    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(emp.id, date) as any;
    if (existing) {
        db.prepare('UPDATE attendance SET time_in = ?, status = ?, synced = 0 WHERE id = ?').run(timeIn, 'Present', existing.id);
    } else {
        db.prepare('INSERT INTO attendance (employee_id, date, time_in, status, synced) VALUES (?, ?, ?, ?, 0)').run(emp.id, date, timeIn, 'Present');
    }
    // Update last_login
    db.prepare('UPDATE employees SET last_login = ?, synced = 0 WHERE id = ?').run(new Date().toISOString(), emp.id);
    return {
        message: 'Check-in successful',
        user: {
            id: emp.id,
            empId: emp.emp_id,
            name: emp.name,
            role: emp.role
        }
    };
});

ipcMain.handle('attendance:checkout', async (_e, payload: any) => {
    const db = getSQLite();
    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(payload.employeeId) as any;
    if (!emp) throw new Error('Employee not found');
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    const timeOut = today.toTimeString().slice(0, 8);
    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(emp.id, date) as any;
    if (!existing) {
        // No check-in, create record with only time_out
        db.prepare('INSERT INTO attendance (employee_id, date, time_out, status, synced) VALUES (?, ?, ?, ?, 0)').run(emp.id, date, timeOut, 'Present');
    } else {
        db.prepare('UPDATE attendance SET time_out = ?, status = ?, synced = 0 WHERE id = ?').run(timeOut, 'Present', existing.id);
    }
    return { success: true };
});

// Payroll IPC
ipcMain.handle('payroll:add-record', async (_e, payload: any) => {
    const db = getSQLite();
    const info = db.prepare(`
        INSERT INTO payroll_records (
            employee_name, emp_id, role, month, year, basic_salary, deductions, net_salary, status, payment_date, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
        payload.employeeName ?? '',
        payload.empId ?? '',
        payload.role ?? '',
        Number(payload.month ?? 0),
        Number(payload.year ?? 0),
        Number(payload.basicSalary ?? 0),
        Number(payload.deductions ?? 0),
        Number(payload.netSalary ?? 0),
        payload.status ?? 'Pending',
        payload.paymentDate ?? null
    );
    const row = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(info.lastInsertRowid as number) as any;
    return {
        id: row.id,
        employeeName: row.employee_name,
        empId: row.emp_id,
        role: row.role,
        month: String(row.month),
        year: String(row.year),
        basicSalary: Number(row.basic_salary),
        deductions: Number(row.deductions ?? 0),
        netSalary: Number(row.net_salary),
        status: row.status ?? 'Pending',
        paymentDate: row.payment_date ?? undefined
    };
});

ipcMain.handle('payroll:update-record', async (_e, payload: any) => {
    const db = getSQLite();
    db.prepare(`
        UPDATE payroll_records SET
            employee_name = ?, emp_id = ?, role = ?, month = ?, year = ?, basic_salary = ?,
            deductions = ?, net_salary = ?, status = ?, payment_date = ?, synced = 0
        WHERE id = ?
    `).run(
        payload.employeeName ?? '',
        payload.empId ?? '',
        payload.role ?? '',
        Number(payload.month ?? 0),
        Number(payload.year ?? 0),
        Number(payload.basicSalary ?? 0),
        Number(payload.deductions ?? 0),
        Number(payload.netSalary ?? 0),
        payload.status ?? 'Pending',
        payload.paymentDate ?? null,
        payload.id
    );
    const row = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(payload.id) as any;
    return {
        id: row.id,
        employeeName: row.employee_name,
        empId: row.emp_id,
        role: row.role,
        month: String(row.month),
        year: String(row.year),
        basicSalary: Number(row.basic_salary),
        deductions: Number(row.deductions ?? 0),
        netSalary: Number(row.net_salary),
        status: row.status ?? 'Pending',
        paymentDate: row.payment_date ?? undefined
    };
});

ipcMain.handle('payroll:delete-record', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare('DELETE FROM payroll_records WHERE id = ?').run(id);
    return { success: true };
});

// E-Wallet: GCash
ipcMain.handle('ewallet:gcash:list', async () => {
    const db = getSQLite();
    const rows = db.prepare("SELECT * FROM gcash_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC").all();
    return rows.map(mapGCashRow);
});

ipcMain.handle('ewallet:gcash:add', async (_e, payload: any) => {
    const db = getSQLite();
    const info = db.prepare(`
        INSERT INTO gcash_records (
            amount, service_charge, transaction_type, charge_mop, reference_number, date, created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)
    `).run(
        Number(payload.amount ?? 0),
        Number(payload.serviceCharge ?? 0),
        payload.transactionType ?? '',
        payload.chargeMOP ?? '',
        payload.referenceNumber ?? '',
        payload.date ?? ''
    );
    const row = db.prepare('SELECT * FROM gcash_records WHERE id = ?').get(info.lastInsertRowid as number);
    return mapGCashRow(row);
});

ipcMain.handle('ewallet:gcash:update', async (_e, payload: any) => {
    const db = getSQLite();
    db.prepare(`
        UPDATE gcash_records SET
            amount = ?, service_charge = ?, transaction_type = ?, charge_mop = ?, reference_number = ?, date = ?,
            updated_at = datetime('now'), synced = 0
        WHERE id = ?
    `).run(
        Number(payload.amount ?? 0),
        Number(payload.serviceCharge ?? 0),
        payload.transactionType ?? '',
        payload.chargeMOP ?? '',
        payload.referenceNumber ?? '',
        payload.date ?? '',
        payload.id
    );
    const row = db.prepare('SELECT * FROM gcash_records WHERE id = ?').get(payload.id);
    return mapGCashRow(row);
});

ipcMain.handle('ewallet:gcash:delete', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare("UPDATE gcash_records SET deleted_at = datetime('now'), synced = 0 WHERE id = ?").run(id);
    return { success: true };
});

// E-Wallet: PayMaya
ipcMain.handle('ewallet:paymaya:list', async () => {
    const db = getSQLite();
    const rows = db.prepare("SELECT * FROM paymaya_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC").all();
    return rows.map(mapPayMayaRow);
});

ipcMain.handle('ewallet:paymaya:add', async (_e, payload: any) => {
    const db = getSQLite();
    const info = db.prepare(`
        INSERT INTO paymaya_records (
            amount, service_charge, transaction_type, charge_mop, reference_number, date, created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)
    `).run(
        Number(payload.amount ?? 0),
        Number(payload.serviceCharge ?? 0),
        payload.transactionType ?? '',
        payload.chargeMOP ?? '',
        payload.referenceNumber ?? '',
        payload.date ?? ''
    );
    const row = db.prepare('SELECT * FROM paymaya_records WHERE id = ?').get(info.lastInsertRowid as number);
    return mapPayMayaRow(row);
});

ipcMain.handle('ewallet:paymaya:update', async (_e, payload: any) => {
    const db = getSQLite();
    db.prepare(`
        UPDATE paymaya_records SET
            amount = ?, service_charge = ?, transaction_type = ?, charge_mop = ?, reference_number = ?, date = ?,
            updated_at = datetime('now'), synced = 0
        WHERE id = ?
    `).run(
        Number(payload.amount ?? 0),
        Number(payload.serviceCharge ?? 0),
        payload.transactionType ?? '',
        payload.chargeMOP ?? '',
        payload.referenceNumber ?? '',
        payload.date ?? '',
        payload.id
    );
    const row = db.prepare('SELECT * FROM paymaya_records WHERE id = ?').get(payload.id);
    return mapPayMayaRow(row);
});

ipcMain.handle('ewallet:paymaya:delete', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare("UPDATE paymaya_records SET deleted_at = datetime('now'), synced = 0 WHERE id = ?").run(id);
    return { success: true };
});

// E-Wallet: JuanPay
ipcMain.handle('ewallet:juanpay:list', async () => {
    const db = getSQLite();
    const rows = db.prepare("SELECT * FROM juanpay_records WHERE deleted_at IS NULL ORDER BY date DESC, id DESC").all();
    return rows.map(mapJuanPayRow);
});

ipcMain.handle('ewallet:juanpay:add', async (_e, payload: any) => {
    const db = getSQLite();
    const info = db.prepare(`
        INSERT INTO juanpay_records (
            date, beginnings, ending, sales, created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), 0)
    `).run(
        payload.date ?? '',
        payload.beginnings ?? '',
        Number(payload.ending ?? 0),
        Number(payload.sales ?? 0)
    );
    const row = db.prepare('SELECT * FROM juanpay_records WHERE id = ?').get(info.lastInsertRowid as number);
    return mapJuanPayRow(row);
});

ipcMain.handle('ewallet:juanpay:update', async (_e, payload: any) => {
    const db = getSQLite();
    db.prepare(`
        UPDATE juanpay_records SET
            date = ?, beginnings = ?, ending = ?, sales = ?, updated_at = datetime('now'), synced = 0
        WHERE id = ?
    `).run(
        payload.date ?? '',
        payload.beginnings ?? '',
        Number(payload.ending ?? 0),
        Number(payload.sales ?? 0),
        payload.id
    );
    const row = db.prepare('SELECT * FROM juanpay_records WHERE id = ?').get(payload.id);
    return mapJuanPayRow(row);
});

ipcMain.handle('ewallet:juanpay:delete', async (_e, id: number) => {
    const db = getSQLite();
    db.prepare("UPDATE juanpay_records SET deleted_at = datetime('now'), synced = 0 WHERE id = ?").run(id);
    return { success: true };
});
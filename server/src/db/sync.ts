import pg from 'pg';
import { getSQLite } from './sqlite';

// Define types for your database records
interface Employee {
    id: number;
    emp_id: string;
    name: string;
    role: string;
    contact?: string;
    status?: string;
    last_login?: string;
    address?: string;
    salary?: string;
    contact_name?: string;
    contact_number?: string;
    relationship?: string;
    password: string;
}

interface AttendanceRecord {
    id: number;
    employee_id: number;
    date: string;
    time_in: string;
    time_out?: string;
    status?: string;
    synced: number;
}

interface InventoryItem {
    id: number;
    product_name: string;
    category?: string;
    stock: number;
    status?: string;
    product_price?: number;
    total_amount?: number;
    description?: string;
    minimum_stock?: number;
}

interface SalesRecord {
    id: number;
    date: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    payment_method?: string;
    synced: number;
}

interface GCashRecord {
    id: number;
    amount: number;
    service_charge?: number;
    transaction_type?: string;
    charge_mop?: string;
    reference_number?: string;
    date: string;
    synced: number;
}

interface PayMayaRecord {
    id: number;
    amount: number;
    service_charge?: number;
    transaction_type?: string;
    charge_mop?: string;
    reference_number?: string;
    date: string;
    synced: number;
}

interface JuanPayRecord {
    id: number;
    date: string;
    beginnings?: string;
    ending?: number;
    sales?: number;
    synced: number;
}

interface PayrollRecord {
    id: number;
    employee_name: string;
    emp_id: string;
    role: string;
    month: number;
    year: number;
    basic_salary: number;
    deductions?: number;
    net_salary: number;
    status?: string;
    payment_date?: string;
    synced: number;
}

interface Category {
    id: number;
    category_name: string;
    color?: string;
}

// PostgreSQL connection (use your Neon connection string)
const pgClient = new pg.Client({
    connectionString: process.env.DATABASE_URL || 'your-neon-postgres-url-here',
    ssl: {
        rejectUnauthorized: false
    }
});

let isConnected = false;

async function ensureConnection() {
    if (!isConnected) {
        await pgClient.connect();
        isConnected = true;
        console.log('✅ Connected to PostgreSQL');
    }
}

// 📥 SYNC: PostgreSQL → SQLite (Pull data)
export async function syncFromPostgresToSQLite() {
    await ensureConnection();
    const sqlite = getSQLite();

    try {
        // Sync employees
        console.log('📥 Syncing employees from PostgreSQL...');
        const employeesResult = await pgClient.query<Employee>('SELECT * FROM employees');
        
        const insertEmployee = sqlite.prepare(`
            INSERT OR REPLACE INTO employees 
            (id, emp_id, name, role, contact, status, last_login, avatar, address, salary, 
             contact_name, contact_number, relationship, password, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        
        const syncEmployees = sqlite.transaction((employees: any[]) => {
            for (const emp of employees) {
                insertEmployee.run(
                    emp.id,
                    emp.emp_id,
                    emp.name,
                    emp.role,
                    emp.contact || null,
                    emp.status || null,
                    emp.last_login || null,
                    emp.avatar || null,
                    emp.address || null,
                    emp.salary || null,
                    emp.contact_name || null,
                    emp.contact_number || null,
                    emp.relationship || null,
                    emp.password
                );
            }
        });
        
        syncEmployees(employeesResult.rows);
        console.log(`✅ Synced ${employeesResult.rows.length} employees`);

        // Sync categories
        console.log('📥 Syncing categories from PostgreSQL...');
        const categoriesResult = await pgClient.query<Category>('SELECT * FROM categories');
        
        const insertCategory = sqlite.prepare(`
            INSERT OR REPLACE INTO categories (id, category_name, color, synced)
            VALUES (?, ?, ?, 1)
        `);
        
        const syncCategories = sqlite.transaction((categories: Category[]) => {
            for (const cat of categories) {
                insertCategory.run(cat.id, cat.category_name, cat.color || null);
            }
        });
        
        syncCategories(categoriesResult.rows);
        console.log(`✅ Synced ${categoriesResult.rows.length} categories`);

        // Sync inventory
        console.log('📥 Syncing inventory from PostgreSQL...');
        const inventoryResult = await pgClient.query<InventoryItem>('SELECT * FROM inventory_items');
        
        const insertInventory = sqlite.prepare(`
            INSERT OR REPLACE INTO inventory_items 
            (id, product_name, category, stock, status, product_price, total_amount, 
             description, minimum_stock, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);
        
        const syncInventory = sqlite.transaction((items: InventoryItem[]) => {
            for (const item of items) {
                insertInventory.run(
                    item.id,
                    item.product_name,
                    item.category || null,
                    item.stock,
                    item.status || null,
                    item.product_price || null,
                    item.total_amount || null,
                    item.description || null,
                    item.minimum_stock || null
                );
            }
        });
        
        syncInventory(inventoryResult.rows);
        console.log(`✅ Synced ${inventoryResult.rows.length} inventory items`);

        // Sync attendance (last 30 days only)
        console.log('📥 Syncing recent attendance from PostgreSQL...');
        const attendanceResult = await pgClient.query<AttendanceRecord>(`
            SELECT * FROM attendance 
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY date DESC
        `);
        
        const insertAttendance = sqlite.prepare(`
            INSERT OR REPLACE INTO attendance 
            (id, employee_id, date, time_in, time_out, status, synced)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `);
        
        const syncAttendance = sqlite.transaction((records: AttendanceRecord[]) => {
            for (const record of records) {
                insertAttendance.run(
                    record.id,
                    record.employee_id,
                    record.date,
                    record.time_in,
                    record.time_out || null,
                    record.status || null
                );
            }
        });
        
        syncAttendance(attendanceResult.rows);
        console.log(`✅ Synced ${attendanceResult.rows.length} attendance records`);

        // Sync sales records (last 30 days)
        console.log('📥 Syncing recent sales from PostgreSQL...');
        const salesResult = await pgClient.query<SalesRecord>(`
            SELECT * FROM sales_records 
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY date DESC
        `);
        
        const insertSales = sqlite.prepare(`
            INSERT OR REPLACE INTO sales_records 
            (id, date, product_name, quantity, price, total, payment_method, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `);
        
        const syncSales = sqlite.transaction((records: SalesRecord[]) => {
            for (const record of records) {
                insertSales.run(
                    record.id,
                    record.date,
                    record.product_name,
                    record.quantity,
                    record.price,
                    record.total,
                    record.payment_method || null
                );
            }
        });
        
        syncSales(salesResult.rows);
        console.log(`✅ Synced ${salesResult.rows.length} sales records`);

    } catch (error) {
        console.error('❌ Error syncing from PostgreSQL:', error);
        throw error;
    }
}

// 📤 SYNC: SQLite → PostgreSQL (Push changes)
export async function syncFromSQLiteToPostgres() {
    await ensureConnection();
    const sqlite = getSQLite();

    try {
        // Sync unsynced attendance records
        console.log('📤 Pushing unsynced attendance to PostgreSQL...');
        const unsyncedAttendance = sqlite.prepare('SELECT * FROM attendance WHERE synced = 0').all() as AttendanceRecord[];
        
        for (const record of unsyncedAttendance) {
            const existing = await pgClient.query(
                'SELECT id FROM attendance WHERE id = $1',
                [record.id]
            );

            if (existing.rows.length > 0) {
                await pgClient.query(
                    `UPDATE attendance 
                     SET employee_id = $1, date = $2, time_in = $3, time_out = $4, status = $5
                     WHERE id = $6`,
                    [record.employee_id, record.date, record.time_in, record.time_out, record.status, record.id]
                );
            } else {
                await pgClient.query(
                    `INSERT INTO attendance (employee_id, date, time_in, time_out, status) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [record.employee_id, record.date, record.time_in, record.time_out, record.status]
                );
            }
            
            sqlite.prepare('UPDATE attendance SET synced = 1 WHERE id = ?').run(record.id);
        }
        console.log(`✅ Pushed ${unsyncedAttendance.length} attendance records`);

        // Sync unsynced sales
        console.log('📤 Pushing unsynced sales to PostgreSQL...');
        const unsyncedSales = sqlite.prepare('SELECT * FROM sales_records WHERE synced = 0').all() as SalesRecord[];
        
        for (const sale of unsyncedSales) {
            await pgClient.query(
                `INSERT INTO sales_records (date, product_name, quantity, price, total, payment_method) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [sale.date, sale.product_name, sale.quantity, sale.price, sale.total, sale.payment_method]
            );
            
            sqlite.prepare('UPDATE sales_records SET synced = 1 WHERE id = ?').run(sale.id);
        }
        console.log(`✅ Pushed ${unsyncedSales.length} sales records`);

        // Sync unsynced GCash records
        console.log('📤 Pushing unsynced GCash records to PostgreSQL...');
        const unsyncedGCash = sqlite.prepare('SELECT * FROM gcash_records WHERE synced = 0').all() as GCashRecord[];
        
        for (const record of unsyncedGCash) {
            await pgClient.query(
                `INSERT INTO gcash_records (amount, service_charge, transaction_type, charge_mop, reference_number, date) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [record.amount, record.service_charge, record.transaction_type, record.charge_mop, record.reference_number, record.date]
            );
            
            sqlite.prepare('UPDATE gcash_records SET synced = 1 WHERE id = ?').run(record.id);
        }
        console.log(`✅ Pushed ${unsyncedGCash.length} GCash records`);

        // Sync unsynced PayMaya records
        console.log('📤 Pushing unsynced PayMaya records to PostgreSQL...');
        const unsyncedPayMaya = sqlite.prepare('SELECT * FROM paymaya_records WHERE synced = 0').all() as PayMayaRecord[];
        
        for (const record of unsyncedPayMaya) {
            await pgClient.query(
                `INSERT INTO paymaya_records (amount, service_charge, transaction_type, charge_mop, reference_number, date) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [record.amount, record.service_charge, record.transaction_type, record.charge_mop, record.reference_number, record.date]
            );
            
            sqlite.prepare('UPDATE paymaya_records SET synced = 1 WHERE id = ?').run(record.id);
        }
        console.log(`✅ Pushed ${unsyncedPayMaya.length} PayMaya records`);

        // Sync unsynced JuanPay records
        console.log('📤 Pushing unsynced JuanPay records to PostgreSQL...');
        const unsyncedJuanPay = sqlite.prepare('SELECT * FROM juanpay_records WHERE synced = 0').all() as JuanPayRecord[];
        
        for (const record of unsyncedJuanPay) {
            await pgClient.query(
                `INSERT INTO juanpay_records (date, beginnings, ending, sales) 
                 VALUES ($1, $2, $3, $4)`,
                [record.date, record.beginnings, record.ending, record.sales]
            );
            
            sqlite.prepare('UPDATE juanpay_records SET synced = 1 WHERE id = ?').run(record.id);
        }
        console.log(`✅ Pushed ${unsyncedJuanPay.length} JuanPay records`);

        // Sync unsynced payroll records
        console.log('📤 Pushing unsynced payroll records to PostgreSQL...');
        const unsyncedPayroll = sqlite.prepare('SELECT * FROM payroll_records WHERE synced = 0').all() as PayrollRecord[];
        
        for (const record of unsyncedPayroll) {
            await pgClient.query(
                `INSERT INTO payroll_records (employee_name, emp_id, role, month, year, basic_salary, deductions, net_salary, status, payment_date) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [record.employee_name, record.emp_id, record.role, record.month, record.year, record.basic_salary, 
                 record.deductions, record.net_salary, record.status, record.payment_date]
            );
            
            sqlite.prepare('UPDATE payroll_records SET synced = 1 WHERE id = ?').run(record.id);
        }
        console.log(`✅ Pushed ${unsyncedPayroll.length} payroll records`);

    } catch (error) {
        console.error('❌ Error syncing to PostgreSQL:', error);
        throw error;
    }
}

// Close PostgreSQL connection
export async function closePostgresConnection() {
    if (isConnected) {
        await pgClient.end();
        isConnected = false;
        console.log('🔒 PostgreSQL connection closed');
    }
}
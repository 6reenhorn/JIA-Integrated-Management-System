import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let sqlite: Database.Database | null = null;

export function initializeSQLite(): Database.Database {
    if (sqlite) {
        console.log('⚠️ SQLite already initialized');
        return sqlite;
    }

    const dbPath = path.join(app.getPath('userData'), 'jims_offline.db');
    console.log('📁 SQLite DB path:', dbPath);
    
    sqlite = new Database(dbPath);
    
    // Enable foreign keys for data integrity
    sqlite.pragma('foreign_keys = ON');
    
    // Create mirror tables for offline database (matching PostgreSQL schema)
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id TEXT UNIQUE,
            name TEXT,
            role TEXT,
            contact TEXT,
            status TEXT,
            last_login TEXT,
            avatar TEXT,
            address TEXT,
            salary TEXT,
            contact_name TEXT,
            contact_number TEXT,
            relationship TEXT,
            password TEXT,
            synced INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            date TEXT,
            time_in TEXT,
            time_out TEXT,
            status TEXT,
            synced INTEGER DEFAULT 0,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        );

        CREATE TABLE IF NOT EXISTS gcash_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount NUMERIC,
            service_charge NUMERIC,
            transaction_type TEXT,
            charge_mop TEXT,
            reference_number TEXT,
            date TEXT,
            created_at TEXT,
            updated_at TEXT,
            deleted_at TEXT,
            synced INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS paymaya_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount NUMERIC,
            service_charge NUMERIC,
            transaction_type TEXT,
            charge_mop TEXT,
            reference_number TEXT,
            date TEXT,
            created_at TEXT,
            updated_at TEXT,
            deleted_at TEXT,
            synced INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS juanpay_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            beginnings TEXT,
            ending NUMERIC,
            sales NUMERIC,
            created_at TEXT,
            updated_at TEXT,
            deleted_at TEXT,
            synced INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS inventory_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT,
            category TEXT,
            stock INTEGER,
            status TEXT,
            product_price NUMERIC,
            total_amount NUMERIC,
            description TEXT,
            minimum_stock INTEGER,
            created_at TEXT,
            updated_at TEXT,
            synced INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT UNIQUE,
            color TEXT,
            created_at TEXT,
            synced INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS sales_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            product_name TEXT,
            quantity INTEGER,
            price NUMERIC,
            total NUMERIC,
            payment_method TEXT,
            created_at TEXT,
            updated_at TEXT,
            synced INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS payroll_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_name TEXT,
            emp_id TEXT,
            role TEXT,
            month INTEGER,
            year INTEGER,
            basic_salary NUMERIC,
            deductions NUMERIC,
            net_salary NUMERIC,
            status TEXT,
            payment_date TEXT,
            synced INTEGER DEFAULT 0
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
        CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
        CREATE INDEX IF NOT EXISTS idx_attendance_synced ON attendance(synced);
        CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(date);
        CREATE INDEX IF NOT EXISTS idx_sales_synced ON sales_records(synced);
        CREATE INDEX IF NOT EXISTS idx_gcash_synced ON gcash_records(synced);
        CREATE INDEX IF NOT EXISTS idx_paymaya_synced ON paymaya_records(synced);
        CREATE INDEX IF NOT EXISTS idx_juanpay_synced ON juanpay_records(synced);
        CREATE INDEX IF NOT EXISTS idx_payroll_synced ON payroll_records(synced);
    `);
    
    console.log('✅ SQLite database initialized with all tables');
    return sqlite;
}

export function getSQLite(): Database.Database {
    if (!sqlite) {
        throw new Error('❌ SQLite not initialized. Call initializeSQLite() first.');
    }
    return sqlite;
}

export function closeSQLite() {
    if (sqlite) {
        sqlite.close();
        sqlite = null;
        console.log('🔒 SQLite database closed');
    }
}

// Optional: Helper functions for common operations
export function getAllUnsyncedRecords() {
    const db = getSQLite();
    
    return {
        attendance: db.prepare('SELECT * FROM attendance WHERE synced = 0').all(),
        gcash: db.prepare('SELECT * FROM gcash_records WHERE synced = 0').all(),
        paymaya: db.prepare('SELECT * FROM paymaya_records WHERE synced = 0').all(),
        juanpay: db.prepare('SELECT * FROM juanpay_records WHERE synced = 0').all(),
        sales: db.prepare('SELECT * FROM sales_records WHERE synced = 0').all(),
        payroll: db.prepare('SELECT * FROM payroll_records WHERE synced = 0').all()
    };
}

export function markAsSynced(table: string, id: number) {
    const db = getSQLite();
    db.prepare(`UPDATE ${table} SET synced = 1 WHERE id = ?`).run(id);
}
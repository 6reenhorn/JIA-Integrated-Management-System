import { getSQLite } from './sqlite';

export class DBHelper {
    // Read operations
    static getAll(table: string, orderBy?: string) {
        const sqlite = getSQLite();
        const order = orderBy ? `ORDER BY ${orderBy}` : '';
        return sqlite.prepare(`SELECT * FROM ${table} ${order}`).all();
    }
    
    static getById(table: string, id: number | string) {
        const sqlite = getSQLite();
        return sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    }

    static getByField(table: string, field: string, value: any) {
        const sqlite = getSQLite();
        return sqlite.prepare(`SELECT * FROM ${table} WHERE ${field} = ?`).get(value);
    }

    static getAllByField(table: string, field: string, value: any) {
        const sqlite = getSQLite();
        return sqlite.prepare(`SELECT * FROM ${table} WHERE ${field} = ?`).all(value);
    }

    static getWhere(table: string, conditions: Record<string, any>) {
        const sqlite = getSQLite();
        const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(conditions);
        return sqlite.prepare(`SELECT * FROM ${table} WHERE ${whereClause}`).all(...values);
    }
    
    // Write operations (marks as unsynced)
    static insert(table: string, data: Record<string, any>) {
        const sqlite = getSQLite();
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        return sqlite.prepare(`
            INSERT INTO ${table} (${columns}, synced)
            VALUES (${placeholders}, 0)
        `).run(...values);
    }
    
    static update(table: string, id: number | string, data: Record<string, any>) {
        const sqlite = getSQLite();
        const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];
        
        return sqlite.prepare(`
            UPDATE ${table}
            SET ${sets}, synced = 0
            WHERE id = ?
        `).run(...values);
    }

    static delete(table: string, id: number | string) {
        const sqlite = getSQLite();
        return sqlite.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    }

    static softDelete(table: string, id: number | string) {
        const sqlite = getSQLite();
        return sqlite.prepare(`
            UPDATE ${table}
            SET deleted_at = CURRENT_TIMESTAMP, synced = 0
            WHERE id = ?
        `).run(id);
    }

    // Transaction support
    static transaction(callback: () => void) {
        const sqlite = getSQLite();
        return sqlite.transaction(callback)();
    }

    // Custom query execution
    static execute(sql: string, params: any[] = []) {
        const sqlite = getSQLite();
        return sqlite.prepare(sql).run(...params);
    }

    static query(sql: string, params: any[] = []) {
        const sqlite = getSQLite();
        return sqlite.prepare(sql).all(...params);
    }

    static queryOne(sql: string, params: any[] = []) {
        const sqlite = getSQLite();
        return sqlite.prepare(sql).get(...params);
    }
}

export default DBHelper;
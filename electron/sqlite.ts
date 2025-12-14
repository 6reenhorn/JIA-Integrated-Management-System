// Shim that re-exports SQLite helpers from the server TS module.
// This allows Electron's build to output a local JS module we can import from main.
// Using dynamic import to handle CommonJS exports from server code

let sqliteModule: any = null;

async function loadSqliteModule() {
    if (!sqliteModule) {
        const moduleUrl = new URL('./server/src/db/sqlite.js', import.meta.url).href;
        sqliteModule = await import(moduleUrl);
    }
    return sqliteModule;
}

export function initializeSQLite() {
    return loadSqliteModule().then(mod => mod.initializeSQLite());
}

export async function getSQLite() {
    const mod = await loadSqliteModule();
    return mod.getSQLite();
}

export async function closeSQLite() {
    const mod = await loadSqliteModule();
    return mod.closeSQLite();
}

export async function getAllUnsyncedRecords() {
    const mod = await loadSqliteModule();
    return mod.getAllUnsyncedRecords();
}

export async function markAsSynced(id: any) {
    const mod = await loadSqliteModule();
    return mod.markAsSynced(id);
}

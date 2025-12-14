// Shim that re-exports sync helpers from the server TS module.
// Using dynamic import to handle CommonJS exports from server code

let syncModule: any = null;

async function loadSyncModule() {
    if (!syncModule) {
        const moduleUrl = new URL('./server/src/db/sync.js', import.meta.url).href;
        syncModule = await import(moduleUrl);
    }
    return syncModule;
}

export async function syncFromPostgresToSQLite() {
    const mod = await loadSyncModule();
    return mod.syncFromPostgresToSQLite();
}

export async function syncFromSQLiteToPostgres() {
    const mod = await loadSyncModule();
    return mod.syncFromSQLiteToPostgres();
}

export async function closePostgresConnection() {
    const mod = await loadSyncModule();
    return mod.closePostgresConnection();
}

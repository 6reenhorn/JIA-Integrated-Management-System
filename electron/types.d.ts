declare module './sync.js' {
  export function syncFromPostgresToSQLite(): Promise<void>;
  export function syncFromSQLiteToPostgres(): Promise<void>;
  export function closePostgresConnection(): Promise<void>;
}

declare module './sqlite.js' {
  export function initializeSQLite(): any;
  export function getSQLite(): any;
  export function closeSQLite(): void;
  export function getAllUnsyncedRecords(): any;
  export function markAsSynced(table: string, id: number): void;
}

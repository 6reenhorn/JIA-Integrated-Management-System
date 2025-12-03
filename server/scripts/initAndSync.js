const { syncDatabase } = require('../src/db/initSQLite');
const { initializeSync, startSyncInterval } = require('../src/services/dbSyncService');

const initializeAndSync = async () => {
  try {
    console.log('Initializing SQLite database...');
    await syncDatabase();
    
    console.log('\nStarting initial database synchronization...');
    const syncResult = await initializeSync();
    
    if (syncResult.success) {
      console.log('\nInitial synchronization completed successfully!');
      syncResult.results.forEach(result => {
        console.log(`- ${result.table}: Synced ${result.synced} records`);
      });
      
      // Start periodic sync
      startSyncInterval(5); // Sync every 5 minutes
      
      console.log('\nDatabase synchronization is now running in the background.');
      console.log('The system will automatically sync changes between SQLite and PostgreSQL.');
    } else {
      console.error('\nInitial synchronization failed:', syncResult.error);
    }
  } catch (error) {
    console.error('Error during initialization and sync:', error);
    process.exit(1);
  }
};

// Run the initialization and sync
initializeAndSync().catch(console.error);

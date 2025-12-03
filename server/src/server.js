const app = require('./app').default || require('./app');
const { syncDatabase: syncPostgres } = require('./db/initPostgres');
const { syncDatabase: initSQLite } = require('./db/initSQLite');
const { dbHelper } = require('./db/dbHelper');  // Changed this line
const { initializeSync } = require('./services/dbSyncService');

const PORT = process.env.PORT || 3001;
const SYNC_INTERVAL_MINUTES = process.env.SYNC_INTERVAL_MINUTES || 5;

const startServer = async () => {
  try {
    console.log('Initializing databases...');
    
    // Initialize SQLite database
    if (process.env.USE_SQLITE !== 'false') {
      console.log('Initializing SQLite database...');
      try {
        await initSQLite();
        console.log('SQLite database initialized successfully');
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
        process.exit(1);
      }
    }

    // Initialize PostgreSQL database
    if (process.env.USE_POSTGRES !== 'false') {
      console.log('Initializing PostgreSQL database...');
      try {
        await syncPostgres();
        console.log('PostgreSQL database initialized');
      } catch (err) {
        console.error('Failed to initialize PostgreSQL database:', err);
        process.exit(1);
      }
    }

    // Start the sync service if both databases are enabled
    if (process.env.USE_SQLITE !== 'false' && process.env.USE_POSTGRES !== 'false') {
      console.log('Starting database synchronization...');
      try {
        await initializeSync();
        console.log('Initial database sync completed');
        
        // Start periodic sync
        const syncInterval = setInterval(async () => {
          try {
            console.log('Running scheduled database sync...');
            await initializeSync();
          } catch (err) {
            console.error('Error during scheduled sync:', err);
          }
        }, SYNC_INTERVAL_MINUTES * 60 * 1000);
        
        console.log(`Database sync scheduled to run every ${SYNC_INTERVAL_MINUTES} minutes`);
        
        // Store interval for cleanup
        process.on('exit', () => clearInterval(syncInterval));
      } catch (err) {
        console.error('Failed to initialize database sync:', err);
        process.exit(1);
      }
    }

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Using database: ${
        process.env.USE_SQLITE !== 'false' ? 'SQLite' : ''
      }${
        process.env.USE_SQLITE !== 'false' && process.env.USE_POSTGRES !== 'false' ? ' and ' : ''
      }${
        process.env.USE_POSTGRES !== 'false' ? 'PostgreSQL' : ''
      }`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      
      // Close the server
      server.close(async (err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        // Close database connections
        try {
          if (dbHelper && typeof dbHelper.close === 'function') {
            await dbHelper.close();
          }
          console.log('Database connections closed');
          process.exit(0);
        } catch (dbErr) {
          console.error('Error closing database connections:', dbErr);
          process.exit(1);
        }
      });
    };

    // Handle termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
startServer().catch(err => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
/* eslint-disable */
// Entry point to start the Express server
require('dotenv').config();

const app = require('./app').default || require('./app');
const { syncDatabase } = require('./db/sync');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await syncDatabase();
    app.listen(PORT, () => {
      // Keep this console.log concise; useful during local dev
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
};

startServer();


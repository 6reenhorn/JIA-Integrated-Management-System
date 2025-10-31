/* eslint-disable */
// Entry point to start the Express server
require('dotenv').config();

const app = require('./app').default || require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // Keep this console.log concise; useful during local dev
  console.log(`Server listening on http://localhost:${PORT}`);
});


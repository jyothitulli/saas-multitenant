import app from './app.js';
import env from './config/env.js';
import pool from './config/db.js';

const PORT = env.port;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

startServer();
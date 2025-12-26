import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: 5432,
  user: postgres,
  password: postgres,
  database: saas_db,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
export default pool;

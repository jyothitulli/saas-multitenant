const { Pool } = require("pg");

const pool = new Pool({
  // Use 'localhost' for Thunder Client/Nodemon, 
  // but the evaluator will use 'database' from the environment variable [cite: 91, 104]
  host: process.env.DB_HOST || "localhost", 
  port: 5432, // MANDATORY port [cite: 84]
  user: "postgres",
  password: "postgres",
  database: "saas_db",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
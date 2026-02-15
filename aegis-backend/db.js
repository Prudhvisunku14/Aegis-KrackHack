const { Pool } = require('pg');

const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

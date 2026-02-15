require('dotenv').config();
const db = require('../db');

(async () => {
  try {
    const info = await db.query("SELECT current_database() AS db, current_user AS user");
    console.log('connection_ok', JSON.stringify(info.rows[0] || {}));

    const exists = await db.query('SELECT datname FROM pg_database WHERE datname = $1', [process.env.DB_NAME]);
    console.log('database_exists', exists.rowCount > 0);

    const version = await db.query('SELECT version()');
    console.log('pg_version', version.rows[0].version);

    process.exit(0);
  } catch (err) {
    console.error('error', err && err.message ? err.message : err);
    process.exit(2);
  }
})();

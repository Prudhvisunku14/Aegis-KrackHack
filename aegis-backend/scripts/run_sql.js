const fs = require('fs');
const path = require('path');
const db = require('../db');

async function run() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/run_sql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), fileArg);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await db.pool.query(sql);
    console.log('SQL executed successfully:', sqlPath);
    process.exit(0);
  } catch (err) {
    console.error('SQL execution failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

run();

require('dotenv').config();
const db = require('../db');

const table = process.argv[2];
if (!table) {
  console.error('Usage: node inspect-table.js <table_name>');
  process.exit(2);
}

(async () => {
  try {
    const r = await db.query("SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table]);
    console.log(`columns for ${table}:`);
    console.table(r.rows);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();

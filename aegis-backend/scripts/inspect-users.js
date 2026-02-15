const db = require('../db');

(async () => {
  try {
    const q = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`;
    const r = await db.query(q);
    console.log(r.rows);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();

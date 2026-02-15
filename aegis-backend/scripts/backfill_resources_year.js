require('dotenv').config();
const db = require('../db');

(async ()=>{
  try {
    const q1 = await db.query("SELECT year_id FROM academic_year ORDER BY year_id DESC LIMIT 1");
    if (!q1.rows.length) {
      console.log('NO_YEAR');
      process.exit(0);
    }
    const latest = q1.rows[0].year_id;
    console.log('LATEST_YEAR', latest);
    const upd = await db.query('UPDATE academic_resources SET year_id = $1 WHERE year_id IS NULL RETURNING resource_id', [latest]);
    console.log('UPDATED_COUNT', upd.rowCount);
    if (upd.rowCount) console.log(JSON.stringify(upd.rows.slice(0,20), null, 2));
  } catch (e) {
    console.error('ERR', e.message || e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();

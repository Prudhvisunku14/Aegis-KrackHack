require('dotenv').config();
const db = require('../db');

(async ()=>{
  try {
    const r = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' 
      ORDER BY table_name
    `);
    console.log('ALL_TABLES:', JSON.stringify(r.rows.map(x=>x.table_name)));
    
    // Check specific tables
    const relevant = r.rows.filter(x => {
      const name = x.table_name.toLowerCase();
      return name.includes('opportunity') || name.includes('applic') || 
             name.includes('task') || name.includes('bookmark') || 
             name.includes('message');
    });
    console.log('PILLAR_IV_TABLES:', JSON.stringify(relevant.map(x=>x.table_name)));
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();

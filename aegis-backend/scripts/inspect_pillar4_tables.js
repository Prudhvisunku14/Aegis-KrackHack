require('dotenv').config();
const db = require('../db');

(async ()=>{
  try {
    const tables = ['opportunities', 'applications', 'bookmarks', 'opportunity_messages', 'tasks'];
    
    for (const t of tables) {
      const r = await db.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name='${t}' 
        ORDER BY ordinal_position
      `);
      console.log(`\n${t.toUpperCase()} SCHEMA:`);
      console.log(JSON.stringify(r.rows, null, 2));
    }
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();

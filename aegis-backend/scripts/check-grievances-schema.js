require('dotenv').config();
const db = require('../db');

async function checkGrievancesSchema() {
  try {
    const result = await db.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'grievances' ORDER BY ordinal_position`
    );
    console.log('\n=== GRIEVANCES TABLE SCHEMA ===\n');
    result.rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkGrievancesSchema();

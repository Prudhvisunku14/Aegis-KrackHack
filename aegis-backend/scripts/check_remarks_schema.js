require('dotenv').config();
const db = require('../db');

async function checkRemarksSchema() {
  try {
    const result = await db.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'grievance_remarks' ORDER BY ordinal_position`
    );
    console.log('\n=== GRIEVANCE_REMARKS TABLE SCHEMA ===\n');
    if (result.rows.length === 0) {
      console.log('Table not found');
    } else {
      result.rows.forEach(row => {
        console.log(`${row.column_name} (${row.data_type})`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkRemarksSchema();

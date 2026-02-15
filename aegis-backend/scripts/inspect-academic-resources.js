require('dotenv').config();
const db = require('../db');

async function inspect() {
  try {
    const { rows } = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='academic_resources' ORDER BY ordinal_position`);
    console.log('academic_resources columns:');
    rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
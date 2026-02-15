require('dotenv').config();
const db = require('../db');

async function inspect() {
  try {
    const { rows } = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='resource_tags' ORDER BY ordinal_position`);
    console.log('resource_tags columns:');
    rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));

    const { rows: mapRows } = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='resource_tag_map' ORDER BY ordinal_position`);
    console.log('\nresource_tag_map columns:');
    mapRows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspect();
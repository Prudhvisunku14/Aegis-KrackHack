require('dotenv').config();
const db = require('../db');

(async () => {
  try {
    const tablesRes = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tables = tablesRes.rows.map(r => r.table_name).sort();
    console.log('tables:', tables.join(', '));

    const usersCols = await db.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position");
    console.log('\nusers columns:\n', usersCols.rows);

    const rolesExists = await db.query("SELECT to_regclass('public.roles') IS NOT NULL as roles_table");
    console.log('\nroles table exists:', rolesExists.rows[0].roles_table);

    if (rolesExists.rows[0].roles_table) {
      const rolesCols = await db.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='roles'");
      console.log('\nroles columns:\n', rolesCols.rows);
      const rolesData = await db.query('SELECT * FROM roles LIMIT 20');
      console.log('\nroles sample rows:\n', rolesData.rows);
    }

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();

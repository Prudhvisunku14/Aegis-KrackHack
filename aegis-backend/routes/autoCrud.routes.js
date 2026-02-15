const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

async function getTables() {
  const { rows } = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'"
  );
  return rows.map(r => r.table_name);
}

async function getColumns(table) {
  const { rows } = await db.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`,
    [table]
  );
  return rows;
}

async function getPrimaryKey(table) {
  const { rows } = await db.query(
    `
    SELECT a.attname AS column_name
    FROM   pg_index i
    JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE  i.indrelid = $1::regclass
    AND    i.indisprimary;
    `,
    [table]
  );
  return rows.length ? rows[0].column_name : null;
}

function hasManualRoute(table) {
  const file = path.join(__dirname, `${table}.js`);
  return fs.existsSync(file);
}

function sanitizeIdentifier(name) {
  // very small safety check — identifiers should be alphanumeric/_
  if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('Invalid identifier');
  return name;
}

async function buildRouterForTable(table) {
  const router = express.Router();
  const columns = await getColumns(table);
  const colNames = columns.map(c => c.column_name);
  const pk = (await getPrimaryKey(table)) || colNames[0];

  // require auth for all table endpoints (RBAC enforced where sensible)
  router.use(authenticateJWT);

  // List with simple filters & pagination
  function sanitizeRow(tbl, row) {
    if (!row) return row;
    const copy = { ...row };
    if (tbl === 'users') {
      delete copy.password_hash;
      delete copy.password;
    }
    return copy;
  }

  router.get('/', async (req, res) => {
    try {
      const qs = req.query || {};
      const allowedFilters = colNames;
      const whereClauses = [];
      const params = [];
      let idx = 1;
      Object.entries(qs).forEach(([k, v]) => {
        if (['limit', 'page', 'offset', 'sort'].includes(k)) return;
        if (!allowedFilters.includes(k)) return;
        whereClauses.push(`${k} = $${idx++}`);
        params.push(v);
      });

      const limit = Math.min(parseInt(qs.limit || 50, 10), 100);
      const page = Math.max(parseInt(qs.page || 1, 10), 1);
      const offset = (page - 1) * limit;

      const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const sort = qs.sort && colNames.includes(qs.sort) ? `ORDER BY ${qs.sort}` : '';
      const q = `SELECT * FROM ${sanitizeIdentifier(table)} ${where} ${sort} LIMIT ${limit} OFFSET ${offset}`;
      const { rows } = await db.query(q, params);
      return res.json({ data: rows.map(r => sanitizeRow(table, r)), meta: { page, limit } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Get by PK
  router.get(`/:id`, async (req, res) => {
    try {
      const q = `SELECT * FROM ${sanitizeIdentifier(table)} WHERE ${sanitizeIdentifier(pk)} = $1`;
      const { rows } = await db.query(q, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: 'not found' });
      return res.json(sanitizeRow(table, rows[0]));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Create
  router.post('/', authorizeRoles('student', 'faculty', 'authority', 'admin'), async (req, res) => {
    try {
      const payload = req.body || {};
      const keys = Object.keys(payload).filter(k => colNames.includes(k));
      if (keys.length === 0) return res.status(400).json({ message: 'no valid fields provided' });
      const vals = keys.map(k => payload[k]);
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
      const q = `INSERT INTO ${sanitizeIdentifier(table)} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await db.query(q, vals);
      return res.status(201).json(sanitizeRow(table, rows[0]));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Update
  router.put(`/:id`, authorizeRoles('student', 'faculty', 'authority', 'admin'), async (req, res) => {
    try {
      const payload = req.body || {};
      const keys = Object.keys(payload).filter(k => colNames.includes(k) && k !== pk);
      if (keys.length === 0) return res.status(400).json({ message: 'no valid fields to update' });
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const vals = keys.map(k => payload[k]);
      vals.push(req.params.id);
      const q = `UPDATE ${sanitizeIdentifier(table)} SET ${sets} WHERE ${sanitizeIdentifier(pk)} = $${vals.length} RETURNING *`;
      const { rows } = await db.query(q, vals);
      if (rows.length === 0) return res.status(404).json({ message: 'not found' });
      return res.json(sanitizeRow(table, rows[0]));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  // Delete — admin only
  router.delete(`/:id`, authorizeRoles('admin'), async (req, res) => {
    try {
      const q = `DELETE FROM ${sanitizeIdentifier(table)} WHERE ${sanitizeIdentifier(pk)} = $1 RETURNING *`;
      const { rows } = await db.query(q, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: 'not found' });
      return res.json({ deleted: true, row: rows[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });

  return router;
}

async function registerAutoCrud(app) {
  const tables = await getTables();
  for (const t of tables) {
    // skip some internal/managed tables if needed
    if (t.startsWith('pg_') || t === 'spatial_ref_sys') continue;
    // if a manual route file exists for this table, skip auto-generation
    if (hasManualRoute(t)) {
      console.log(`Skipping auto-CRUD for '${t}' (manual route exists)`);
      continue;
    }

    try {
      const router = await buildRouterForTable(t);
      app.use(`/api/${t}`, router);
      console.log(`Registered auto-CRUD routes for /api/${t}`);
    } catch (err) {
      console.error(`Failed to register routes for table ${t}:`, err.message);
    }
  }
}

module.exports = registerAutoCrud;
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function getColumns(table) {
  const { rows } = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1`,
    [table]
  );
  return rows.map(r => r.column_name);
}

async function findPasswordColumn() {
  const cols = await getColumns('users');
  if (cols.includes('password_hash')) return 'password_hash';
  if (cols.includes('password')) return 'password';
  return null;
}

async function findIdColumn() {
  const cols = await getColumns('users');
  if (cols.includes('id')) return 'id';
  if (cols.includes('user_id')) return 'user_id';
  return cols[0];
}

async function findEmailColumn() {
  const cols = await getColumns('users');
  if (cols.includes('institute_email')) return 'institute_email';
  if (cols.includes('email')) return 'email';
  if (cols.includes('user_email')) return 'user_email';
  return null;
}

async function getRoleName(role_id) {
  const { rows } = await db.query('SELECT role_name FROM roles WHERE role_id = $1', [role_id]);
  if (!rows.length) return null;
  return rows[0].role_name.toLowerCase();
}

async function findRoleIdByName(name) {
  const { rows } = await db.query('SELECT role_id FROM roles WHERE lower(role_name) = $1', [String(name).toLowerCase()]);
  if (!rows.length) return null;
  return rows[0].role_id;
}

exports.register = async (req, res) => {
  try {
    const emailCol = await findEmailColumn();
    const nameCol = (await getColumns('users')).includes('full_name') ? 'full_name' : (await getColumns('users')).includes('name') ? 'name' : null;
    const passCol = await findPasswordColumn();
    const idCol = await findIdColumn();

    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    if (!emailCol || !passCol) return res.status(500).json({ message: 'users table missing required columns' });

    // Institute email validation
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@iitmandi.ac.in')) {
      return res.status(400).json({ message: 'Only @iitmandi.ac.in email addresses allowed' });
    }

    // duplicate check
    const existing = await db.query(`SELECT * FROM users WHERE ${emailCol} = $1`, [emailLower]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'email already registered' });

    const hash = await bcrypt.hash(password, 10);

    const insertCols = [emailCol];
    const insertVals = [emailLower];

    if (nameCol && name) {
      insertCols.push(nameCol);
      insertVals.push(name);
    }

    insertCols.push(passCol);
    insertVals.push(hash);

    // role handling (map role name -> role_id)
    let roleId = null;
    if (role) roleId = await findRoleIdByName(role);
    if (!roleId) {
      // default to Student if available
      roleId = await findRoleIdByName('student');
    }
    if ((await getColumns('users')).includes('role_id')) {
      insertCols.push('role_id');
      insertVals.push(roleId);
    }

    const colList = insertCols.join(', ');
    const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');

    const result = await db.query(`INSERT INTO users (${colList}) VALUES (${placeholders}) RETURNING *`, insertVals);
    const user = result.rows[0];

    // attach role name
    const roleName = user.role_id ? await getRoleName(user.role_id) : 'student';

    if (passCol) delete user[passCol];
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured' });
    const token = jwt.sign({ id: user[idCol], user_id: user[idCol], email: user[emailCol], role: roleName }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const emailCol = await findEmailColumn();
    const passCol = await findPasswordColumn();
    const idCol = await findIdColumn();

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    if (!emailCol || !passCol) return res.status(500).json({ message: 'users table missing required columns' });

    const { rows } = await db.query(`SELECT * FROM users WHERE ${emailCol} = $1`, [email.toLowerCase()]);
    if (rows.length === 0) return res.status(401).json({ message: 'invalid credentials' });
    const user = rows[0];

    const stored = user[passCol];
    const ok = await bcrypt.compare(password, stored);
    if (!ok) return res.status(401).json({ message: 'invalid credentials' });

    const roleName = user.role_id ? await getRoleName(user.role_id) : 'student';
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET not configured' });
    const token = jwt.sign({ id: user[idCol], user_id: user[idCol], email: user[emailCol], role: roleName }, process.env.JWT_SECRET, { expiresIn: '8h' });
    if (passCol) delete user[passCol];
    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const idCol = await findIdColumn();
    const emailCol = await findEmailColumn();
    const passCol = await findPasswordColumn();
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const q = await db.query(`SELECT * FROM users WHERE ${idCol} = $1`, [userId]);
    if (q.rowCount === 0) return res.status(404).json({ message: 'user not found' });
    const user = q.rows[0];
    if (passCol) delete user[passCol];

    const roleName = user.role_id ? await getRoleName(user.role_id) : null;
    return res.json({ user: { ...user, role: roleName } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

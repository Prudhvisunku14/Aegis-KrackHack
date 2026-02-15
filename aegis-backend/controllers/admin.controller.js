const db = require('../db');

exports.listUsers = async (req, res) => {
  try {
    // Only admin/authority can list users
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const limit = Math.min(parseInt(req.query.limit || 50, 10), 100);
    const page = Math.max(parseInt(req.query.page || 1, 10), 1);
    const offset = (page - 1) * limit;

    const { rows: users } = await db.query(`
      SELECT u.user_id, u.institute_email, u.full_name, u.role_id, r.role_name, u.department_id, u.is_active, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const { rows: countRes } = await db.query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(countRes[0].total, 10);

    return res.json({ data: users, meta: { page, limit, total } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    // Only admin can update roles
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'only admin can assign roles' });
    }

    const { user_id } = req.params;
    const { role_id } = req.body;

    if (!role_id) return res.status(400).json({ message: 'role_id required' });

    // Verify role exists
    const roleCheck = await db.query('SELECT role_id FROM roles WHERE role_id = $1', [role_id]);
    if (roleCheck.rowCount === 0) return res.status(400).json({ message: 'invalid role_id' });

    const { rows } = await db.query(
      `UPDATE users SET role_id = $1 WHERE user_id = $2 RETURNING user_id, institute_email, full_name, role_id`,
      [role_id, user_id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'user not found' });

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)`,
        [req.user.user_id || req.user.id, 'ROLE_UPDATED', 'user', user_id]
      );
    } catch (logErr) {
      console.error('Activity log error:', logErr);
      // Don't fail the operation if logging fails
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    // Only admin can toggle user status
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'only admin can deactivate users' });
    }

    const { user_id } = req.params;
    const { is_active } = req.body;

    const { rows } = await db.query(
      `UPDATE users SET is_active = $1 WHERE user_id = $2 RETURNING user_id, institute_email, is_active`,
      [is_active, user_id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'user not found' });

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)`,
        [req.user.user_id || req.user.id, 'USER_STATUS_UPDATED', 'user', user_id]
      );
    } catch (logErr) {
      console.error('Activity log error:', logErr);
      // Don't fail the operation if logging fails
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    // Only admin/authority can view logs
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const limit = Math.min(parseInt(req.query.limit || 50, 10), 200);
    const page = Math.max(parseInt(req.query.page || 1, 10), 1);
    const offset = (page - 1) * limit;

    const { rows } = await db.query(`
      SELECT id, user_id, action, entity_type, entity_id, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return res.json({ data: rows, meta: { page, limit } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    // Only admin/authority
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'forbidden' });
    }

    const dbHealth = await db.query('SELECT 1');
    const { rows: userCount } = await db.query('SELECT COUNT(*) as count FROM users');
    const { rows: grievanceCount } = await db.query('SELECT COUNT(*) as count FROM grievances');
    const { rows: logCount } = await db.query('SELECT COUNT(*) as count FROM activity_logs');
    const { rows: oppCount } = await db.query('SELECT COUNT(*) as count FROM opportunities');
    const { rows: resourceCount } = await db.query('SELECT COUNT(*) as count FROM academic_resources');

    return res.json({
      db: dbHealth.rowCount > 0 ? 'connected' : 'error',
      users: parseInt(userCount[0].count, 10),
      grievances: parseInt(grievanceCount[0].count, 10),
      logs: parseInt(logCount[0].count, 10),
      opportunities: parseInt(oppCount[0].count, 10),
      resources: parseInt(resourceCount[0].count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const db = require('../db');

async function getColumns(table) {
  const { rows } = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1`,
    [table]
  );
  return rows.map(r => r.column_name);
}

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) acc[k] = obj[k];
    return acc;
  }, {});
}

exports.list = async (req, res) => {
  try {
    const { category, status, priority, search, startDate, endDate } = req.query;
    const where = [];
    const params = [];
    let idx = 1;

    // Category filter
    if (category) {
      where.push(`g.category_id = (SELECT category_id FROM grievance_category WHERE lower(category_name) = $${idx})`);
      params.push(category.toLowerCase());
      idx++;
    }

    // Status filter
    if (status) {
      where.push(`g.status = $${idx}`);
      params.push(status);
      idx++;
    }

    // Priority filter
    if (priority) {
      where.push(`g.priority_id = (SELECT priority_id FROM grievance_priority WHERE lower(priority_name) = $${idx})`);
      params.push(priority.toLowerCase());
      idx++;
    }

    // Date range filter
    if (startDate) {
      where.push(`g.created_at >= $${idx}`);
      params.push(startDate);
      idx++;
    }
    if (endDate) {
      where.push(`g.created_at <= $${idx}`);
      params.push(endDate);
      idx++;
    }

    // Search (in description)
    if (search) {
      where.push(`g.description ILIKE $${idx}`);
      params.push(`%${search}%`);
      idx++;
    }

    // RBAC: students see only their own unless admin/authority/faculty
    if (req.user && req.user.role === 'student') {
      where.push(`g.submitted_by = $${idx}`);
      params.push(req.user.id);
      idx++;
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    const q = `
      SELECT 
        g.*,
        gc.category_name,
        gp.priority_name,
        u.full_name as reporter_name
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      LEFT JOIN users u ON g.submitted_by = u.user_id
      ${whereClause}
      ORDER BY g.priority_id DESC, g.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);

    const { rows } = await db.query(q, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM grievances g ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`;
    const countParams = params.slice(0, -2);
    const { rows: countRows } = await db.query(countQuery, countParams);
    const total = parseInt(countRows[0].total, 10);

    return res.json({ 
      data: rows, 
      meta: { 
        page, 
        limit, 
        total,
        pages: Math.ceil(total / limit)
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category_id, priority_id, location, anonymous } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'description required' });
    }

    // Map title to description if only title provided
    const desc = description || title || '';
    
    // Determine submitted_by (reporter)
    let submitted_by = null;
    if (anonymous !== true && anonymous !== 'true' && req.user) {
      submitted_by = req.user.id;
    }

    // Map category/priority names to IDs if provided as strings
    let catId = category_id;
    let priId = priority_id;

    if (category_id && typeof category_id === 'string') {
      const cat = await db.query(
        'SELECT category_id FROM grievance_category WHERE lower(category_name) = $1',
        [category_id.toLowerCase()]
      );
      catId = cat.rowCount ? cat.rows[0].category_id : null;
    }

    if (priority_id && typeof priority_id === 'string') {
      const pri = await db.query(
        'SELECT priority_id FROM grievance_priority WHERE lower(priority_name) = $1',
        [priority_id.toLowerCase()]
      );
      priId = pri.rowCount ? pri.rows[0].priority_id : null;
    }

    // Insert grievance
    const q = `
      INSERT INTO grievances (submitted_by, category_id, priority_id, description, location, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const { rows } = await db.query(q, [submitted_by, catId, priId, desc, location || null, 'submitted']);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const q = `
      SELECT 
        g.*,
        gc.category_name,
        gp.priority_name,
        u.full_name as reporter_name,
        u.institute_email as reporter_email
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      LEFT JOIN users u ON g.submitted_by = u.user_id
      WHERE g.grievance_id = $1
    `;
    
    const { rows } = await db.query(q, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    
    const g = rows[0];
    // if student and grievance not theirs, forbid
    if (req.user && req.user.role === 'student' && g.submitted_by && g.submitted_by !== req.user.id) {
      return res.status(403).json({ message: 'forbidden' });
    }
    return res.json(g);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.myGrievances = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const offset = (page - 1) * limit;

    const q = `
      SELECT 
        g.*,
        gc.category_name,
        gp.priority_name,
        u.full_name as reporter_name,
        (SELECT COUNT(*) FROM grievance_remarks WHERE grievance_id = g.grievance_id) as remark_count
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      LEFT JOIN users u ON g.submitted_by = u.user_id
      WHERE g.submitted_by = $1
      ORDER BY g.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await db.query(q, [req.user.id, limit, offset]);

    // Get total count
    const countQ = `SELECT COUNT(*) as total FROM grievances WHERE submitted_by = $1`;
    const { rows: countRows } = await db.query(countQ, [req.user.id]);
    const total = parseInt(countRows[0].total, 10);

    return res.json({
      data: rows,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cols = await getColumns('grievances');
    const payload = pick(req.body, cols.filter(c => c !== 'grievance_id' && c !== 'created_at'));
    if (Object.keys(payload).length === 0) return res.status(400).json({ message: 'no valid fields' });

    // status changes should be restricted to authority/admin
    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
      if (!['authority','admin'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'only authority/admin may update status' });
      }
    }

    const keys = Object.keys(payload);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const vals = keys.map(k => payload[k]);
    vals.push(req.params.id);
    const q = `UPDATE grievances SET ${sets} WHERE grievance_id = $${vals.length} RETURNING *`;
    const { rows } = await db.query(q, vals);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM grievances WHERE grievance_id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

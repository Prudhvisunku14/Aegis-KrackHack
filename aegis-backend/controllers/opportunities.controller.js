const db = require('../db');

// List all opportunities (with optional filters: dept, skills, duration, stipend, status)
exports.list = async (req, res) => {
  try {
    const { department_id, skills, duration, stipend, status, limit = 50, page = 1 } = req.query;
    const where = [];
    const params = [];
    let idx = 1;

    if (department_id) {
      where.push(`department_id = $${idx++}`);
      params.push(department_id);
    }
    if (status) {
      where.push(`status = $${idx++}`);
      params.push(status.toUpperCase());
    } else {
      where.push(`status = 'OPEN'`); // Default: show only open opportunities
    }
    if (skills) {
      where.push(`required_skills ILIKE $${idx++}`);
      params.push(`%${skills}%`);
    }
    if (duration) {
      where.push(`duration ILIKE $${idx++}`);
      params.push(`%${duration}%`);
    }
    if (stipend) {
      where.push(`stipend IS NOT NULL`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const lim = Math.min(parseInt(limit, 10), 200);
    const pg = Math.max(parseInt(page, 10), 1);
    const offset = (pg - 1) * lim;

    const q = `SELECT * FROM opportunities ${whereClause} ORDER BY created_at DESC LIMIT ${lim} OFFSET ${offset}`;
    const { rows } = await db.query(q, params);
    return res.json({ data: rows, meta: { page: pg, limit: lim } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get single opportunity
exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM opportunities WHERE opportunity_id = $1', [id]);
    if (!rows.length) return res.status(404).json({ message: 'opportunity not found' });
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Create opportunity (faculty only)
exports.create = async (req, res) => {
  try {
    if (!req.user || !['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'only faculty/admin can post opportunities' });
    }

    const { title, description, required_skills, duration, stipend, deadline, department_id } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const userId = req.user.user_id || req.user.id;
    console.log('=== Creating opportunity ===');
    console.log('User:', req.user);
    console.log('User ID resolved to:', userId);
    console.log('Title:', title);

    const q = `
      INSERT INTO opportunities (posted_by, title, description, required_skills, duration, stipend, deadline, department_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
      RETURNING *
    `;
    const vals = [userId, title, description || null, required_skills || null, duration || null, stipend || null, deadline || null, department_id || null];
    console.log('Query values:', vals);
    const { rows } = await db.query(q, vals);
    return res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Update opportunity (faculty owner only)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const opp = await db.query('SELECT * FROM opportunities WHERE opportunity_id = $1', [id]);
    if (!opp.rows.length) return res.status(404).json({ message: 'opportunity not found' });
    
    const userId = req.user.user_id || req.user.id;
    if (userId !== opp.rows[0].posted_by && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'only the posted faculty can update this' });
    }

    const { title, description, required_skills, duration, stipend, deadline, status, department_id } = req.body;
    const updates = [];
    const vals = [];
    let idx = 1;

    if (title !== undefined) { updates.push(`title = $${idx++}`); vals.push(title); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); vals.push(description); }
    if (required_skills !== undefined) { updates.push(`required_skills = $${idx++}`); vals.push(required_skills); }
    if (duration !== undefined) { updates.push(`duration = $${idx++}`); vals.push(duration); }
    if (stipend !== undefined) { updates.push(`stipend = $${idx++}`); vals.push(stipend); }
    if (deadline !== undefined) { updates.push(`deadline = $${idx++}`); vals.push(deadline); }
    if (status !== undefined) { updates.push(`status = $${idx++}`); vals.push(status.toUpperCase()); }
    if (department_id !== undefined) { updates.push(`department_id = $${idx++}`); vals.push(department_id); }

    if (!updates.length) return res.status(400).json({ message: 'no fields to update' });

    vals.push(id);
    const q = `UPDATE opportunities SET ${updates.join(', ')} WHERE opportunity_id = $${idx++} RETURNING *`;
    const { rows } = await db.query(q, vals);
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Close opportunity (set status to CLOSED)
exports.close = async (req, res) => {
  try {
    const { id } = req.params;
    const opp = await db.query('SELECT * FROM opportunities WHERE opportunity_id = $1', [id]);
    if (!opp.rows.length) return res.status(404).json({ message: 'opportunity not found' });
    
    const userId = req.user.user_id || req.user.id;
    if (userId !== opp.rows[0].posted_by && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'only the posted faculty can close this' });
    }

    const { rows } = await db.query('UPDATE opportunities SET status = $1 WHERE opportunity_id = $2 RETURNING *', ['CLOSED', id]);
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get opportunities posted by me (faculty)
exports.myPostings = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { rows } = await db.query('SELECT * FROM opportunities WHERE posted_by = $1 ORDER BY created_at DESC', [userId]);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

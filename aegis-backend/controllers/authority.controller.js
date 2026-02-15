const db = require('../db');

/**
 * Authority Controller - Grievance Management for department heads/authorities
 * Endpoints for assigning, updating, and resolving grievances
 */

exports.getDashboard = async (req, res) => {
  try {
    // Get all grievances (authority/admin can see all, filter by department later)
    const { status } = req.query;
    const limit = Math.min(parseInt(req.query.limit || 50, 10), 100);
    const page = Math.max(parseInt(req.query.page || 1, 10), 1);
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramIdx = 1;

    if (status) {
      whereClause += ` AND g.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    const q = `
      SELECT 
        g.*, 
        gc.category_name,
        gp.priority_name,
        u.full_name as reporter_name,
        u.institute_email as reporter_email,
        au.full_name as assigned_to_name
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      LEFT JOIN grievance_priority gp ON g.priority_id = gp.priority_id
      LEFT JOIN users u ON g.submitted_by = u.user_id
      LEFT JOIN users au ON g.assigned_to = au.user_id
      WHERE ${whereClause}
      ORDER BY g.priority_id DESC, g.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    params.push(limit, offset);

    const result = await db.query(q, params);
    
    // Get total count
    const countQ = `SELECT COUNT(*) as total FROM grievances g WHERE ${whereClause}`;
    const countResult = await db.query(countQ, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total, 10);

    return res.json({
      data: result.rows,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.assignGrievance = async (req, res) => {
  try {
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only admin/authority can assign grievances' });
    }

    const { grievance_id, assigned_to_user_id } = req.body;
    if (!grievance_id || !assigned_to_user_id) {
      return res.status(400).json({ message: 'grievance_id and assigned_to_user_id required' });
    }

    const q = `
      UPDATE grievances 
      SET assigned_to = $1, updated_at = NOW()
      WHERE grievance_id = $2
      RETURNING *
    `;

    const result = await db.query(q, [assigned_to_user_id, grievance_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'grievance not found' });
    }

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)`,
        [req.user.user_id || req.user.id, 'GRIEVANCE_ASSIGNED', 'grievance', grievance_id]
      );
    } catch (logErr) {
      console.error('Activity log error:', logErr);
      // Don't fail the operation if logging fails
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.updateGrievanceStatus = async (req, res) => {
  try {
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Only admin/authority can update status' });
    }

    const { grievance_id, status, remarks } = req.body;
    if (!grievance_id || !status || !remarks) {
      return res.status(400).json({ message: 'grievance_id, status, and remarks required' });
    }

    const validStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Update grievance status
    const q = `
      UPDATE grievances 
      SET status = $1, updated_at = NOW()
      WHERE grievance_id = $2
      RETURNING *
    `;
    const result = await db.query(q, [status, grievance_id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'grievance not found' });
    }

    // Insert remark/timeline entry
    try {
      await db.query(
        `INSERT INTO grievance_remarks (grievance_id, authority_id, remark_text)
         VALUES ($1, $2, $3)`,
        [grievance_id, req.user.user_id || req.user.id, remarks]
      );
    } catch (remarkErr) {
      console.error('Remark insert error:', remarkErr);
      // Don't fail the operation if remark insertion fails
    }

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)`,
        [req.user.user_id || req.user.id, 'GRIEVANCE_STATUS_UPDATED', 'grievance', grievance_id]
      );
    } catch (logErr) {
      console.error('Activity log error:', logErr);
      // Don't fail the operation if logging fails
    }

    return res.json({ success: true, grievance: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getGrievanceTimeline = async (req, res) => {
  try {
    const { grievance_id } = req.params;

    const q = `
      SELECT 
        gt.*, 
        u.full_name as user_name,
        gr.remark_text
      FROM grievance_timeline gt
      LEFT JOIN grievance_remarks gr ON gt.status_change_id = gr.remark_id
      LEFT JOIN users u ON gr.authority_id = u.user_id
      WHERE gt.grievance_id = $1
      ORDER BY gt.updated_at DESC
    `;

    const result = await db.query(q, [grievance_id]);
    return res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getGrievanceAnalytics = async (req, res) => {
  try {
    if (!['admin', 'authority'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { days = 30, department_id } = req.query;

    // Total grievances by status
    const statusQ = `
      SELECT status, COUNT(*) as count
      FROM grievances
      WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY status
    `;
    const statusResult = await db.query(statusQ);

    // Total grievances by category
    const categoryQ = `
      SELECT gc.category_name, COUNT(*) as count
      FROM grievances g
      LEFT JOIN grievance_category gc ON g.category_id = gc.category_id
      WHERE g.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY gc.category_name
      ORDER BY count DESC
    `;
    const categoryResult = await db.query(categoryQ);

    // Average resolution time
    const resolutionTimeQ = `
      SELECT AVG(EXTRACT(DAY FROM (resolved_at - created_at))) as avg_days
      FROM grievances
      WHERE status = 'resolved' AND resolved_at IS NOT NULL
      AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
    `;
    const resolutionResult = await db.query(resolutionTimeQ);

    // Pending grievances older than 72 hours
    const oldPendingQ = `
      SELECT COUNT(*) as count
      FROM grievances
      WHERE status != 'resolved' AND status != 'closed'
      AND created_at < NOW() - INTERVAL '72 hours'
    `;
    const oldPendingResult = await db.query(oldPendingQ);

    return res.json({
      summary: {
        total_by_status: statusResult.rows,
        total_by_category: categoryResult.rows,
        avg_resolution_days: parseFloat(resolutionResult.rows[0].avg_days || 0).toFixed(2),
        pending_over_72h: parseInt(oldPendingResult.rows[0].count, 10),
      },
      period_days: parseInt(days, 10),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const q = `SELECT * FROM grievance_category ORDER BY category_name`;
    const result = await db.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getPriorities = async (req, res) => {
  try {
    const q = `SELECT * FROM grievance_priority ORDER BY priority_id`;
    const result = await db.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const { grievance_id } = req.body;
    if (!grievance_id || !req.file) {
      return res.status(400).json({ message: 'grievance_id and file required' });
    }

    // Verify grievance exists
    const check = await db.query('SELECT grievance_id FROM grievances WHERE grievance_id = $1', [grievance_id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ message: 'grievance not found' });
    }

    // Store file path and metadata
    const filePath = `/uploads/${req.file.filename}`;
    const q = `
      INSERT INTO grievance_images (grievance_id, image_path, uploaded_by, uploaded_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await db.query(q, [grievance_id, filePath, req.user?.user_id || null]);
    
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

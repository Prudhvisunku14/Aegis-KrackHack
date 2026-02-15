const db = require('../db');

// List my tasks (Scholar's Ledger)
exports.list = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { category, status } = req.query;

    let q = 'SELECT * FROM tasks WHERE student_id = $1';
    const params = [student_id];
    let idx = 2;

    if (category) {
      q += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (status) {
      q += ` AND status = $${idx++}`;
      params.push(status.toUpperCase());
    }

    q += ' ORDER BY due_date ASC NULLS LAST';
    const { rows } = await db.query(q, params);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Create task
exports.create = async (req, res) => {
  try {
    const { title, description, category, due_date } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const q = `
      INSERT INTO tasks (student_id, title, description, category, due_date, status, progress_percentage)
      VALUES ($1, $2, $3, $4, $5, 'PENDING', 0)
      RETURNING *
    `;
    const { rows } = await db.query(q, [req.user.id, title, description || null, category || null, due_date || null]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Update task (progress, status)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, due_date, status, progress_percentage } = req.body;

    // Check ownership
    const task = await db.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
    if (!task.rows.length) return res.status(404).json({ message: 'task not found' });
    if (task.rows[0].student_id !== req.user.id) return res.status(403).json({ message: 'not your task' });

    const updates = [];
    const vals = [];
    let idx = 1;

    if (title !== undefined) { updates.push(`title = $${idx++}`); vals.push(title); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); vals.push(description); }
    if (category !== undefined) { updates.push(`category = $${idx++}`); vals.push(category); }
    if (due_date !== undefined) { updates.push(`due_date = $${idx++}`); vals.push(due_date); }
    if (status !== undefined) { updates.push(`status = $${idx++}`); vals.push(status.toUpperCase()); }
    if (progress_percentage !== undefined) {
      updates.push(`progress_percentage = $${idx++}`);
      vals.push(Math.min(100, Math.max(0, parseInt(progress_percentage, 10))));
      // Auto-complete if progress is 100%
      if (progress_percentage === 100) {
        updates.push(`status = $${idx++}`);
        vals.push('COMPLETED');
      }
    }

    if (!updates.length) return res.status(400).json({ message: 'no fields to update' });

    vals.push(id);
    const q = `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $${idx++} RETURNING *`;
    const { rows } = await db.query(q, vals);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Delete task
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
    if (!task.rows.length) return res.status(404).json({ message: 'task not found' });
    if (task.rows[0].student_id !== req.user.id) return res.status(403).json({ message: 'not your task' });

    await db.query('DELETE FROM tasks WHERE task_id = $1', [id]);
    return res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get task categories (for filtering/dropdown)
exports.categories = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT category FROM tasks WHERE student_id = $1 AND category IS NOT NULL ORDER BY category
    `, [req.user.id]);
    return res.json({ data: rows.map(r => r.category) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

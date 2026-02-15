const db = require('../db');

async function list(req, res) {
  try {
    const { start, end, personal } = req.query;
    const startDate = start || new Date().toISOString().slice(0, 10);
    const endDate = end || startDate;

    // build base query joining course name
    let q = `SELECT ae.*, c.course_name FROM academic_events ae LEFT JOIN courses c ON ae.course_id = c.course_id WHERE ae.event_date BETWEEN $1 AND $2`;
    const params = [startDate, endDate];

    if (personal === 'true' || personal === '1') {
      // fetch user's enrolled course ids
      const uid = req.user && req.user.user_id ? req.user.user_id : req.user && req.user.id ? req.user.id : null;
      if (!uid) return res.status(401).json({ message: 'authentication required' });
      const enrRes = await db.query('SELECT course_id FROM enrollments WHERE student_id = $1', [uid]);
      const courseIds = enrRes.rows.map(r => r.course_id);
      if (courseIds.length > 0) {
        const placeholders = courseIds.map((_, i) => `$${i + 3}`).join(',');
        q += ` AND (ae.course_id IS NULL OR ae.course_id IN (${placeholders}))`;
        params.push(...courseIds);
      } else {
        // user not enrolled anywhere — only include global events
        q += ` AND ae.course_id IS NULL`;
      }
    }

    q += ' ORDER BY ae.event_date ASC';
    const { rows } = await db.query(q, params);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function get(req, res) {
  try {
    const { rows } = await db.query('SELECT ae.*, c.course_name FROM academic_events ae LEFT JOIN courses c ON ae.course_id = c.course_id WHERE event_id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const { title, description, event_date, course_id } = req.body || {};
    if (!title || !event_date) return res.status(400).json({ message: 'title and event_date required' });
    const q = `INSERT INTO academic_events (title, description, event_date, course_id) VALUES ($1,$2,$3,$4) RETURNING *`;
    const vals = [title, description || null, event_date, course_id || null];
    const { rows } = await db.query(q, vals);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const allowed = ['title', 'description', 'event_date', 'course_id'];
    const payload = {};
    for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) payload[k] = req.body[k];
    const keys = Object.keys(payload);
    if (keys.length === 0) return res.status(400).json({ message: 'no valid fields' });
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const vals = keys.map(k => payload[k]);
    vals.push(req.params.id);
    const q = `UPDATE academic_events SET ${sets} WHERE event_id = $${vals.length} RETURNING *`;
    const { rows } = await db.query(q, vals);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const { rows } = await db.query('DELETE FROM academic_events WHERE event_id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'not found' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

// Create an in-platform reminder (activity_logs) or attempt email (if configured)
async function remind(req, res) {
  try {
    const method = (req.body && req.body.method) || 'in-platform';
    const evtRes = await db.query('SELECT * FROM academic_events WHERE event_id = $1', [req.params.id]);
    if (evtRes.rows.length === 0) return res.status(404).json({ message: 'event not found' });
    const event = evtRes.rows[0];

    if (method === 'in-platform') {
      const action = `reminder: academic_event ${event.event_id} - ${event.title}`;
      const { rows } = await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1,$2,$3,$4) RETURNING *', [req.user.user_id || req.user.id, action, 'academic_event', event.event_id]);
      return res.status(201).json(rows[0]);
    }

    // email reminder - only supported if SMTP config exists (not configured in demo)
    if (method === 'email') {
      // detect SMTP vars
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return res.status(501).json({ message: 'email reminders not configured on this instance' });
      }
      // best-effort: enqueue a log and return accepted
      const action = `email-reminder-requested: academic_event ${event.event_id} - ${event.title}`;
      await db.query('INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1,$2,$3,$4)', [req.user.user_id || req.user.id, action, 'academic_event', event.event_id]);
      // TODO: integrate SMTP sending/queue
      return res.status(202).json({ message: 'email reminder queued (not-yet-implemented)' });
    }

    return res.status(400).json({ message: 'unsupported method' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function myReminders(req, res) {
  try {
    const uid = req.user.user_id || req.user.id;
    const { rows } = await db.query("SELECT * FROM activity_logs WHERE user_id = $1 AND entity_type = 'academic_event' ORDER BY timestamp DESC LIMIT 200", [uid]);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { list, get, create, update, remove, remind, myReminders };
const db = require('../db');

// Add bookmark (save opportunity)
exports.add = async (req, res) => {
  try {
    const { opportunity_id } = req.body;
    const student_id = req.user.id;

    if (!opportunity_id) return res.status(400).json({ message: 'opportunity_id required' });

    // Check if opportunity exists
    const opp = await db.query('SELECT * FROM opportunities WHERE opportunity_id = $1', [opportunity_id]);
    if (!opp.rows.length) return res.status(404).json({ message: 'opportunity not found' });

    // Check if already bookmarked
    const existing = await db.query(
      'SELECT * FROM bookmarks WHERE student_id = $1 AND opportunity_id = $2',
      [student_id, opportunity_id]
    );
    if (existing.rows.length) return res.status(409).json({ message: 'already bookmarked' });

    await db.query(
      'INSERT INTO bookmarks (student_id, opportunity_id) VALUES ($1, $2)',
      [student_id, opportunity_id]
    );
    return res.status(201).json({ message: 'bookmarked' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Remove bookmark
exports.remove = async (req, res) => {
  try {
    const { opportunity_id } = req.params;
    const student_id = req.user.id;

    const result = await db.query(
      'DELETE FROM bookmarks WHERE student_id = $1 AND opportunity_id = $2 RETURNING *',
      [student_id, opportunity_id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'bookmark not found' });
    return res.json({ message: 'unbookmarked' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get my bookmarks
exports.list = async (req, res) => {
  try {
    const student_id = req.user.id;
    const q = `
      SELECT o.*, COUNT(a.application_id) as application_count
      FROM bookmarks b
      JOIN opportunities o ON o.opportunity_id = b.opportunity_id
      LEFT JOIN applications a ON a.opportunity_id = o.opportunity_id
      WHERE b.student_id = $1
      GROUP BY o.opportunity_id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await db.query(q, [student_id]);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

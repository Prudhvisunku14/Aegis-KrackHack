const express = require('express');
const db = require('../db');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Return quick counts for important tables
router.get('/counts', authenticateJWT, authorizeRoles('admin','authority'), async (req, res) => {
  try {
    const tables = ['users','courses','academic_year','academic_resources','resource_tags','resource_tag_map'];
    const counts = {};
    for (const t of tables) {
      const { rows } = await db.query(`SELECT count(*)::int AS cnt FROM ${t}`);
      counts[t] = rows[0].cnt;
    }
    return res.json({ counts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Public counts (authenticated users) - limited view used for diagnostics
router.get('/public-counts', authenticateJWT, async (req, res) => {
  try {
    const tables = ['users','courses','academic_year','academic_resources','resource_tags'];
    const counts = {};
    for (const t of tables) {
      const { rows } = await db.query(`SELECT count(*)::int AS cnt FROM ${t}`);
      counts[t] = rows[0].cnt;
    }
    return res.json({ counts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

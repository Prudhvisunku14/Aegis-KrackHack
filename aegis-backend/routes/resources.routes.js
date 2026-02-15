const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const uploadDir = path.join(__dirname, '..', 'uploads', 'academic_resources');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const router = express.Router();
router.use(authenticateJWT);

// Upload a resource (file + metadata + tags)
router.post('/upload', authorizeRoles('student','faculty','authority','admin'), upload.single('file'), async (req, res) => {
  try {
    const { title, course_id, year_id, type, tags } = req.body;
    if (!req.file) return res.status(400).json({ message: 'file is required' });

    const filePath = `/uploads/academic_resources/${req.file.filename}`;

    // ensure we provide a non-null course_id when DB requires it
    let courseIdVal = null;
    if (course_id && String(course_id).trim() !== '') {
      courseIdVal = parseInt(course_id, 10) || null;
    } else {
      const cr = await db.query('SELECT course_id FROM courses LIMIT 1');
      if (cr.rows.length) courseIdVal = cr.rows[0].course_id;
      else return res.status(400).json({ message: 'course_id is required; no courses available' });
    }

    // validate or fallback year_id (DB enforces FK)
    let yearIdVal = null;
    if (year_id && String(year_id).trim() !== '') {
      yearIdVal = parseInt(year_id, 10) || null;
      if (yearIdVal) {
        const yr = await db.query('SELECT year_id FROM academic_year WHERE year_id = $1', [yearIdVal]);
        if (!yr.rows.length) return res.status(400).json({ message: 'year_id does not reference an existing academic year' });
      }
    } else {
      const yr = await db.query('SELECT year_id FROM academic_year ORDER BY year_id DESC LIMIT 1');
      if (yr.rows.length) yearIdVal = yr.rows[0].year_id;
      else return res.status(400).json({ message: 'year_id is required; no academic years available' });
    }

    const q = `INSERT INTO academic_resources (uploaded_by, course_id, title, file_path, year_id, type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const vals = [req.user.id || null, courseIdVal, title || req.file.originalname, filePath, yearIdVal, type || null];
    const { rows } = await db.query(q, vals);
    const resource = rows[0];

    // tags: comma-separated names
    if (tags && tags.length > 0) {
      const tagNames = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tName of tagNames) {
        // upsert tag
        const existing = await db.query('SELECT tag_id FROM resource_tags WHERE tag_name = $1', [tName]);
        let tagId;
        if (existing.rows.length) tagId = existing.rows[0].tag_id;
        else {
          const ins = await db.query('INSERT INTO resource_tags (tag_name) VALUES ($1) RETURNING tag_id', [tName]);
          tagId = ins.rows[0].tag_id;
        }
        await db.query('INSERT INTO resource_tag_map (resource_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [resource.resource_id, tagId]);
      }
    }

    return res.status(201).json({ resource });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Search resources with optional tag/course/year/type filters
router.get('/search', async (req, res) => {
  try {
    const qs = req.query || {};
    const qParts = [];
    const params = [];
    let idx = 1;

    if (qs.q) {
      qParts.push(`(ar.title ILIKE $${idx} OR ar.file_path ILIKE $${idx})`);
      params.push(`%${qs.q}%`);
      idx++;
    }
    if (qs.course_id) { qParts.push(`ar.course_id = $${idx++}`); params.push(qs.course_id); }
    if (qs.year_id) { qParts.push(`ar.year_id = $${idx++}`); params.push(qs.year_id); }
    if (qs.type) { qParts.push(`ar.type = $${idx++}`); params.push(qs.type); }

    let where = qParts.length ? `WHERE ${qParts.join(' AND ')}` : '';

    // tag filtering (optional)
    let tagJoin = '';
    if (qs.tag) {
      tagJoin = `
        JOIN resource_tag_map rtm ON rtm.resource_id = ar.resource_id
        JOIN resource_tags rt ON rt.tag_id = rtm.tag_id AND rt.tag_name = $${idx}
      `;
      params.push(qs.tag);
      idx++;
    }

    const limit = Math.min(parseInt(qs.limit || 50, 10), 200);
    const page = Math.max(parseInt(qs.page || 1, 10), 1);
    const offset = (page - 1) * limit;

    const q = `
      SELECT ar.*, COALESCE(json_agg(rt.tag_name) FILTER (WHERE rt.tag_name IS NOT NULL), '[]') AS tags
      FROM academic_resources ar
      LEFT JOIN resource_tag_map rtm2 ON rtm2.resource_id = ar.resource_id
      LEFT JOIN resource_tags rt ON rt.tag_id = rtm2.tag_id
      ${tagJoin}
      ${where}
      GROUP BY ar.resource_id
      ORDER BY ar.resource_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await db.query(q, params);
    return res.json({ data: rows, meta: { page, limit } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

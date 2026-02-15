const db = require('../db');
const path = require('path');
const fs = require('fs');

async function apply(req, res) {
  try {
    const opportunityId = parseInt(req.params.opportunity_id, 10);
    const studentId = req.user.user_id || req.user.id;
    if (!opportunityId || !studentId) return res.status(400).json({ message: 'invalid opportunity or user' });

    // ensure uploads/resumes exists
    const destDir = path.join(__dirname, '..', 'uploads', 'resumes');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const q = `INSERT INTO applications (opportunity_id, student_id, resume_path) VALUES ($1,$2,$3) RETURNING *`;
    const vals = [opportunityId, studentId, resumePath];
    const { rows } = await db.query(q, vals);
    return res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function list(req, res) {
  try {
    const opportunityId = req.query.opportunity_id ? parseInt(req.query.opportunity_id, 10) : null;
    const studentId = req.user.user_id || req.user.id;

    let q = '';
    let vals = [];

    if (opportunityId) {
      // Get applications for a specific opportunity (faculty view)
      q = `SELECT a.*, u.email as student_email FROM applications a 
           LEFT JOIN users u ON a.student_id = u.user_id 
           WHERE a.opportunity_id = $1 
           ORDER BY a.applied_at DESC`;
      vals = [opportunityId];
    } else {
      // Get all applications for current user (student view - their own applications)
      q = `SELECT a.*, o.title as opportunity_title FROM applications a 
           LEFT JOIN opportunities o ON a.opportunity_id = o.opportunity_id 
           WHERE a.student_id = $1 
           ORDER BY a.applied_at DESC`;
      vals = [studentId];
    }

    const { rows } = await db.query(q, vals);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function myApplications(req, res) {
  try {
    const uid = req.user.user_id || req.user.id;
    const { rows } = await db.query('SELECT a.*, o.title FROM applications a LEFT JOIN opportunities o ON a.opportunity_id = o.opportunity_id WHERE a.student_id = $1 ORDER BY a.applied_at DESC', [uid]);
    return res.json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body || {};
    if (!id || !status) return res.status(400).json({ message: 'id and status required' });
    
    // Get the application to check authorization
    const { rows: appRows } = await db.query('SELECT * FROM applications WHERE application_id = $1', [id]);
    if (appRows.length === 0) return res.status(404).json({ message: 'application not found' });

    const app = appRows[0];
    // Get the opportunity to check if user is the poster
    const { rows: oppRows } = await db.query('SELECT * FROM opportunities WHERE opportunity_id = $1', [app.opportunity_id]);
    if (oppRows.length === 0) return res.status(404).json({ message: 'opportunity not found' });

    const opp = oppRows[0];
    const userId = req.user.user_id || req.user.id;

    // Check if user is faculty poster or admin
    if (req.user.role !== 'admin' && opp.posted_by !== userId) {
      return res.status(403).json({ message: 'not authorized to update this application' });
    }

    const q = 'UPDATE applications SET status = $1 WHERE application_id = $2 RETURNING *';
    const { rows } = await db.query(q, [status, id]);
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { apply, list, myApplications, updateStatus };

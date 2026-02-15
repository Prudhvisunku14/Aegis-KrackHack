const db = require('../db');

async function list(req, res) {
  try {
    const userId = req.user.user_id || req.user.id;
    const { opportunity_id, limit = 100, page = 1 } = req.query;

    let q = `
      SELECT m.*, 
             o.title as opportunity_title,
             u_sender.full_name as sender_name,
             u_recipient.full_name as recipient_name
      FROM opportunity_messages m
      LEFT JOIN opportunities o ON m.opportunity_id = o.opportunity_id
      LEFT JOIN users u_sender ON m.sender_id = u_sender.user_id
      LEFT JOIN users u_recipient ON m.recipient_id = u_recipient.user_id
      WHERE m.recipient_id = $1 OR m.sender_id = $1
    `;
    const params = [userId];
    let idx = 2;

    if (opportunity_id) {
      q += ` AND m.opportunity_id = $${idx++}`;
      params.push(opportunity_id);
    }

    q += ` ORDER BY m.timestamp DESC`;

    const lim = Math.min(parseInt(limit, 10), 500);
    const pg = Math.max(parseInt(page, 10), 1);
    const offset = (pg - 1) * lim;

    q += ` LIMIT ${lim} OFFSET ${offset}`;

    const { rows } = await db.query(q, params);
    return res.json({ data: rows, meta: { page: pg, limit: lim } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

async function send(req, res) {
  try {
    const opportunityId = parseInt(req.params.opportunity_id, 10);
    const senderId = req.user.user_id || req.user.id;
    const { recipient_id, body, attachment_path } = req.body || {};
    if (!opportunityId || !senderId || !recipient_id || !body) return res.status(400).json({ message: 'missing fields' });

    const q = `INSERT INTO opportunity_messages (opportunity_id, sender_id, recipient_id, message_text, attachment_path) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const vals = [opportunityId, senderId, recipient_id, body, attachment_path || null];
    const { rows } = await db.query(q, vals);
    return res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { list, send };

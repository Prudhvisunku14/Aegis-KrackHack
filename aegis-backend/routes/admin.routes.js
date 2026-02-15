const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All admin routes require authentication
router.use(authenticateJWT);

// User management
router.get('/users', authorizeRoles('admin', 'authority'), adminController.listUsers);
router.put('/users/:user_id/role', authorizeRoles('admin'), adminController.updateUserRole);
router.put('/users/:user_id/status', authorizeRoles('admin'), adminController.toggleUserActive);

// Activity logs
router.get('/logs', authorizeRoles('admin', 'authority'), adminController.getActivityLogs);

// System health
router.get('/health', authorizeRoles('admin', 'authority'), adminController.getSystemHealth);

// Grievances (admin view)
router.get('/grievances', authorizeRoles('admin', 'authority'), async (req, res) => {
  try {
    const db = require('../db');
    const { rows } = await db.query(`
      SELECT 
        g.*,
        u.full_name as submitted_by_name,
        u.institute_email as submitted_by_email
      FROM grievances g
      LEFT JOIN users u ON g.submitted_by = u.id
      ORDER BY g.created_at DESC
      LIMIT 200
    `);
    return res.json({ grievances: rows, count: rows.length });
  } catch (err) {
    console.error('Error fetching admin grievances:', err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

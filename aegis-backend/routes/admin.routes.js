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

module.exports = router;

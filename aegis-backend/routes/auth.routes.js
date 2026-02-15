const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Authenticated
router.get('/me', authenticateJWT, authController.me);

module.exports = router;

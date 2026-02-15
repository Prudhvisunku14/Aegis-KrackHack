const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const controller = require('../controllers/opportunity_messages.controller');

router.use(authenticateJWT);

// List messages for current user: GET /api/opportunity_messages
router.get('/opportunity_messages', controller.list);

// Send a message related to an opportunity: POST /api/opportunities/:opportunity_id/message
router.post('/opportunities/:opportunity_id/message', controller.send);

module.exports = router;

const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');
const bookmarksController = require('../controllers/bookmarks.controller');

const router = express.Router();
router.use(authenticateJWT);

// Add bookmark
router.post('/', bookmarksController.add);

// List my bookmarks
router.get('/', bookmarksController.list);

// Remove bookmark
router.delete('/:opportunity_id', bookmarksController.remove);

module.exports = router;

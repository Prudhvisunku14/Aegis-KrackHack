const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const opportunitiesController = require('../controllers/opportunities.controller');

const router = express.Router();
router.use(authenticateJWT);

// Public: List opportunities (anyone can view)
router.get('/', opportunitiesController.list);

// Public: Get single opportunity
router.get('/:id', opportunitiesController.get);

// Faculty: Create opportunity
router.post('/', authorizeRoles('faculty', 'admin'), opportunitiesController.create);

// Faculty: Update opportunity
router.put('/:id', authorizeRoles('faculty', 'admin'), opportunitiesController.update);

// Faculty: Close opportunity
router.put('/:id/close', authorizeRoles('faculty', 'admin'), opportunitiesController.close);

// Admin: Delete opportunity
router.delete('/:id', authorizeRoles('admin'), opportunitiesController.remove);

// Faculty: Get my postings
router.get('/postings/mine', opportunitiesController.myPostings);

module.exports = router;

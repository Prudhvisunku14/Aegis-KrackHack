const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievance.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// require authentication for grievance flows
router.use(authenticateJWT);

router.get('/my/submissions', grievanceController.myGrievances); // Must come before /:id to avoid conflict
router.get('/', grievanceController.list);
router.post('/', grievanceController.create);
router.get('/:id', grievanceController.get);
router.put('/:id', grievanceController.update);
router.delete('/:id', authorizeRoles('admin'), grievanceController.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const controller = require('../controllers/academic_events.controller');

// require auth for calendar endpoints
router.use(authenticateJWT);

// List (supports ?start=YYYY-MM-DD&end=YYYY-MM-DD&personal=true)
router.get('/', controller.list);
router.get('/:id', controller.get);

// create/update/delete — restricted to faculty/authority/admin (delete restricted to admin/authority)
router.post('/', authorizeRoles('faculty','authority','admin'), controller.create);
router.put('/:id', authorizeRoles('faculty','authority','admin'), controller.update);
router.delete('/:id', authorizeRoles('admin','authority'), controller.remove);

// reminders
router.post('/:id/remind', controller.remind);
router.get('/my-reminders', controller.myReminders);

module.exports = router;
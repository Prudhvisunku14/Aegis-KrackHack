const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');
const tasksController = require('../controllers/tasks.controller');

const router = express.Router();
router.use(authenticateJWT);

// List my tasks
router.get('/', tasksController.list);

// Get categories
router.get('/categories', tasksController.categories);

// Create task
router.post('/', tasksController.create);

// Update task
router.put('/:id', tasksController.update);

// Delete task
router.delete('/:id', tasksController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authorityController = require('../controllers/authority.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authenticateJWT);

// Grievance data endpoints (public)
router.get('/categories', authorityController.getCategories);
router.get('/priorities', authorityController.getPriorities);

// Authority dashboard (admin/authority only)
router.get('/dashboard', authorizeRoles('admin', 'authority'), authorityController.getDashboard);

// Grievance management (admin/authority only)
router.post('/assign', authorizeRoles('admin', 'authority'), authorityController.assignGrievance);
router.post('/status-update', authorizeRoles('admin', 'authority'), authorityController.updateGrievanceStatus);
router.get('/timeline/:grievance_id', authorizeRoles('admin', 'authority'), authorityController.getGrievanceTimeline);

// File upload (admin/authority only)
router.post('/upload-photo', authorizeRoles('admin', 'authority'), upload.single('photo'), authorityController.uploadPhoto);

// Analytics (admin/authority only)
router.get('/analytics', authorizeRoles('admin', 'authority'), authorityController.getGrievanceAnalytics);

module.exports = router;

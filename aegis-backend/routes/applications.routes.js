const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const controller = require('../controllers/applications.controller');

// ensure upload dir
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.use(authenticateJWT);

// GET applications (with optional opportunity_id filter)
// If opportunity_id is provided: get applications for that opportunity (faculty view)
// If no parameters: get current user's own applications (student view)
router.get('/', controller.list);

// Apply to an opportunity (upload resume) - POST /applications/{opportunity_id}
// Client sends: opportunityId as route param, resume file in multipart/form-data
router.post('/:opportunity_id', upload.single('resume'), controller.apply);

// Get my applications (for backward compatibility)
router.get('/my', controller.myApplications);

// Update application status - PUT /applications/{application_id}
// Faculty/admin can update; checks authorization against opportunity poster
router.put('/:id', authorizeRoles('faculty','authority','admin'), controller.updateStatus);

module.exports = router;

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const grievanceRoutes = require("./routes/grievance.routes");
const adminRoutes = require("./routes/admin.routes");
const adminToolsRoutes = require('./routes/admin_tools.routes');
const authorityRoutes = require("./routes/authority.routes");
const db = require('./db');
const resourcesRoutes = require('./routes/resources.routes');
const academicEventsRoutes = require('./routes/academic_events.routes');
const applicationsRoutes = require('./routes/applications.routes');
const opportunityMessagesRoutes = require('./routes/opportunity_messages.routes');
const opportunitiesRoutes = require('./routes/opportunities.routes');
const bookmarksRoutes = require('./routes/bookmarks.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();

// Apply middleware early so preflight CORS requests succeed
app.use(cors());
app.use(express.json());
// mount auth routes early so they are not intercepted by broader /api middleware
app.use("/api/auth", authRoutes);

// mount custom resources routes (upload/search)
app.use('/api/academic_resources', resourcesRoutes);
// academic events / Chronos Calendar (custom endpoints + reminders)
app.use('/api/academic_events', academicEventsRoutes);
// applications and messaging (Pillar IV)
app.use('/api/applications', applicationsRoutes);
app.use('/api', opportunityMessagesRoutes);
// Pillar IV: Opportunities & Scholar's Ledger
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/tasks', tasksRoutes);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", authRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authority", authorityRoutes);
app.use('/api/admin/tools', adminToolsRoutes);

// Auto-register CRUD endpoints for all DB tables (skips manual route files)
const registerAutoCrud = require('./routes/autoCrud.routes');
registerAutoCrud(app).catch(err => console.error('auto-CRUD registration failed', err));

// Simple DB health-check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ ok: true, db: 'connected' });
  } catch (err) {
    console.error('DB health check failed', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

# AEGIS - Campus Grievance & Opportunity Management Platform

A comprehensive institutional platform for managing student grievances, academic resources, and internship opportunities.

## Features

### Pillar I & II: Identity & Grievance Management
- Submit grievances anonymously or with identity
- Real-time grievance tracking and status updates
- Authority dashboard for grievance management
- Role-based access control (Student, Faculty, Authority, Admin)

### Pillar III: Chronos Calendar & Academics
- Centralized academic calendar with events and deadlines
- Vault of Knowledge for academic resources and past papers
- Destiny Manager for course tracking and credits

### Pillar IV: Opportunities & Scholar's Ledger
- Faculty portal for posting internship and research opportunities
- Student opportunity browser with filtering by skills, duration, stipend
- Resume-based applications with status tracking
- Bookmark opportunities for later
- Scholar's Ledger for personal task management
- Inbox for faculty-student communication

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **Routing**: React Router v6

## Project Structure

```
aegis/
├── aegis-backend/          # Node.js/Express backend
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth and custom middleware
│   ├── routes/            # API endpoints
│   ├── db.js              # Database configuration
│   ├── server.js          # Server entry point
│   └── package.json
├── aegis-frontend/        # React/Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Sidebar, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main app component
│   └── package.json
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database
- Git

### Backend Setup

```bash
cd aegis-backend
npm install
```

Create a `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aegis_db
DB_USER=your_db_user
DB_PASS=your_db_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
VITE_API_BASE=http://localhost:5000
```

```bash
npm start
```

### Frontend Setup

```bash
cd aegis-frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Grievances (Pillar I & II)
- `POST /api/grievances` - Submit grievance
- `GET /api/grievances` - List user's grievances
- `PUT /api/grievances/:id` - Update grievance
- `GET /api/authority/grievances` - Authority dashboard

### Opportunities (Pillar IV)
- `GET /api/opportunities` - List opportunities with filters
- `POST /api/opportunities` - Create opportunity (Faculty)
- `POST /api/applications` - Apply to opportunity
- `GET /api/applications` - View applications
- `POST /api/bookmarks` - Bookmark opportunity
- `GET /api/bookmarks` - View bookmarks
- `POST /api/tasks` - Create task for Scholar's Ledger
- `GET /api/tasks` - View tasks
- `GET /api/opportunity_messages` - View messages

## Database Tables

### Core Tables
- `users` - User accounts with roles and permissions
- `grievances` - Submitted grievances and status tracking
- `academic_events` - Calendar events
- `opportunities` - Internship and research opportunities
- `applications` - Student applications to opportunities
- `bookmarks` - Saved opportunities
- `tasks` - Scholar's Ledger tasks
- `opportunity_messages` - Faculty-student communication

## Authentication

The application uses JWT for authentication:
- Tokens stored in `localStorage['aegis_token']`
- JWT payload contains: `{id, user_id, email, role, iat, exp}`
- All protected routes require valid token in `Authorization: Bearer <token>` header

## User Roles

- **Student**: Can submit grievances, browse opportunities, apply, track applications
- **Faculty**: Can post opportunities, review applications, communicate with students
- **Authority**: Can view and manage all grievances, assign to departments
- **Admin**: Full system access

## Development

### Running Tests
```bash
cd aegis-backend
npm test
```

### Build Frontend
```bash
cd aegis-frontend
npm run build
```

## Deployment

### Backend (Node.js)
- Deploy to Heroku, AWS, or DigitalOcean
- Ensure environment variables are configured
- Database must be accessible from server

### Frontend
- Build with `npm run build`
- Deploy `dist/` folder to static hosting (Vercel, Netlify, AWS S3 + CloudFront)
- Update API base URL in environment variables

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support & Contact

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

**AEGIS** - Empowering Campus Communities through Transparent Grievance Management and Opportunity Access

import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import GrievanceSubmit from './pages/GrievanceSubmit'
import MyGrievances from './pages/MyGrievances'
import AuthorityGrievanceDashboard from './pages/AuthorityGrievanceDashboard'
import DestinyManager from './pages/DestinyManager'
import VaultOfKnowledge from './pages/VaultOfKnowledge'
import ChronosCalendar from './pages/ChronosCalendar'
import Opportunities from './pages/Opportunities'
import OpportunityDetail from './pages/OpportunityDetail'
import FacultyPortal from './pages/FacultyPortal'
import FacultyApplications from './pages/FacultyApplications'
import OpportunityInbox from './pages/OpportunityInbox'
import ScholarLedger from './pages/ScholarLedger'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login and Register pages - No layout */}
        <Route path="/login" element={<LoginLayout><Login /></LoginLayout>} />
        <Route path="/register" element={<LoginLayout><Register /></LoginLayout>} />

        {/* Protected pages with AppLayout */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />

        {/* Grievance pages */}
        <Route path="/submit-grievance" element={<ProtectedRoute><AppLayout><GrievanceSubmit /></AppLayout></ProtectedRoute>} />
        <Route path="/my-grievances" element={<ProtectedRoute><AppLayout><MyGrievances /></AppLayout></ProtectedRoute>} />
        <Route path="/authority/grievances" element={<ProtectedRoute><AppLayout><AuthorityGrievanceDashboard /></AppLayout></ProtectedRoute>} />

        {/* Pillar III - Chronos Calendar & Academics */}
        <Route path="/academics" element={<ProtectedRoute><AppLayout><DestinyManager /></AppLayout></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><AppLayout><VaultOfKnowledge /></AppLayout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><AppLayout><ChronosCalendar /></AppLayout></ProtectedRoute>} />

        {/* Pillar IV - Opportunities & Scholar's Ledger */}
        <Route path="/opportunities" element={<ProtectedRoute><AppLayout><Opportunities /></AppLayout></ProtectedRoute>} />
        <Route path="/opportunities/:id" element={<ProtectedRoute><AppLayout><OpportunityDetail /></AppLayout></ProtectedRoute>} />
        <Route path="/faculty/opportunities" element={<ProtectedRoute><AppLayout><FacultyPortal /></AppLayout></ProtectedRoute>} />
        <Route path="/faculty/applications" element={<ProtectedRoute><AppLayout><FacultyApplications /></AppLayout></ProtectedRoute>} />
        <Route path="/scholar-ledger" element={<ProtectedRoute><AppLayout><ScholarLedger /></AppLayout></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><AppLayout><OpportunityInbox /></AppLayout></ProtectedRoute>} />

        {/* default route */}
        <Route path="/" element={<LoginLayout><Login /></LoginLayout>} />
      </Routes>
    </BrowserRouter>
  )
}

function LoginLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-indigo-700">🛡️ AEGIS</h1>
          <p className="text-sm text-slate-600 mt-2">Campus grievance & services portal</p>
          <div className="mt-4 text-sm space-x-3">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Login</Link>
            <span className="text-gray-400">•</span>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign up</Link>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

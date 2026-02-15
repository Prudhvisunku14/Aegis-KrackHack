import React, { useEffect, useState } from 'react'
import { auth } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    auth.me().then(res => { 
      if (mounted) { 
        setUser(res.user); 
        setLoading(false) 
      } 
    }).catch(() => {
      if (mounted) {  // Add this check
        localStorage.removeItem('aegis_token')
        navigate('/login')
      }
    })
    return () => { mounted = false }
  }, [])

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-screen">
      <div className="text-gray-600">Loading...</div>
    </div>
  )

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.institute_email?.charAt(0).toUpperCase() || '?'

  // STUDENT Dashboard (role_id = 1)
  if (user?.role_id === 1 || user?.role === 'student') {
    return (
      <div className="p-6">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name || 'Student'}</h1>
                <p className="text-gray-600 mt-1">Institute Email: {user?.institute_email}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Student</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/submit-grievance" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">G</div>
              <h3 className="font-semibold text-gray-900">Submit Grievance</h3>
              <p className="text-sm text-gray-600 mt-1">Raise an issue</p>
            </Link>
            <Link to="/my-grievances" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">T</div>
              <h3 className="font-semibold text-gray-900">Track Grievances</h3>
              <p className="text-sm text-gray-600 mt-1">View your history</p>
            </Link>
            <Link to="/opportunities" className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-emerald-600 mb-2">O</div>
              <h3 className="font-semibold text-gray-900">Browse Opportunities</h3>
              <p className="text-sm text-gray-600 mt-1">Find internships</p>
            </Link>
            <Link to="/scholar-ledger" className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-purple-600 mb-2">L</div>
              <h3 className="font-semibold text-gray-900">Scholar's Ledger</h3>
              <p className="text-sm text-gray-600 mt-1">Manage tasks</p>
            </Link>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Campus Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Grievances</h4>
                <p className="text-sm text-gray-600 mb-4">Submit campus grievances, track status, and communicate with authorities about your issues.</p>
                <Link to="/my-grievances" className="text-blue-600 font-semibold hover:underline text-sm">View Grievances →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-emerald-600 mb-2">Opportunities</h4>
                <p className="text-sm text-gray-600 mb-4">Explore internships and research opportunities posted by faculty. Apply and track your applications.</p>
                <Link to="/opportunities" className="text-emerald-600 font-semibold hover:underline text-sm">Browse Opportunities →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-cyan-600 mb-2">Academic Resources</h4>
                <p className="text-sm text-gray-600 mb-4">Access the Vault of Knowledge with past papers, notes, and study materials shared by peers.</p>
                <Link to="/vault" className="text-cyan-600 font-semibold hover:underline text-sm">View Resources →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-orange-600 mb-2">Calendar & Events</h4>
                <p className="text-sm text-gray-600 mb-4">Stay updated with the academic calendar, exam dates, and important institutional events.</p>
                <Link to="/calendar" className="text-orange-600 font-semibold hover:underline text-sm">View Calendar →</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Student Dashboard</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Submit and track your grievances</li>
              <li>✓ Browse and apply for opportunities</li>
              <li>✓ Access academic resources and materials</li>
              <li>✓ Manage personal tasks in Scholar's Ledger</li>
              <li>✓ Communicate with faculty through inbox</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // FACULTY Dashboard (role_id = 2)
  if (user?.role_id === 2 || user?.role === 'faculty') {
    return (
      <div className="p-6">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name || 'Faculty'}</h1>
                <p className="text-gray-600 mt-1">Institute Email: {user?.institute_email}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Faculty</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link to="/faculty/opportunities" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">P</div>
              <h3 className="font-semibold text-gray-900">Post Opportunity</h3>
              <p className="text-sm text-gray-600 mt-1">Create new postings</p>
            </Link>
            <Link to="/faculty/applications" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">A</div>
              <h3 className="font-semibold text-gray-900">Review Applications</h3>
              <p className="text-sm text-gray-600 mt-1">Manage student applications</p>
            </Link>
            <Link to="/inbox" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">M</div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600 mt-1">Communicate with students</p>
            </Link>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Faculty Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Opportunity Management</h4>
                <p className="text-sm text-gray-600 mb-4">Post internships and research opportunities, manage applications, and select candidates from your pool.</p>
                <Link to="/faculty/opportunities" className="text-blue-600 font-semibold hover:underline text-sm">Manage Opportunities →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Student Communications</h4>
                <p className="text-sm text-gray-600 mb-4">Send messages to students interested in your opportunities. Answer questions and provide feedback.</p>
                <Link to="/inbox" className="text-blue-600 font-semibold hover:underline text-sm">View Inbox →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Grievance System</h4>
                <p className="text-sm text-gray-600 mb-4">View and respond to grievances if you're designated as coordinator or authority.</p>
                <Link to="/my-grievances" className="text-blue-600 font-semibold hover:underline text-sm">View Grievances →</Link>
              </div>
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <h4 className="font-semibold text-cyan-600 mb-2">Academic Resources</h4>
                <p className="text-sm text-gray-600 mb-4">Access the Vault of Knowledge to share materials and resources with students.</p>
                <Link to="/vault" className="text-cyan-600 font-semibold hover:underline text-sm">View Vault →</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Faculty Dashboard</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Post and manage internship opportunities</li>
              <li>✓ Review and shortlist student applications</li>
              <li>✓ Communicate directly with interested students</li>
              <li>✓ Share academic resources and materials</li>
              <li>✓ Participate in grievance resolution</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // ADMIN/AUTHORITY Dashboard (role_id = 3 or 4) - Full CRUD Powers
  if (user?.role_id === 3 || user?.role_id === 4 || user?.role === 'admin' || user?.role === 'authority') {
    const isAdmin = user?.role_id === 4;
    const isAuthority = user?.role_id === 3;
    const roleTitle = isAdmin ? 'Administrator' : 'Authority';
    
    return (
      <div className="p-6">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name || roleTitle}</h1>
                <p className="text-gray-600 mt-1">Institute Email: {user?.institute_email}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {isAdmin ? 'Full Administrator' : 'Authority User'} 
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions - CRUD Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/admin" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">D</div>
              <h3 className="font-semibold text-gray-900">System Admin</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: Users, Roles, Settings</p>
            </Link>
            <Link to="/authority/grievances" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">G</div>
              <h3 className="font-semibold text-gray-900">Grievances</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: All grievances & resolution</p>
            </Link>
            <Link to="/opportunities" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">O</div>
              <h3 className="font-semibold text-gray-900">Opportunities</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: All opportunities & approvals</p>
            </Link>
            <Link to="/vault" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">R</div>
              <h3 className="font-semibold text-gray-900">Resources</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: All academic materials</p>
            </Link>
          </div>

          {/* Extended Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/calendar" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">C</div>
              <h3 className="font-semibold text-gray-900">Calendar</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: Events & schedules</p>
            </Link>
            <Link to="/faculty/opportunities" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">F</div>
              <h3 className="font-semibold text-gray-900">Faculty Portal</h3>
              <p className="text-xs text-gray-600 mt-1">Manage faculty postings</p>
            </Link>
            <Link to="/faculty/applications" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">A</div>
              <h3 className="font-semibold text-gray-900">Applications</h3>
              <p className="text-xs text-gray-600 mt-1">CRUD: All applications</p>
            </Link>
            <Link to="/inbox" className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition">
              <div className="text-3xl font-bold text-blue-600 mb-2">M</div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-xs text-gray-600 mt-1">Monitor all communications</p>
            </Link>
          </div>

          {/* Comprehensive Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Administrative Control - All CRUD Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">User & Role Management</h4>
                <p className="text-sm text-gray-600 mb-4">Create, read, update, delete users. Manage roles and permissions. Assign role_id (1=Student, 2=Faculty, 3=Authority, 4=Admin).</p>
                <Link to="/admin" className="text-blue-600 font-semibold hover:underline text-sm">Manage Users →</Link>
              </div>
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Grievance Management</h4>
                <p className="text-sm text-gray-600 mb-4">Full CRUD on all grievances. Assign to authorities, resolve, close, reopen. Add comments and track resolution progress.</p>
                <Link to="/authority/grievances" className="text-blue-600 font-semibold hover:underline text-sm">Manage Grievances →</Link>
              </div>
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Opportunities & Applications</h4>
                <p className="text-sm text-gray-600 mb-4">Full CRUD on opportunities and applications. Approve postings, manage applications, assign to roles. Monitor all faculty postings.</p>
                <Link to="/opportunities" className="text-blue-600 font-semibold hover:underline text-sm">Manage Opportunities →</Link>
              </div>
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Academic Resources</h4>
                <p className="text-sm text-gray-600 mb-4">Full CRUD on all resources in Vault. Moderate content, approve uploads, manage tags and categories, ensure quality.</p>
                <Link to="/vault" className="text-blue-600 font-semibold hover:underline text-sm">Manage Resources →</Link>
              </div>
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Academic Calendar</h4>
                <p className="text-sm text-gray-600 mb-4">Complete CRUD on calendar events, exam dates, holidays, and institutional schedules. Publish and manage academic timeline.</p>
                <Link to="/calendar" className="text-blue-600 font-semibold hover:underline text-sm">Manage Calendar →</Link>
              </div>
              <div className="p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600 mb-2">Communications & Monitoring</h4>
                <p className="text-sm text-gray-600 mb-4">Monitor all messages and communications. View faculty-student inbox. Track system notifications and alerts.</p>
                <Link to="/inbox" className="text-blue-600 font-semibold hover:underline text-sm">View Communications →</Link>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              {isAdmin ? '🔒 Full Admin - Complete System Control' : '🔐 Authority - Full Platform Access'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Create/Read/Update/Delete all users</li>
                <li>✓ Manage all user roles and permissions</li>
                <li>✓ Full grievance lifecycle management</li>
                <li>✓ Approve/Reject all opportunities</li>
                <li>✓ Manage all applications and selections</li>
              </ul>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Complete resource moderation</li>
                <li>✓ Create/manage academic calendar</li>
                <li>✓ Monitor all communications</li>
                <li>✓ System monitoring & analytics</li>
                <li>✓ Full audit trail access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback for unknown roles
  return (
    <div className="p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.full_name}</h1>
        <p className="text-gray-600">Your role has limited dashboard functionality.</p>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { auth } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    auth.me().then(res => { if (mounted) { setUser(res.user); setLoading(false) } }).catch(() => {
      localStorage.removeItem('aegis_token')
      navigate('/login')
    })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name || user?.institute_email}</h1>
        <p className="text-slate-600 mt-2">Role: <span className="font-semibold capitalize text-indigo-700">{user?.role}</span></p>
      </div>

      <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to AEGIS</h2>
        <p className="text-slate-700">Your all-in-one campus platform for grievances, academics, and opportunities. Use the sidebar to navigate and explore features.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2 font-bold text-indigo-600">G</div>
          <h3 className="font-semibold text-gray-700">Grievances</h3>
          <p className="text-xs text-slate-600 mt-1">Submit & track issues</p>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2 font-bold text-emerald-600">O</div>
          <h3 className="font-semibold text-gray-700">Opportunities</h3>
          <p className="text-xs text-slate-600 mt-1">Internships & research</p>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2 font-bold text-blue-600">A</div>
          <h3 className="font-semibold text-gray-700">Academics</h3>
          <p className="text-xs text-slate-600 mt-1">Calendar & resources</p>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          <div className="text-2xl mb-2 font-bold text-purple-600">L</div>
          <h3 className="font-semibold text-gray-700">Scholar's Ledger</h3>
          <p className="text-xs text-slate-600 mt-1">Manage your tasks</p>
        </div>
      </div>

      {/* Feature Overview */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-blue-600 mb-2">Pillar I: Grievance Management</h4>
            <p className="text-sm text-slate-600">Raise and track campus grievances with real-time updates and anonymous submissions.</p>
          </div>
          <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-emerald-600 mb-2">Pillar IV: Opportunities & Applications</h4>
            <p className="text-sm text-slate-600">Browse internships, apply with resumes, and track your applications seamlessly.</p>
          </div>
          <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-indigo-600 mb-2">Pillar III: Academic Resources</h4>
            <p className="text-sm text-slate-600">Access the Vault of Knowledge, Destiny Manager for academics, and Chronos Calendar for events.</p>
          </div>
          <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-purple-600 mb-2">Scholar's Ledger</h4>
            <p className="text-sm text-slate-600">Create and manage personal tasks with categories, progress tracking, and reminders.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

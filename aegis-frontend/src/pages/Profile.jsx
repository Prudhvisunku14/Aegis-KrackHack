import React, { useEffect, useState } from 'react'
import { auth } from '../services/api'
import api from '../services/api'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [msgType, setMsgType] = useState(null)

  useEffect(() => {
    let mounted = true
    auth.me().then(res => {
      if (!mounted) return
      const u = res.user || res
      setUser(u)
      setName(u.full_name || '')
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  async function save() {
    if (!user) return
    setSaving(true); setMsg(null); setMsgType(null)
    try {
      const id = user.user_id || user.id
      const updated = await api.request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify({ full_name: name }) })
      setUser(updated)
      setMsg('Profile updated successfully')
      setMsgType('success')
    } catch (err) {
      setMsg(err?.body?.message || 'Failed to save profile')
      setMsgType('error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return (
    <div className="p-6 flex items-center justify-center h-screen">
      <div className="text-gray-600">Loading profile...</div>
    </div>
  )

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.institute_email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                {initials}
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center font-semibold">{user.role?.toUpperCase() || 'USER'}</p>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.full_name || 'Not Set'}</h2>
              <p className="text-gray-600 mb-4">{user.institute_email}</p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User ID</span>
                  <p className="text-sm text-gray-800 font-mono">{user.user_id || user.id}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Status</span>
                  <p className="text-sm text-green-700 font-semibold">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Profile Information</h3>

          {/* Messages */}
          {msg && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              msgType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <span className="text-lg">{msgType === 'success' ? '✓' : '✕'}</span>
              <span className="text-sm font-medium">{msg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Institute Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Institute Email</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm font-mono">
                {user.institute_email}
              </div>
              <p className="text-xs text-gray-500 mt-1">This email cannot be changed</p>
            </div>

            {/* Full Name (Editable) */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Your name as it appears in the system</p>
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Role</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full capitalize">
                  {user.role || user.role_id || 'User'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Your role determines access to platform features</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || !name.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    saving || !name.trim()
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setName(user.full_name || '')}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">Account Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Your profile is secure and only visible to authorized users</li>
            <li>✓ Changes are saved immediately to the system</li>
            <li>✓ Email address is linked to your institutional account</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

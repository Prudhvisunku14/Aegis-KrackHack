import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageUsers, setPageUsers] = useState(1);
  const [pageLogs, setPageLogs] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    api.auth.me().then(user => setCurrentUser(user)).catch(() => navigate('/login'));
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    if (!currentUser) return;
    if (tab === 'users') fetchUsers();
    else if (tab === 'logs') fetchLogs();
    else if (tab === 'health') fetchHealth();
  }, [tab, pageUsers, pageLogs, roleFilter, statusFilter, currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: pageUsers,
        limit: 20,
        role: roleFilter,
        status: statusFilter,
      });
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const { data, meta } = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/logs?page=${pageLogs}&limit=15`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch logs');
      const { data } = await response.json();
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/health`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
          },
          body: JSON.stringify({ role_name: newRole }),
        }
      );
      if (!response.ok) throw new Error('Failed to update role');
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/admin/users/${userId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
          },
          body: JSON.stringify({ is_active: !isActive }),
        }
      );
      if (!response.ok) throw new Error('Failed to toggle status');
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">{currentUser?.full_name} (Admin)</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {['users', 'logs', 'health'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-semibold ${
                tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <select
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPageUsers(1); }}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="authority">Authority</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPageUsers(1); }}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.user_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{user.full_name}</td>
                        <td className="px-4 py-2">{user.institute_email}</td>
                        <td className="px-4 py-2">
                          <select
                            value={user.role_name || 'student'}
                            onChange={e => updateUserRole(user.user_id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded"
                            disabled={currentUser?.id === user.user_id} // Prevent self-demotion
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="authority">Authority</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-white text-xs ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                            className={`px-2 py-1 rounded text-xs text-white ${
                              user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                            disabled={currentUser?.id === user.user_id}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPageUsers(Math.max(1, pageUsers - 1))}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                Prev
              </button>
              <span className="px-3 py-1">{pageUsers}</span>
              <button
                onClick={() => setPageUsers(pageUsers + 1)}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {tab === 'logs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Activity Logs</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">User</th>
                      <th className="px-4 py-2 text-left">Action</th>
                      <th className="px-4 py-2 text-left">Details</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs">{log.user_id || 'System'}</td>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2 text-gray-600">{log.details}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No logs found</p>
            )}
          </div>
        )}

        {/* System Health Tab */}
        {tab === 'health' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">System Health</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : health ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="text-gray-600 text-sm">Total Users</div>
                  <div className="text-3xl font-bold text-blue-600">{health.total_users || 0}</div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="text-gray-600 text-sm">Active Grievances</div>
                  <div className="text-3xl font-bold text-green-600">{health.total_grievances || 0}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <div className="text-gray-600 text-sm">Activity Logs</div>
                  <div className="text-3xl font-bold text-yellow-600">{health.total_logs || 0}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  <div className="text-gray-600 text-sm">DB Status</div>
                  <div className="text-lg font-bold text-purple-600">{health.db_status || 'Unknown'}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No health data</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

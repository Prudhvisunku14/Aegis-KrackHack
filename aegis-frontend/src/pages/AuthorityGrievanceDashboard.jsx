import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthorityGrievanceDashboard() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [tab, setTab] = useState('list'); // list, detail, update, analytics

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grievances
        let url = `${import.meta.env.VITE_API_BASE}/api/authority/dashboard?page=${page}&limit=20`;
        if (filterStatus) url += `&status=${filterStatus}`;
        if (filterPriority) url += `&priority=${filterPriority}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch grievances');
        const { data, meta } = await res.json();
        setGrievances(data);
        setTotal(meta.total);

        // Fetch departments (for assignment)
        const deptRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/users?limit=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
        });
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          const uniqueDepts = [...new Map(deptData.data.map(u => [u.department_id, u])).values()];
          setDepartments(uniqueDepts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filterStatus, filterPriority]);

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority?.toLowerCase()] || 'text-gray-600';
  };

  const assignGrievance = async (grievanceId, departmentId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/authority/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
        },
        body: JSON.stringify({ grievance_id: grievanceId, department_id: departmentId }),
      });
      if (!res.ok) throw new Error('Failed to assign grievance');
      setError('');
      // Refresh list
      const index = grievances.findIndex(g => g.grievance_id === grievanceId);
      if (index >= 0) {
        const updatedGrievances = [...grievances];
        updatedGrievances[index].assigned_to = departmentId;
        setGrievances(updatedGrievances);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (grievanceId, newStatus, remarks) => {
    if (!remarks.trim()) {
      setError('Remarks are required for status updates');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/authority/status-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
        },
        body: JSON.stringify({
          grievance_id: grievanceId,
          status: newStatus,
          remarks: remarks,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setError('');
      // Refresh the grievance
      const updatedRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/grievances/${grievanceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
      });
      const updated = await updatedRes.json();
      setSelectedGrievance(updated);
      // Refresh list
      const index = grievances.findIndex(g => g.grievance_id === grievanceId);
      if (index >= 0) {
        const updatedGrievances = [...grievances];
        updatedGrievances[index].status = newStatus;
        setGrievances(updatedGrievances);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/authority/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    if (tab === 'analytics') {
      fetchAnalytics().then(data => setAnalytics(data));
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Grievance Management Dashboard</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b bg-white rounded-t-lg">
          {['list', 'analytics'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 font-semibold ${
                tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'list' ? 'Grievances' : 'Analytics'}
            </button>
          ))}
        </div>

        {/* Grievances List Tab */}
        {tab === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">All Grievances</h2>

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={e => { setFilterPriority(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {grievances.map(g => (
                        <div
                          key={g.grievance_id}
                          onClick={() => setSelectedGrievance(g)}
                          className={`p-4 border rounded cursor-pointer transition ${
                            selectedGrievance?.grievance_id === g.grievance_id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold">#{g.grievance_id}</h3>
                              <p className="text-sm text-gray-600">{g.description?.substring(0, 50) || 'No description'}...</p>
                              <p className="text-xs text-gray-500">{g.category_name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(g.status)}`}>
                              {g.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex gap-3 text-sm text-gray-600">
                            <span className={`font-medium ${getPriorityColor(g.priority_name)}`}>
                              {g.priority_name}
                            </span>
                            <span>{g.submitted_by ? 'Registered' : 'Anonymous'}</span>
                            <span>{new Date(g.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {page} of {Math.ceil(total / 20)}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page * 20 >= total}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Detail/Update */}
            <div className="lg:col-span-1">
              {selectedGrievance ? (
                <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setTab('detail')}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        tab === 'detail' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setTab('update')}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                        tab === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Update
                    </button>
                  </div>

                  {tab === 'detail' && (
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-semibold text-gray-600">ID</label>
                        <p>#{selectedGrievance.grievance_id}</p>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-600">Status</label>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedGrievance.status)}`}>
                          {selectedGrievance.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-600">Reporter</label>
                        <p>{selectedGrievance.submitted_by ? (selectedGrievance.reporter_name || 'User') : 'Anonymous'}</p>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-600">Assigned to</label>
                        <p>{selectedGrievance.assigned_to || 'Unassigned'}</p>
                      </div>
                      <div className="pt-3">
                        <label className="font-semibold text-gray-600 block mb-2">Assign Department</label>
                        <select
                          onChange={e => assignGrievance(selectedGrievance.grievance_id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          defaultValue=""
                        >
                          <option value="">Select department</option>
                          {departments.map(d => (
                            <option key={d.department_id} value={d.department_id}>
                              {d.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {tab === 'update' && (
                    <GrievanceUpdateForm
                      grievance={selectedGrievance}
                      onUpdate={updateStatus}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select a grievance to manage
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Analytics & Insights</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-gray-600 text-sm">Pending 72+h</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.summary?.pending_over_72h || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-gray-600 text-sm">Avg Resolution</p>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.summary?.avg_resolution_days} days
                    </p>
                  </div>
                </div>

                {/* Status Distribution */}
                <div>
                  <h3 className="font-semibold mb-3">By Status</h3>
                  <div className="space-y-2">
                    {analytics.summary?.total_by_status?.map(item => (
                      <div key={item.status} className="flex justify-between text-sm">
                        <span className="capitalize">{item.status?.replace('_', ' ')}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="col-span-full">
                  <h3 className="font-semibold mb-3">Top Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analytics.summary?.total_by_category?.slice(0, 6).map(item => (
                      <div key={item.category_name} className="bg-gray-50 p-3 rounded text-sm">
                        <p className="font-medium text-gray-900">{item.category_name}</p>
                        <p className="text-gray-600">{item.count} grievances</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading analytics...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GrievanceUpdateForm({ grievance, onUpdate }) {
  const [status, setStatus] = useState(grievance.status);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate(grievance.grievance_id, status, remarks);
    setSaving(false);
    setRemarks('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">New Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="Add authority remarks/action taken..."
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className={`w-full py-2 rounded text-white font-medium ${
          saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  );
}

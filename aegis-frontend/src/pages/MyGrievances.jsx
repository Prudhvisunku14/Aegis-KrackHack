import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyGrievances() {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  useEffect(() => {
    fetchGrievances();
  }, [page]);

  const fetchGrievances = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/grievances/my/submissions?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch grievances');
      const { data, meta } = await res.json();
      setGrievances(data);
      setTotal(meta.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const viewDetails = async (grievanceId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/grievances/${grievanceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setSelectedGrievance(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Grievances</h1>
          <button
            onClick={() => navigate('/submit-grievance')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Grievance
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grievances List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : grievances.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500 mb-4">No grievances submitted yet</p>
                <button
                  onClick={() => navigate('/submit-grievance')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit your first grievance
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {grievances.map(g => (
                    <div
                      key={g.grievance_id}
                      onClick={() => viewDetails(g.grievance_id)}
                      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">#{g.grievance_id} - {g.description?.substring(0, 50) || 'No description'}...</h3>
                          <p className="text-sm text-gray-600">{g.category_name || 'Uncategorized'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(g.status)}`}>
                          {g.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className={`font-medium ${getPriorityColor(g.priority_name)}`}>
                          {g.priority_name || 'Normal'}
                        </span>
                        <span>{new Date(g.created_at).toLocaleDateString()}</span>
                      </div>
                      {!g.submitted_by && (
                        <p className="text-xs text-green-600 mt-2">📝 Submitted anonymously</p>
                      )}
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
                    Page {page} of {Math.ceil(total / 10)}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 10 >= total}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedGrievance ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Grievance ID</label>
                    <p className="text-gray-900">#{selectedGrievance.grievance_id}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Status</label>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedGrievance.status)}`}>
                      {selectedGrievance.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedGrievance.category_name || 'Uncategorized'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Priority</label>
                    <p className={`font-medium ${getPriorityColor(selectedGrievance.priority_name)}`}>
                      {selectedGrievance.priority_name || 'Normal'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Location</label>
                    <p className="text-gray-900">{selectedGrievance.location || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Submitted</label>
                    <p className="text-gray-900">
                      {new Date(selectedGrievance.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Description</label>
                    <p className="text-gray-900 text-sm">{selectedGrievance.description}</p>
                  </div>

                  {selectedGrievance.submitted_by ? (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Submitted By</label>
                      <p className="text-gray-900">{selectedGrievance.reporter_name || 'You'}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Submission Type</label>
                      <p className="text-green-600 text-sm">📝 Anonymous Submission</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a grievance to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

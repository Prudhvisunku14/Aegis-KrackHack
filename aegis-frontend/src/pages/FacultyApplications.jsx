import React, { useEffect, useState } from 'react';

export default function FacultyApplications() {
  const [postings, setPostings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);

  useEffect(() => {
    fetchMyPostings();
  }, []);

  async function fetchMyPostings() {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/opportunities/postings/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPostings(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicationsFor(oppId) {
    setSelected(oppId);
    setAppLoading(true);
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/applications?opportunity_id=${oppId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  }

  async function updateApplicationStatus(appId, status) {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/applications/${appId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApplications(apps => apps.map(app => app.application_id === appId ? { ...app, status } : app));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating application');
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl">
        <h1 className="text-4xl font-bold mb-6">Faculty Applications Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Postings Sidebar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">My Opportunity Postings</h2>
            {loading ? (
              <div className="text-center py-8">Loading postings...</div>
            ) : postings.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No postings yet</div>
            ) : (
              <div className="space-y-2">
                {postings.map((post) => (
                  <div
                    key={post.opportunity_id}
                    onClick={() => loadApplicationsFor(post.opportunity_id)}
                    className={`p-4 rounded cursor-pointer transition ${
                      selected === post.opportunity_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{post.title}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {post.status === 'OPEN' ? '✓ Open' : '✗ Closed'}
                    </div>
                    {post.deadline && (
                      <div className="text-xs mt-1 opacity-75">
                        Deadline: {new Date(post.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selected ? `Applications for Selected Opportunity` : 'Select an opportunity to view applications'}
            </h2>

            {appLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : !selected ? (
              <div className="text-center py-12 text-gray-500">
                Click on a posting to view its applications
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No applications yet for this opportunity
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const statusColor = {
                    APPLIED: 'bg-blue-100 text-blue-800',
                    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
                    SHORTLISTED: 'bg-purple-100 text-purple-800',
                    ACCEPTED: 'bg-green-100 text-green-800',
                    REJECTED: 'bg-red-100 text-red-800'
                  }[app.status] || 'bg-gray-100 text-gray-800';

                  return (
                    <div key={app.application_id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">Student ID: {app.student_id}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Applied: {new Date(app.applied_at).toLocaleString()}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded font-semibold ${statusColor}`}>
                          {app.status}
                        </span>
                      </div>

                      {app.resume_path && (
                        <a
                          href={`${import.meta.env.VITE_API_BASE}${app.resume_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
                        >
                          📄 View Resume
                        </a>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => updateApplicationStatus(app.application_id, 'UNDER_REVIEW')}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-semibold"
                        >
                          Under Review
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.application_id, 'SHORTLISTED')}
                          className="px-3 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm font-semibold"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.application_id, 'ACCEPTED')}
                          className="px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm font-semibold"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.application_id, 'REJECTED')}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function FacultyPortal() {
  const [postings, setPostings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    stipend: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(true);

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

  async function handleCreatePosting(e) {
    e.preventDefault();
    if (!form.title || !form.description) return alert('Title and description are required');

    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/opportunities`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: '', description: '', required_skills: '', duration: '', stipend: '', deadline: '' });
        setShowForm(false);
        fetchMyPostings();
        alert('Opportunity posted successfully!');
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Failed to post'));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClosePosting(oppId) {
    if (!confirm('Close this opportunity?')) return;
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/opportunities/${oppId}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMyPostings();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Faculty Portal - Opportunities</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Post New Opportunity'}
          </button>
        </div>

        {/* Post Opportunity Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleCreatePosting} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Opportunity Title *</label>
                <input
                  placeholder="e.g., Summer Research Internship"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Description *</label>
                <textarea
                  placeholder="Detailed description of the opportunity..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Required Skills</label>
                  <input
                    placeholder="e.g., Python, Machine Learning, Data Analysis"
                    value={form.required_skills}
                    onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Duration</label>
                  <input
                    placeholder="e.g., 3 months, 6 weeks"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Stipend (if applicable)</label>
                  <input
                    placeholder="e.g., ₹5,000/month"
                    value={form.stipend}
                    onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Application Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold">
                Post Opportunity
              </button>
            </form>
          </div>
        )}

        {/* My Postings */}
        <h2 className="text-2xl font-bold mb-4">My Opportunity Postings</h2>
        {loading ? (
          <div className="text-center py-8">Loading postings...</div>
        ) : postings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No postings yet. Post your first opportunity!</div>
        ) : (
          <div className="space-y-4">
            {postings.map((opp) => (
              <div key={opp.opportunity_id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{opp.title}</h3>
                    <p className="text-gray-600">Posted on {new Date(opp.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded font-semibold ${
                    opp.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {opp.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{opp.description}</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  {opp.required_skills && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Skills: {opp.required_skills}</span>}
                  {opp.duration && <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">{opp.duration}</span>}
                  {opp.stipend && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">₹{opp.stipend}</span>}
                  {opp.deadline && <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/faculty/applications?opportunity_id=${opp.opportunity_id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Applications
                  </a>
                  {opp.status === 'OPEN' && (
                    <button
                      onClick={() => handleClosePosting(opp.opportunity_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Close Posting
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

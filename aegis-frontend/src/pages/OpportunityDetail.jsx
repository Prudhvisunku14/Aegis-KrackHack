import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OpportunityDetail() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [studentApplication, setStudentApplication] = useState(null);

  useEffect(() => {
    fetchOpportunityDetail();
    checkBookmarkStatus();
    checkApplicationStatus();
  }, [id]);

  async function fetchOpportunityDetail() {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOpportunity(data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function checkBookmarkStatus() {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const bookmarks = data.data || [];
      const isBookmarked = bookmarks.some(b => b.opportunity_id === parseInt(id));
      setBookmarked(isBookmarked);
    } catch (err) {
      console.error(err);
    }
  }

  async function checkApplicationStatus() {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/applications?opportunity_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const apps = data.data || [];
      if (apps.length > 0) {
        setStudentApplication(apps[0]); // Get first application for this student
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApply(e) {
    e.preventDefault();
    if (!resumeFile) return alert('Please attach a resume');

    setApplying(true);
    try {
      const token = localStorage.getItem('aegis_token');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/applications/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('Application submitted successfully!');
        setResumeFile(null);
        checkApplicationStatus();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Failed to submit application'));
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting application');
    } finally {
      setApplying(false);
    }
  }

  async function handleToggleBookmark() {
    try {
      const token = localStorage.getItem('aegis_token');

      if (bookmarked) {
        // Remove bookmark
        await fetch(`${import.meta.env.VITE_API_BASE}/api/bookmarks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Add bookmark
        await fetch(`${import.meta.env.VITE_API_BASE}/api/bookmarks`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity_id: parseInt(id) })
        });
      }

      setBookmarked(!bookmarked);
    } catch (err) {
      console.error(err);
      alert('Error managing bookmark');
    }
  }

  if (loading) return <div className="text-center py-8">Loading opportunity...</div>;
  if (!opportunity) return <div className="text-center py-8 text-red-600">Opportunity not found</div>;

  const statusColors = {
    APPLIED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{opportunity.title}</h1>
              <p className="text-gray-600">
                Posted on {new Date(opportunity.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleToggleBookmark}
              className={`px-4 py-2 rounded font-semibold transition ${
                bookmarked
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {bookmarked ? '❤️ Bookmarked' : '🤍 Bookmark'}
            </button>
          </div>

          {/* Status Info */}
          <div className="mb-6 flex items-center gap-4">
            <span className={`px-3 py-1 rounded font-semibold ${
              opportunity.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {opportunity.status === 'OPEN' ? '✓ Accepting Applications' : '✗ Closed'}
            </span>
            {opportunity.deadline && (
              <span className="text-gray-600">
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Opportunity Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">About this opportunity</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{opportunity.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {opportunity.required_skills && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Required Skills</h3>
                  <p className="text-gray-600">{opportunity.required_skills}</p>
                </div>
              )}
              {opportunity.duration && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Duration</h3>
                  <p className="text-gray-600">{opportunity.duration}</p>
                </div>
              )}
              {opportunity.stipend && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Stipend</h3>
                  <p className="text-gray-600">₹{opportunity.stipend}</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Section */}
          <div className="border-t pt-6">
            {studentApplication ? (
              <div>
                <h3 className="text-xl font-bold mb-4">Your Application</h3>
                <div className={`px-4 py-3 rounded mb-4 ${statusColors[studentApplication.status] || 'bg-gray-100'}`}>
                  <div className="font-semibold">Status: {studentApplication.status}</div>
                  <div className="text-sm mt-2">
                    Applied on {new Date(studentApplication.applied_at).toLocaleString()}
                  </div>
                </div>
                {studentApplication.resume_path && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE}${studentApplication.resume_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    📄 View Your Submitted Resume
                  </a>
                )}
              </div>
            ) : opportunity.status === 'OPEN' ? (
              <form onSubmit={handleApply} className="space-y-4">
                <h3 className="text-xl font-bold">Apply for this opportunity</h3>
                <div>
                  <label className="block font-semibold mb-2">Resume / Portfolio *</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                </div>
                <button
                  type="submit"
                  disabled={applying}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 text-gray-600">
                This opportunity is no longer accepting applications
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

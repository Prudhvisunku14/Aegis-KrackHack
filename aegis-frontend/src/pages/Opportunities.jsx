import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    skills: '',
    duration: '',
    stipend: 'any'
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const token = localStorage.getItem('aegis_token');
      const params = new URLSearchParams();

      if (filter.skills) params.append('skills', filter.skills);
      if (filter.duration) params.append('duration', filter.duration);
      if (filter.stipend !== 'any') params.append('stipend', filter.stipend);

      const queryString = params.toString();
      const url = `${import.meta.env.VITE_API_BASE}/api/opportunities?${queryString}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOpportunities(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">Opportunities</h1>
        <p className="text-gray-600 mb-6">Explore internships, research positions, and other opportunities</p>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-4">Filter Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-2">Skills</label>
              <input
                type="text"
                placeholder="e.g., Python, Machine Learning"
                value={filter.skills}
                onChange={(e) => setFilter({ ...filter, skills: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Duration</label>
              <input
                type="text"
                placeholder="e.g., 3 months"
                value={filter.duration}
                onChange={(e) => setFilter({ ...filter, duration: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Stipend</label>
              <select
                value={filter.stipend}
                onChange={(e) => setFilter({ ...filter, stipend: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="any">Any stipend</option>
                <option value="yes">Has stipend</option>
                <option value="no">No stipend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        {opportunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No opportunities found matching your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.opportunity_id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{opp.title}</h3>
                    <p className="text-gray-600 mt-2">
                      {opp.description && opp.description.length > 200
                        ? `${opp.description.substring(0, 200)}...`
                        : opp.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded font-semibold ml-4 whitespace-nowrap ${
                    opp.status === 'OPEN'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {opp.status === 'OPEN' ? '✓ Open' : '✗ Closed'}
                  </span>
                </div>

                {/* Opportunity Details */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {opp.required_skills && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                      📚 {opp.required_skills}
                    </span>
                  )}
                  {opp.duration && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">
                      ⏱️ {opp.duration}
                    </span>
                  )}
                  {opp.stipend && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      💰 ₹{opp.stipend}
                    </span>
                  )}
                  {opp.deadline && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
                      📅 Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Link
                    to={`/opportunities/${opp.opportunity_id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
                  >
                    View Details & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

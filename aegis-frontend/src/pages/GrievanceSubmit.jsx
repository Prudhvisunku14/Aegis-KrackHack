import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GrievanceSubmit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority_id: '',
    location: '',
    anonymous: false,
  });
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/grievance_category`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
        });
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const { data: catData } = await catRes.json();
        setCategories(catData || []);

        const priRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/grievance_priority`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` },
        });
        if (!priRes.ok) throw new Error('Failed to fetch priorities');
        const { data: priData } = await priRes.json();
        setPriorities(priData || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load categories and priorities: ' + err.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoSelect = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Submit grievance with correct field mapping
      const submitData = {
        title: formData.title,
        description: formData.description,
        category_id: parseInt(formData.category_id, 10),
        priority_id: formData.priority_id ? parseInt(formData.priority_id, 10) : null,
        location: formData.location || null,
        anonymous: formData.anonymous,
      };

      const submitRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/grievances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json();
        throw new Error(errData.message || 'Failed to submit grievance');
      }

      const grievanceData = await submitRes.json();
      const grievanceId = grievanceData.grievance_id;

      // Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          const photoFormData = new FormData();
          photoFormData.append('photo', photo);
          photoFormData.append('grievance_id', grievanceId);

          await fetch(`${import.meta.env.VITE_API_BASE}/api/authority/upload-photo`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('aegis_token')}`,
            },
            body: photoFormData,
          });
        }
      }

      setSuccess('Grievance submitted successfully!');
      setTimeout(() => navigate('/my-grievances'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Submit a Grievance</h1>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">Title (Brief description)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hostel wifi not working"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Detailed Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed information about the issue..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority Level</label>
              <select
                name="priority_id"
                value={formData.priority_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select priority (optional)</option>
                {priorities.map(pri => (
                  <option key={pri.priority_id} value={pri.priority_id}>
                    {pri.priority_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hostel B, Room 201"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Attach Photos (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
              />
              {photos.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">{photos.length} file(s) selected</p>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Submit anonymously (identity will not be visible)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded text-white font-medium ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Grievance'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

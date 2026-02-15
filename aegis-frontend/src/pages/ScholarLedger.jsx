import React, { useState, useEffect } from 'react';

export default function ScholarLedger() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [form, setForm] = useState({ title: '', description: '', category: '', due_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [filters]);

  async function fetchTasks() {
    try {
      const token = localStorage.getItem('aegis_token');
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tasks/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!form.title) return alert('Title is required');

    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: '', description: '', category: '', due_date: '' });
        setShowForm(false);
        fetchTasks();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Failed to create task'));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateTask(taskId, updates) {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Scholar's Ledger</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                placeholder="Task Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-2 border rounded"
                >
                  <option value="">Select category...</option>
                  <option value="assignments">Assignments</option>
                  <option value="projects">Projects</option>
                  <option value="exam_prep">Exam Prep</option>
                  <option value="personal_goals">Personal Goals</option>
                </select>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="px-4 py-2 border rounded"
                />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tasks yet. Create one to get started!</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.task_id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{task.title}</h3>
                    {task.description && <p className="text-gray-600 text-sm">{task.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {task.category && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{task.category}</span>}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.due_date && <span className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <div className="w-24">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{task.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition" style={{ width: `${task.progress_percentage}%` }}></div>
                      </div>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTask(task.task_id, { status: e.target.value })}
                      className="px-2 py-1 text-xs border rounded"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={task.progress_percentage}
                      onChange={(e) => handleUpdateTask(task.task_id, { progress_percentage: parseInt(e.target.value) })}
                      className="w-24"
                      title="Progress"
                    />
                    <button
                      onClick={() => handleDeleteTask(task.task_id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

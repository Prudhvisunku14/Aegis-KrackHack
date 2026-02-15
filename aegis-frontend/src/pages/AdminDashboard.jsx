import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, admin, authority, opportunities } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalGrievances: 0,
    grievancesPending: 0,
    grievancesResolved: 0,
    opportunities: 0,
    resources: 0,
  });
  const [users, setUsers] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageGrievances, setPageGrievances] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [grievanceStatus, setGrievanceStatus] = useState('');
  const [grievanceRemarks, setGrievanceRemarks] = useState('');
  const [grievanceAssignedTo, setGrievanceAssignedTo] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updateRole, setUpdateRole] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [resourceItems, setResourceItems] = useState([]);
  const [resourceTags, setResourceTags] = useState([]);
  const [resourceCourses, setResourceCourses] = useState([]);
  const [resourceYears, setResourceYears] = useState([]);
  const [resourceQuery, setResourceQuery] = useState('');
  const [resourceTag, setResourceTag] = useState('');
  const [resourceCourse, setResourceCourse] = useState('');
  const [resourceYear, setResourceYear] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [resourcePage, setResourcePage] = useState(1);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const [opportunityItems, setOpportunityItems] = useState([]);
  const [opportunityPage, setOpportunityPage] = useState(1);
  const [opportunityLoading, setOpportunityLoading] = useState(false);
  const [opportunityError, setOpportunityError] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [opportunityCreating, setOpportunityCreating] = useState(false);
  const [opportunitySaving, setOpportunitySaving] = useState(false);
  const [opportunityCreateForm, setOpportunityCreateForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    stipend: '',
    deadline: '',
    department_id: '',
  });
  const [opportunityEditForm, setOpportunityEditForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    duration: '',
    stipend: '',
    deadline: '',
    department_id: '',
    status: '',
  });

  useEffect(() => {
    auth.me()
      .then(res => {
        setUser(res.user);
        setLoading(false);
        // Check if admin
        if (res.user?.role_id !== 4 && res.user?.role_id !== 3) {
          navigate('/dashboard');
        }
      })
      .catch(err => {
        navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    fetchStats();
    fetchUsers();
    fetchGrievances();
  }, [user, filterRole, userStatusFilter, pageUsers, pageGrievances]);

  useEffect(() => {
    if (activeTab !== 'resources') return;
    fetchResourceOptions();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'resources') return;
    fetchResources();
  }, [activeTab, resourceQuery, resourceTag, resourceCourse, resourceYear, resourceType, resourcePage]);

  useEffect(() => {
    if (activeTab !== 'opportunities') return;
    fetchOpportunities();
  }, [activeTab, opportunityPage]);

  const fetchStats = async () => {
    try {
      // Get dashboard data from authority endpoint
      const dashboardRes = await authority.getDashboard('?limit=1');
      const userRes = await admin.listUsers('?limit=1');
      const healthRes = await admin.getSystemHealth();
      
      // Calculate stats from response
      const grievanceData = dashboardRes.data || [];
      const userData = userRes.data || [];
      const pendingCount = grievanceData.filter(g => g.status === 'submitted' || g.status === 'under_review').length;
      const resolvedCount = grievanceData.filter(g => g.status === 'resolved' || g.status === 'closed').length;
      
      setStats({
        totalUsers: userRes.meta?.total || userData.length,
        totalStudents: userData.filter(u => u.role_id === 1).length,
        totalFaculty: userData.filter(u => u.role_id === 2).length,
        totalGrievances: dashboardRes.meta?.total || grievanceData.length,
        grievancesPending: pendingCount,
        grievancesResolved: resolvedCount,
        opportunities: typeof healthRes?.opportunities === 'number' ? healthRes.opportunities : 0,
        resources: typeof healthRes?.resources === 'number' ? healthRes.resources : 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers(`?limit=50&page=${pageUsers}${filterRole ? `&role=${filterRole}` : ''}`);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };

  const fetchGrievances = async () => {
    try {
      const response = await authority.getDashboard(`?limit=50&page=${pageGrievances}`);
      setGrievances(response.data || []);
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError('Failed to fetch grievances');
    }
  };

  const fetchResourceOptions = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const token = localStorage.getItem('aegis_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [tagRes, courseRes, yearRes] = await Promise.all([
        fetch(`${API_BASE}/api/resource_tags?limit=200`, { headers }),
        fetch(`${API_BASE}/api/courses?limit=200`, { headers }),
        fetch(`${API_BASE}/api/academic_year?limit=200`, { headers }),
      ]);

      const tagsData = await tagRes.json();
      const coursesData = await courseRes.json();
      const yearsData = await yearRes.json();

      setResourceTags(tagsData.data || []);
      setResourceCourses(coursesData.data || []);
      setResourceYears(yearsData.data || []);
    } catch (err) {
      console.error('Error loading resource options:', err);
    }
  };

  const fetchResources = async () => {
    try {
      setResourceLoading(true);
      setResourceError('');
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const token = localStorage.getItem('aegis_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      params.set('limit', '20');
      params.set('page', String(resourcePage));
      if (resourceQuery.trim()) params.set('q', resourceQuery.trim());
      if (resourceTag) params.set('tag', resourceTag);
      if (resourceCourse) params.set('course_id', resourceCourse);
      if (resourceYear) params.set('year_id', resourceYear);
      if (resourceType) params.set('type', resourceType);

      const res = await fetch(`${API_BASE}/api/academic_resources/search?${params.toString()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load resources');

      setResourceItems(data.data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setResourceError(err.message || 'Failed to load resources');
    } finally {
      setResourceLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setOpportunityLoading(true);
      setOpportunityError('');
      const response = await opportunities.list(`?limit=25&page=${opportunityPage}&status=ALL`);
      setOpportunityItems(response.data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunityError('Failed to fetch opportunities');
    } finally {
      setOpportunityLoading(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!opportunityCreateForm.title.trim()) {
      setOpportunityError('Title is required');
      return;
    }

    try {
      setOpportunityCreating(true);
      setOpportunityError('');
      const payload = {
        title: opportunityCreateForm.title.trim(),
        description: opportunityCreateForm.description.trim() || null,
        required_skills: opportunityCreateForm.required_skills.trim() || null,
        duration: opportunityCreateForm.duration.trim() || null,
        stipend: opportunityCreateForm.stipend !== '' ? Number(opportunityCreateForm.stipend) : null,
        deadline: opportunityCreateForm.deadline || null,
        department_id: opportunityCreateForm.department_id !== '' ? Number(opportunityCreateForm.department_id) : null,
      };
      await opportunities.create(payload);
      setOpportunityCreateForm({
        title: '',
        description: '',
        required_skills: '',
        duration: '',
        stipend: '',
        deadline: '',
        department_id: '',
      });
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      console.error('Error creating opportunity:', err);
      setOpportunityError(err.body?.message || err.message || 'Failed to create opportunity');
    } finally {
      setOpportunityCreating(false);
    }
  };

  const handleSelectOpportunity = (opp) => {
    setSelectedOpportunity(opp);
    setOpportunityEditForm({
      title: opp.title || '',
      description: opp.description || '',
      required_skills: opp.required_skills || '',
      duration: opp.duration || '',
      stipend: opp.stipend ?? '',
      deadline: opp.deadline ? opp.deadline.slice(0, 10) : '',
      department_id: opp.department_id ?? '',
      status: opp.status || '',
    });
  };

  const handleUpdateOpportunity = async () => {
    if (!selectedOpportunity) return;
    try {
      setOpportunitySaving(true);
      setOpportunityError('');
      const payload = {};
      if (opportunityEditForm.title.trim() !== '') payload.title = opportunityEditForm.title.trim();
      if (opportunityEditForm.description.trim() !== '') payload.description = opportunityEditForm.description.trim();
      if (opportunityEditForm.required_skills.trim() !== '') payload.required_skills = opportunityEditForm.required_skills.trim();
      if (opportunityEditForm.duration.trim() !== '') payload.duration = opportunityEditForm.duration.trim();
      if (opportunityEditForm.stipend !== '') payload.stipend = Number(opportunityEditForm.stipend);
      if (opportunityEditForm.deadline !== '') payload.deadline = opportunityEditForm.deadline;
      if (opportunityEditForm.department_id !== '') payload.department_id = Number(opportunityEditForm.department_id);
      if (opportunityEditForm.status) payload.status = opportunityEditForm.status;

      if (Object.keys(payload).length === 0) {
        setOpportunityError('No changes to update');
        return;
      }

      await opportunities.update(selectedOpportunity.opportunity_id, payload);
      setSelectedOpportunity(null);
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      console.error('Error updating opportunity:', err);
      setOpportunityError(err.body?.message || err.message || 'Failed to update opportunity');
    } finally {
      setOpportunitySaving(false);
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
    try {
      setOpportunityError('');
      await opportunities.remove(oppId);
      if (selectedOpportunity?.opportunity_id === oppId) setSelectedOpportunity(null);
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setOpportunityError(err.body?.message || err.message || 'Failed to delete opportunity');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole ? String(u.role_id) === String(filterRole) : true;
    const matchesStatus = userStatusFilter ? String(u.is_active) === userStatusFilter : true;
    const query = userSearch.trim().toLowerCase();
    const matchesSearch = query
      ? `${u.full_name || ''} ${u.institute_email || ''}`.toLowerCase().includes(query)
      : true;
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleLabel = (role_id) => {
    const roles = { 1: 'Student', 2: 'Faculty', 3: 'Authority', 4: 'Admin' };
    return roles[role_id] || 'Unknown';
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

  const handleUpdateUser = async (userId) => {
    if (!updateRole) {
      setError('Please select a role');
      return;
    }
    try {
      const response = await admin.updateUserRole(userId, { role_id: parseInt(updateRole) });
      setSuccess(`User role updated to ${getRoleLabel(parseInt(updateRole))}`);
      fetchUsers();
      setUpdateRole('');
      setUpdateName('');
      setUpdateEmail('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err.body?.message || err.message}`);
    }
  };

  const handleGrievanceAction = async (grievanceId, action) => {
    try {
      if (!grievanceStatus && action === 'update') {
        setError('Please select a status');
        return;
      }
      if (!grievanceRemarks && (action === 'update' || action === 'resolve')) {
        setError('Please add remarks');
        return;
      }

      if (action === 'update' || action === 'resolve') {
        // Update grievance status
        const newStatus = action === 'resolve' ? 'resolved' : grievanceStatus;
        await authority.updateGrievanceStatus({
          grievance_id: grievanceId,
          status: newStatus,
          remarks: grievanceRemarks,
        });
        setSuccess(`Grievance ${newStatus} successfully`);
      } else if (action === 'assign') {
        if (!grievanceAssignedTo) {
          setError('Please specify who to assign to');
          return;
        }
        // Assign grievance to someone
        await authority.assignGrievance({
          grievance_id: grievanceId,
          assigned_to_user_id: parseInt(grievanceAssignedTo),
        });
        setSuccess(`Grievance assigned successfully`);
      }

      setSelectedGrievance(null);
      setGrievanceStatus('');
      setGrievanceRemarks('');
      setGrievanceAssignedTo('');
      fetchGrievances();
    } catch (err) {
      console.error('Error with grievance action:', err);
      setError(`Failed to ${action} grievance: ${err.body?.message || err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await admin.toggleUserActive(userId, { is_active: !currentStatus });
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(`Failed to toggle user status: ${err.body?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-800 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-1">{user?.full_name} • Full Administrator</p>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 flex-wrap">
            {['overview', 'users', 'grievances', 'opportunities', 'resources', 'system'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold transition border-b-2 ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-600 border-blue-600'
                    : 'bg-white text-gray-700 border-transparent hover:text-blue-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
            <button onClick={() => setSuccess('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="text-gray-600 text-sm font-semibold">Total Users</div>
                <div className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 mt-2">Students: {stats.totalStudents} • Faculty: {stats.totalFaculty}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
                <div className="text-gray-600 text-sm font-semibold">Grievances</div>
                <div className="text-4xl font-bold text-red-600 mt-2">{stats.totalGrievances}</div>
                <div className="text-xs text-gray-500 mt-2">Pending: {stats.grievancesPending} • Resolved: {stats.grievancesResolved}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <div className="text-gray-600 text-sm font-semibold">Total Opportunities</div>
                <div className="text-4xl font-bold text-green-600 mt-2">{stats.opportunities}</div>
                <div className="text-xs text-gray-500 mt-2">All  opportunities</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
                <div className="text-gray-600 text-sm font-semibold">Total Resources</div>
                <div className="text-4xl font-bold text-purple-600 mt-2">{stats.resources}</div>
                <div className="text-xs text-gray-500 mt-2">All resources</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition text-center"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold text-gray-900">Manage Users</div>
                  <div className="text-sm text-gray-600 mt-1">CRUD operations</div>
                </button>
                <button
                  onClick={() => setActiveTab('grievances')}
                  className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition text-center"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold text-gray-900">Grievances</div>
                  <div className="text-sm text-gray-600 mt-1">Review & resolve</div>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition text-center"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-semibold text-gray-900">Resources</div>
                  <div className="text-sm text-gray-600 mt-1">Manage materials</div>
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition text-center"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="font-semibold text-gray-900">System</div>
                  <div className="text-sm text-gray-600 mt-1">Settings & health</div>
                </button>
              </div>
            </div>

            {/* Recent Grievances */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Grievances</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">ID</th>
                      <th className="px-4 py-2 text-left font-semibold">Description</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                      <th className="px-4 py-2 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grievances.slice(0, 5).map(g => (
                      <tr key={g.grievance_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">#{g.grievance_id}</td>
                        <td className="px-4 py-2">{g.description.substring(0, 40)}...</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(g.status)}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">{new Date(g.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => setSelectedGrievance(g)}
                            className="text-blue-600 hover:underline text-xs font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <input
                type="text"
                value={userSearch}
                onChange={e => { setUserSearch(e.target.value); setPageUsers(1); }}
                placeholder="Search name or email"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterRole}
                onChange={e => { setFilterRole(e.target.value); setPageUsers(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="1">Student</option>
                <option value="2">Faculty</option>
                <option value="3">Authority</option>
                <option value="4">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={e => { setUserStatusFilter(e.target.value); setPageUsers(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Joined</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.user_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.full_name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.institute_email}</td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={u.role_id}
                          onChange={e => setUpdateRole(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="1">Student</option>
                          <option value="2">Faculty</option>
                          <option value="3">Authority</option>
                          <option value="4">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleUpdateUser(u.user_id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.user_id, u.is_active)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grievances Tab */}
        {activeTab === 'grievances' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Grievance Management</h2>

            {/* Grievances List */}
            <div className="grid grid-cols-1 gap-4">
              {grievances.map(g => (
                <div key={g.grievance_id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => {
                  setSelectedGrievance(g);
                  setGrievanceStatus(g.status);
                  setGrievanceRemarks('');
                  setGrievanceAssignedTo(g.assigned_to || '');
                }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">#{g.grievance_id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(g.status)}`}>
                          {g.status}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">{g.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        By: {g.reporter_name} • {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGrievance(g);
                        setGrievanceStatus(g.status);
                        setGrievanceRemarks('');
                        setGrievanceAssignedTo(g.assigned_to || '');
                      }}
                      className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-semibold"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Grievance Details */}
            {selectedGrievance && (
              <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Grievance #{selectedGrievance.grievance_id} Details</h3>
                  <button
                    onClick={() => {
                      setSelectedGrievance(null);
                      setGrievanceStatus('');
                      setGrievanceRemarks('');
                      setGrievanceAssignedTo('');
                    }}
                    className="text-gray-600 hover:text-gray-900 font-bold text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={grievanceStatus}
                      onChange={e => setGrievanceStatus(e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Assign To (User ID)</label>
                    <input
                      type="number"
                      value={grievanceAssignedTo}
                      onChange={e => setGrievanceAssignedTo(e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 rounded"
                      placeholder="Enter User ID"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700">Remarks</label>
                  <textarea
                    value={grievanceRemarks}
                    onChange={e => setGrievanceRemarks(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                    rows="3"
                    placeholder="Add resolution remarks..."
                  ></textarea>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleGrievanceAction(selectedGrievance.grievance_id, 'update')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold text-sm"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => handleGrievanceAction(selectedGrievance.grievance_id, 'resolve')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold text-sm"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleGrievanceAction(selectedGrievance.grievance_id, 'assign')}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-semibold text-sm"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Opportunities</h2>
                <p className="text-sm text-gray-600">All opportunities from the database.</p>
              </div>
              <Link to="/opportunities" className="text-blue-600 hover:underline">Open Opportunities →</Link>
            </div>

            <form onSubmit={handleCreateOpportunity} className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  value={opportunityCreateForm.title}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, title: e.target.value })}
                  placeholder="Title"
                  className="px-3 py-2 border rounded"
                  required
                />
                <input
                  value={opportunityCreateForm.required_skills}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, required_skills: e.target.value })}
                  placeholder="Required skills"
                  className="px-3 py-2 border rounded"
                />
                <input
                  value={opportunityCreateForm.duration}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, duration: e.target.value })}
                  placeholder="Duration"
                  className="px-3 py-2 border rounded"
                />
                <input
                  value={opportunityCreateForm.stipend}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, stipend: e.target.value })}
                  placeholder="Stipend"
                  type="number"
                  className="px-3 py-2 border rounded"
                />
                <input
                  value={opportunityCreateForm.deadline}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, deadline: e.target.value })}
                  placeholder="Deadline"
                  type="date"
                  className="px-3 py-2 border rounded"
                />
                <input
                  value={opportunityCreateForm.department_id}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, department_id: e.target.value })}
                  placeholder="Department ID"
                  type="number"
                  className="px-3 py-2 border rounded"
                />
                <input
                  value={opportunityCreateForm.description}
                  onChange={e => setOpportunityCreateForm({ ...opportunityCreateForm, description: e.target.value })}
                  placeholder="Description"
                  className="px-3 py-2 border rounded md:col-span-2 lg:col-span-3"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                  disabled={opportunityCreating}
                >
                  {opportunityCreating ? 'Creating...' : 'Create Opportunity'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border rounded text-sm"
                  onClick={() => setOpportunityCreateForm({
                    title: '',
                    description: '',
                    required_skills: '',
                    duration: '',
                    stipend: '',
                    deadline: '',
                    department_id: '',
                  })}
                >
                  Reset
                </button>
              </div>
            </form>

            {opportunityError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {opportunityError}
              </div>
            )}

            {opportunityLoading ? (
              <div className="text-center text-gray-500 py-8">Loading opportunities...</div>
            ) : opportunityItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No opportunities found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Title</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 text-left font-semibold">Skills</th>
                      <th className="px-4 py-3 text-left font-semibold">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold">Stipend</th>
                      <th className="px-4 py-3 text-left font-semibold">Deadline</th>
                      <th className="px-4 py-3 text-left font-semibold">Department</th>
                      <th className="px-4 py-3 text-left font-semibold">Posted By</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Created</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunityItems.map(opp => (
                      <tr key={opp.opportunity_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">#{opp.opportunity_id}</td>
                        <td className="px-4 py-3 font-medium">{opp.title}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {(opp.description || '').slice(0, 80)}{(opp.description || '').length > 80 ? '...' : ''}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{opp.required_skills || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.duration || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.stipend ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.department_id ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.posted_by ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{opp.status}</td>
                        <td className="px-4 py-3 text-gray-500">{opp.created_at ? new Date(opp.created_at).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectOpportunity(opp)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => handleDeleteOpportunity(opp.opportunity_id)}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedOpportunity && (
              <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Edit Opportunity #{selectedOpportunity.opportunity_id}</h3>
                  <button
                    onClick={() => setSelectedOpportunity(null)}
                    className="text-gray-600 hover:text-gray-900 font-semibold"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    value={opportunityEditForm.title}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, title: e.target.value })}
                    placeholder="Title"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    value={opportunityEditForm.required_skills}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, required_skills: e.target.value })}
                    placeholder="Required skills"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    value={opportunityEditForm.duration}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, duration: e.target.value })}
                    placeholder="Duration"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    value={opportunityEditForm.stipend}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, stipend: e.target.value })}
                    placeholder="Stipend"
                    type="number"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    value={opportunityEditForm.deadline}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, deadline: e.target.value })}
                    placeholder="Deadline"
                    type="date"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    value={opportunityEditForm.department_id}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, department_id: e.target.value })}
                    placeholder="Department ID"
                    type="number"
                    className="px-3 py-2 border rounded"
                  />
                  <select
                    value={opportunityEditForm.status}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, status: e.target.value })}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">Status</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                  <input
                    value={opportunityEditForm.description}
                    onChange={e => setOpportunityEditForm({ ...opportunityEditForm, description: e.target.value })}
                    placeholder="Description"
                    className="px-3 py-2 border rounded md:col-span-2 lg:col-span-3"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleUpdateOpportunity}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                    disabled={opportunitySaving}
                  >
                    {opportunitySaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setSelectedOpportunity(null)}
                    className="px-4 py-2 border rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setOpportunityPage(p => Math.max(p - 1, 1))}
                className="px-3 py-2 border rounded text-sm"
                disabled={opportunityPage === 1}
              >
                Previous
              </button>
              <div className="text-sm text-gray-500">Page {opportunityPage}</div>
              <button
                onClick={() => setOpportunityPage(p => p + 1)}
                className="px-3 py-2 border rounded text-sm"
                disabled={opportunityItems.length < 25}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
                <p className="text-sm text-gray-600">Browse and manage resources from the Vault of Knowledge.</p>
              </div>
              <Link to="/vault" className="text-blue-600 hover:underline">Open Vault →</Link>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <input
                type="text"
                value={resourceQuery}
                onChange={e => { setResourceQuery(e.target.value); setResourcePage(1); }}
                placeholder="Search title or filename"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={resourceTag}
                onChange={e => { setResourceTag(e.target.value); setResourcePage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {resourceTags.map(t => (
                  <option key={t.tag_id} value={t.tag_name}>{t.tag_name}</option>
                ))}
              </select>
              <select
                value={resourceCourse}
                onChange={e => { setResourceCourse(e.target.value); setResourcePage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {resourceCourses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.course_name}</option>
                ))}
              </select>
              <select
                value={resourceYear}
                onChange={e => { setResourceYear(e.target.value); setResourcePage(1); }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {resourceYears.map(y => (
                  <option key={y.year_id} value={y.year_id}>{y.academic_year || y.year || y.name || y.year_id}</option>
                ))}
              </select>
              <input
                type="text"
                value={resourceType}
                onChange={e => { setResourceType(e.target.value); setResourcePage(1); }}
                placeholder="Type (notes, question_paper)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {resourceError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {resourceError}
              </div>
            )}

            {resourceLoading ? (
              <div className="text-center text-gray-500 py-8">Loading resources...</div>
            ) : resourceItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No resources found.</div>
            ) : (
              <div className="space-y-3">
                {resourceItems.map(r => (
                  <div key={r.resource_id} className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{r.title}</div>
                      <div className="text-sm text-gray-600">Course: {r.course_id || '—'} • Type: {r.type || '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">Tags: {(r.tags || []).join(', ') || '—'}</div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE}${r.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setResourcePage(p => Math.max(p - 1, 1))}
                className="px-3 py-2 border rounded text-sm"
                disabled={resourcePage === 1}
              >
                Previous
              </button>
              <div className="text-sm text-gray-500">Page {resourcePage}</div>
              <button
                onClick={() => setResourcePage(p => p + 1)}
                className="px-3 py-2 border rounded text-sm"
                disabled={resourceItems.length < 20}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">Database Status</div>
                <div className="text-2xl font-bold text-green-600">✓ Connected</div>
                <p className="text-xs text-gray-600 mt-1">All systems operational</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">API Status</div>
                <div className="text-2xl font-bold text-blue-600">✓ Operating</div>
                <p className="text-xs text-gray-600 mt-1">Response time: 45ms</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">Server Status</div>
                <div className="text-2xl font-bold text-purple-600">✓ Healthy</div>
                <p className="text-xs text-gray-600 mt-1">CPU: 32% • Memory: 45%</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-semibold text-gray-700 mb-2">Last Backup</div>
                <div className="text-2xl font-bold text-yellow-600">2h ago</div>
                <p className="text-xs text-gray-600 mt-1">Size: 256 MB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

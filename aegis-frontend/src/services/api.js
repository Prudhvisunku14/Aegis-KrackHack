const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('aegis_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null } catch (e) { data = text }
  if (!res.ok) throw { status: res.status, body: data };
  return data;
}

export const auth = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
}

export const users = {
  get: (id) => request(`/api/users/${id}`),
  update: (id, payload) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
}

export const opportunities = {
  list: (qs = '') => request(`/api/opportunities${qs}`),
  get: (id) => request(`/api/opportunities/${id}`),
  create: (payload) => request('/api/opportunities', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/opportunities/${id}`, { method: 'DELETE' }),
}

export const applications = {
  apply: (opportunityId, formData) => request(`/api/applications/apply/${opportunityId}`, { method: 'POST', body: formData }),
  my: () => request('/api/applications/my'),
  updateStatus: (id, payload) => request(`/api/applications/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
}

// generic list helper for applications (faculty may query by opportunity_id)
applications.list = (qs = '') => request(`/api/applications${qs}`);

export const bookmarks = {
  add: (payload) => request('/api/bookmarks', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/bookmarks/${id}`, { method: 'DELETE' }),
  list: (qs = '') => request(`/api/bookmarks${qs}`),
}

export const oppMessages = {
  send: (opportunityId, payload) => request(`/api/opportunities/${opportunityId}/message`, { method: 'POST', body: JSON.stringify(payload) }),
}

oppMessages.list = (qs = '') => request(`/api/opportunity_messages${qs}`);

export const admin = {
  listUsers: (qs = '') => request(`/api/admin/users${qs}`),
  updateUserRole: (userId, payload) => request(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify(payload) }),
  toggleUserActive: (userId, payload) => request(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  getActivityLogs: (qs = '') => request(`/api/admin/logs${qs}`),
  getSystemHealth: () => request('/api/admin/health'),
  listGrievances: (qs = '') => request(`/api/admin/grievances${qs}`),
}

export const authority = {
  getDashboard: (qs = '') => request(`/api/authority/dashboard${qs}`),
  assignGrievance: (payload) => request('/api/authority/assign', { method: 'POST', body: JSON.stringify(payload) }),
  updateGrievanceStatus: (payload) => request('/api/authority/status-update', { method: 'POST', body: JSON.stringify(payload) }),
  getGrievanceTimeline: (grievanceId) => request(`/api/authority/timeline/${grievanceId}`),
}

export const grievances = {
  list: (qs = '') => request(`/api/grievances${qs}`),
  get: (id) => request(`/api/grievances/${id}`),
  create: (payload) => request('/api/grievances', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/grievances/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getTimeline: (id) => request(`/api/grievances/${id}/timeline`),
}

export const courses = {
  list: (qs = '') => request(`/api/courses${qs}`),
  get: (id) => request(`/api/courses/${id}`),
  create: (payload) => request('/api/courses', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
}

export const enrollments = {
  list: (qs = '') => request(`/api/enrollments${qs}`),
  get: (id) => request(`/api/enrollments/${id}`),
  create: (payload) => request('/api/enrollments', { method: 'POST', body: JSON.stringify(payload) }),
}

export const academicEvents = {
  list: (qs = '') => request(`/api/academic_events${qs}`),
  get: (id) => request(`/api/academic_events/${id}`),
  create: (payload) => request('/api/academic_events', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/academic_events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/academic_events/${id}`, { method: 'DELETE' }),
  remind: (id) => request(`/api/academic_events/${id}/remind`, { method: 'POST' }),
  getMyReminders: () => request('/api/academic_events/my-reminders'),
}

export const resources = {
  search: (query = '') => request(`/api/academic_resources/search?q=${query}`),
  upload: (formData) => request('/api/academic_resources/upload', { method: 'POST', body: formData }),
  get: (id) => request(`/api/academic_resources/${id}`),
  remove: (id) => request(`/api/academic_resources/${id}`, { method: 'DELETE' }),
}

export const tasks = {
  list: (qs = '') => request(`/api/tasks${qs}`),
  get: (id) => request(`/api/tasks/${id}`),
  create: (payload) => request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
}

export default { request, users };

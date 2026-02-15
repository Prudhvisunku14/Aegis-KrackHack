import React from 'react';
import { useEffect, useState } from 'react';

export default function VaultOfKnowledge() {
  const [resources, setResources] = useState([]);
  const [tags, setTags] = useState([]);
  const [years, setYears] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', course_id: '', year_id: '', type: '', tags: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem('aegis_token');
      const [resRes, tagRes, coursesRes, yearsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE}/api/academic_resources?limit=200`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE}/api/resource_tags?limit=200`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE}/api/courses?limit=200`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE}/api/academic_year?limit=200`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const resourcesData = await resRes.json();
      const tagsData = await tagRes.json();
      const coursesData = await coursesRes.json();
      const yearsData = await yearsRes.json();

      setResources(resourcesData.data || []);
      setTags(tagsData.data || []);
      setCourses(coursesData.data || []);
      setYears(yearsData.data || []);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load resources');
    }
  }

  const filtered = resources.filter(r => {
    if (query && !`${r.title} ${r.file_path}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (selectedTag && (!r.tags || !r.tags.includes(selectedTag))) return false;
    return true;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Select a file to upload');
    setUploading(true); setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('course_id', form.course_id);
      fd.append('year_id', form.year_id);
      fd.append('type', form.type);
      fd.append('tags', form.tags);

      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/academic_resources/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const resBody = await res.json().catch(()=>null);
      if (!res.ok) throw new Error((resBody && resBody.message) ? resBody.message : 'upload failed');
      setMessage('Upload successful');
      setFile(null);
      setForm({ title: '', course_id: '', year_id: '', type: '', tags: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Vault of Knowledge</h1>
          <p className="text-sm text-gray-600">Search previous-year papers, notes and shared materials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex gap-2 mb-4">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title, course or filename" className="flex-1 px-3 py-2 border rounded" />
              <select value={selectedTag} onChange={e=>setSelectedTag(e.target.value)} className="px-3 py-2 border rounded">
                <option value="">All tags</option>
                {tags.map(t=> <option key={t.tag_id} value={t.tag_name}>{t.tag_name}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No resources found</div>
            ) : (
              <div className="space-y-3">
                {filtered.map(r => (
                  <div key={r.resource_id} className="border rounded p-3 flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-sm text-gray-600">Course: {r.course_id || '—'} • Type: {r.type || '—'}</p>
                      <div className="mt-2 text-xs text-gray-500">Tags: {(r.tags || []).join(', ')}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a href={`${import.meta.env.VITE_API_BASE}${r.file_path}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Download</a>
                      <button className="px-3 py-1 border rounded text-sm">Save</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Upload Resource</h3>
            {message && <div className="text-sm text-red-600 mb-2">{message}</div>}
            <form onSubmit={handleUpload} className="space-y-3">
              <input className="w-full px-2 py-2 border rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
              <select required value={form.course_id} onChange={e=>setForm({...form, course_id: e.target.value})} className="w-full px-2 py-2 border rounded">
                <option value="">Select course (optional)</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_code} - {c.course_name}</option>)}
              </select>
              <select required value={form.year_id} onChange={e=>setForm({...form, year_id: e.target.value})} className="w-full px-2 py-2 border rounded">
                <option value="">Select academic year</option>
                {years.map(y => <option key={y.year_id} value={y.year_id}>{y.academic_year || y.year || y.name || y.year_id}</option>)}
              </select>
              <input className="w-full px-2 py-2 border rounded" placeholder="Type (question_paper / notes)" value={form.type} onChange={e=>setForm({...form, type: e.target.value})} />
              <input className="w-full px-2 py-2 border rounded" placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form, tags: e.target.value})} />
              <input type="file" accept="application/pdf,image/*" onChange={e=>setFile(e.target.files[0])} />

              <div className="flex gap-2">
                <button disabled={uploading} className={`px-4 py-2 rounded text-white ${uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" onClick={()=>{ setFile(null); setForm({ title:'', course_id:'', year_id:'', type:'', tags:''}); setMessage(''); }} className="px-4 py-2 border rounded">Reset</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

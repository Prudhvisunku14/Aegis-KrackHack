import React, { useEffect, useState } from 'react';

export default function ChronosCalendar() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().slice(0, 10);
  });
  const [personalOnly, setPersonalOnly] = useState(true);
  const [events, setEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [startDate, endDate, personalOnly]);

  async function fetchAll() {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('aegis_token');
      const qs = `?start=${startDate}&end=${endDate}${personalOnly ? '&personal=true' : ''}`;
      const evRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/academic_events${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!evRes.ok) throw new Error('Failed to load events');
      const evJson = await evRes.json();
      setEvents(evJson.data || []);

      const remRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/academic_events/my-reminders`, { headers: { Authorization: `Bearer ${token}` } });
      if (remRes.ok) {
        const remJson = await remRes.json();
        setReminders(remJson.data || []);
      } else {
        setReminders([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load calendar');
    } finally {
      setLoading(false);
    }
  }

  function groupByDate(arr) {
    const map = {};
    arr.forEach(e => {
      const d = e.event_date;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return Object.keys(map).sort().map(d => ({ date: d, items: map[d] }));
  }

  async function setReminder(eventId, method = 'in-platform') {
    try {
      const token = localStorage.getItem('aegis_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/academic_events/${eventId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) {
        const txt = await res.json().catch(() => ({}));
        throw new Error((txt && txt.message) || 'failed to set reminder');
      }
      alert(method === 'email' ? 'Email reminder requested' : 'In‑platform reminder set');
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Could not set reminder');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading calendar...</div>;

  const grouped = groupByDate(events);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Chronos — Academic Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Exams, assignments and important academic dates. Toggle to view only events for your enrolled courses.</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label className="text-xs text-slate-600">Start</label>
            <input type="date" className="border px-2 py-1 rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <label className="text-xs text-slate-600">End</label>
            <input type="date" className="border px-2 py-1 rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={personalOnly} onChange={e => setPersonalOnly(e.target.checked)} />
              Personalized (my courses only)
            </label>

            <button onClick={fetchAll} className="px-3 py-2 bg-sky-600 text-white rounded">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">Events ({events.length})</h2>

            {grouped.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-8">No events found in this range.</div>
            ) : (
              grouped.map(g => (
                <div key={g.date} className="mb-4">
                  <div className="text-sm text-slate-500 font-medium mb-2">{new Date(g.date).toLocaleDateString()}</div>
                  <div className="space-y-3">
                    {g.items.map(ev => (
                      <div key={ev.event_id} className="p-3 border rounded flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ev.title}</h3>
                            {ev.course_name && <span className="text-xs px-2 py-1 bg-gray-100 rounded text-slate-600">{ev.course_name}</span>}
                          </div>
                          {ev.description && <p className="text-sm text-slate-500 mt-1">{ev.description}</p>}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          <div className="text-xs text-slate-500">{ev.event_date}</div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => setReminder(ev.event_id, 'in-platform')}>Remind me</button>
                            <button className="px-3 py-1 border rounded text-sm" onClick={() => setReminder(ev.event_id, 'email')}>Email</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">My reminders</h3>
            {reminders.length === 0 ? (
              <div className="text-sm text-slate-500">No reminders set.</div>
            ) : (
              <div className="space-y-3">
                {reminders.map(r => (
                  <div key={r.log_id} className="border rounded p-3 text-sm">
                    <div className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</div>
                    <div className="mt-1">{r.action}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500">Reminders are stored in‑platform. Email reminders are a best‑effort feature and require SMTP configuration.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DestinyManager() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('enrollment'); // enrollment, attendance, credits

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('aegis_token');

      // Fetch user enrollments
      const enrollRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/enrollments?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!enrollRes.ok) throw new Error('Failed to fetch enrollments');
      const { data: enrollData } = await enrollRes.json();
      setEnrollments(enrollData || []);

      // Fetch all courses
      const coursesRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/courses?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      const { data: coursesData } = await coursesRes.json();
      setCourses(coursesData || []);

      // Fetch attendance logs
      const attRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/attendance_logs?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!attRes.ok) throw new Error('Failed to fetch attendance');
      const { data: attData } = await attRes.json();
      setAttendance(attData || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate credits from enrollments
  const calculateCredits = () => {
    const creditData = {
      total: 0,
      major: 0,
      minor: 0,
      elective: 0,
      byStatus: { enrolled: 0, completed: 0, dropped: 0 },
    };

    enrollments.forEach(enr => {
      const course = courses.find(c => c.course_id === enr.course_id);
      if (course) {
        const credits = course.credits || 0;
        creditData.total += credits;

        // Categorize by type (assuming course_type field exists)
        if (course.course_type === 'major') creditData.major += credits;
        else if (course.course_type === 'minor') creditData.minor += credits;
        else creditData.elective += credits;

        // Track by status
        if (enr.status === 'enrolled') creditData.byStatus.enrolled += credits;
        else if (enr.status === 'completed') creditData.byStatus.completed += credits;
        else if (enr.status === 'dropped') creditData.byStatus.dropped += credits;
      }
    });

    return creditData;
  };

  // Calculate attendance percentage for a course
  const getAttendancePercentage = (courseId) => {
    const courseAttendance = attendance.filter(a => a.course_id === courseId);
    if (courseAttendance.length === 0) return 0;
    const present = courseAttendance.filter(a => a.status === 'present').length;
    return Math.round((present / courseAttendance.length) * 100);
  };

  const credits = calculateCredits();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading academic data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">The Destiny Manager</h1>
          <p className="text-gray-600">Track your academic journey and manage your courses</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setTab('enrollment')}
            className={`px-4 py-2 rounded font-medium transition ${
              tab === 'enrollment'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📚 Enrollments
          </button>
          <button
            onClick={() => setTab('attendance')}
            className={`px-4 py-2 rounded font-medium transition ${
              tab === 'attendance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✅ Attendance
          </button>
          <button
            onClick={() => setTab('credits')}
            className={`px-4 py-2 rounded font-medium transition ${
              tab === 'credits'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎓 Credits
          </button>
        </div>

        {/* ENROLLMENT TAB */}
        {tab === 'enrollment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">My Courses</h2>

                {enrollments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No enrollments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map(enr => {
                      const course = courses.find(c => c.course_id === enr.course_id);
                      return (
                        <div
                          key={enr.enrollment_id}
                          onClick={() => setSelectedCourse(enr)}
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            selectedCourse?.enrollment_id === enr.enrollment_id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">
                                {course?.course_code || `Course ${enr.course_id}`}
                              </h3>
                              <p className="text-gray-600">{course?.course_name || 'Unnamed Course'}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Credits: {course?.credits || 'N/A'} | Semester: {enr.semester || 'N/A'}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                enr.status === 'enrolled'
                                  ? 'bg-green-100 text-green-800'
                                  : enr.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {enr.status || 'Enrolled'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Course Details */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Course Details</h3>
                {(() => {
                  const course = courses.find(c => c.course_id === selectedCourse.course_id);
                  const courseAtt = getAttendancePercentage(selectedCourse.course_id);
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-600">Code</label>
                        <p className="text-gray-900">{course?.course_code || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Name</label>
                        <p className="text-gray-900">{course?.course_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Credits</label>
                        <p className="text-gray-900">{course?.credits || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Status</label>
                        <p className="text-gray-900">{selectedCourse.status || 'Enrolled'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Attendance</label>
                        <p className="text-2xl font-bold text-blue-600">{courseAtt}%</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600">Enrolled</label>
                        <p className="text-gray-900">
                          {new Date(selectedCourse.enrollment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab === 'attendance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Attendance Tracker</h2>

            {/* Quick self‑logger form */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <select className="px-3 py-2 border rounded" onChange={e => setSelectedCourse(enrollments.find(en => String(en.enrollment_id) === e.target.value) || null)}>
                <option value="">Select course to log</option>
                {enrollments.map(en => {
                  const course = courses.find(c => c.course_id === en.course_id);
                  return <option key={en.enrollment_id} value={en.enrollment_id}>{course?.course_code || en.course_id} — {course?.course_name || 'Course'}</option>;
                })}
              </select>

              <select id="log-status" className="px-3 py-2 border rounded" defaultValue="present">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>

              <div className="flex gap-2">
                <button onClick={async () => {
                  const enrol = selectedCourse;
                  if (!enrol) return alert('Select a course first');
                  const status = document.getElementById('log-status').value;
                  try {
                    const token = localStorage.getItem('aegis_token');
                    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/attendance_logs`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ course_id: enrol.course_id, status, attendance_date: new Date().toISOString() })
                    });
                    if (!res.ok) throw new Error('Failed to log attendance');
                    // refresh attendance
                    const attRes = await fetch(`${import.meta.env.VITE_API_BASE}/api/attendance_logs?limit=1000`, { headers: { Authorization: `Bearer ${localStorage.getItem('aegis_token')}` } });
                    const { data: attData } = await attRes.json();
                    setAttendance(attData || []);
                    alert('Attendance logged');
                  } catch (err) {
                    console.error(err);
                    alert(err.message || 'Could not log attendance');
                  }
                }} className="px-4 py-2 bg-blue-600 text-white rounded">Log Attendance</button>

                <button onClick={() => { setSelectedCourse(null); }} className="px-4 py-2 border rounded">Clear</button>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No enrollment data available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {enrollments.map(enr => {
                  const course = courses.find(c => c.course_id === enr.course_id);
                  const attPercentage = getAttendancePercentage(enr.course_id);
                  const courseAttendance = attendance.filter(a => a.course_id === enr.course_id);

                  return (
                    <div key={enr.enrollment_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">
                            {course?.course_code} - {course?.course_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {courseAttendance.length} total classes
                          </p>
                        </div>
                        <span className="text-2xl font-bold">
                          <span
                            className={
                              attPercentage >= 75
                                ? 'text-green-600'
                                : attPercentage >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }
                          >
                            {attPercentage}%
                          </span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            attPercentage >= 75
                              ? 'bg-green-500'
                              : attPercentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${attPercentage}%` }}
                        />
                      </div>

                      {/* Attendance Details */}
                      {courseAttendance.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="font-bold text-green-700">
                              {courseAttendance.filter(a => a.status === 'present').length}
                            </p>
                            <p className="text-gray-600 text-xs">Present</p>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <p className="font-bold text-yellow-700">
                              {courseAttendance.filter(a => a.status === 'absent').length}
                            </p>
                            <p className="text-gray-600 text-xs">Absent</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <p className="font-bold text-purple-700">
                              {courseAttendance.filter(a => a.status === 'leave').length}
                            </p>
                            <p className="text-gray-600 text-xs">Leave</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREDITS TAB */}
        {tab === 'credits' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Credits Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Credit Summary</h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Total Credits</p>
                  <p className="text-4xl font-bold text-blue-600">{credits.total}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Major</p>
                    <p className="text-2xl font-bold text-purple-600">{credits.major}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Minor</p>
                    <p className="text-2xl font-bold text-green-600">{credits.minor}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600">Elective</p>
                    <p className="text-2xl font-bold text-orange-600">{credits.elective}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credits by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Credits by Status</h2>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">Currently Enrolled</p>
                  <p className="text-3xl font-bold text-green-600">{credits.byStatus.enrolled}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{credits.byStatus.completed}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-600">Dropped</p>
                  <p className="text-3xl font-bold text-gray-600">{credits.byStatus.dropped}</p>
                </div>
              </div>
            </div>

            {/* Course Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Course Breakdown</h2>

              {enrollments.length === 0 ? (
                <p className="text-gray-500">No courses enrolled</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map(enr => {
                    const course = courses.find(c => c.course_id === enr.course_id);
                    return (
                      <div key={enr.enrollment_id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">
                            {course?.course_code} - {course?.course_name}
                          </p>
                          <p className="text-sm text-gray-600">{enr.status || 'Enrolled'}</p>
                        </div>
                        <p className="font-bold text-lg">{course?.credits || 0} credits</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

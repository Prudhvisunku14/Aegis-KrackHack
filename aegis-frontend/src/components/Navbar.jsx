import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Decode JWT token to get user info
    const token = localStorage.getItem('aegis_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('aegis_token');
    setUser(null);
    navigate('/login');
  }

  const getRoleLabel = () => {
    if (user?.role_id === 1) return 'Student';
    if (user?.role_id === 2) return 'Faculty';
    if (user?.role_id === 3) return 'Authority';
    if (user?.role_id === 4) return 'Admin';
    return 'User';
  };

  const getNavbarColor = () => {
    if (user?.role_id === 1) return 'bg-blue-700';      // Student - Blue
    if (user?.role_id === 2) return 'bg-green-700';     // Faculty - Green
    if (user?.role_id === 3) return 'bg-red-700';       // Authority - Red
    if (user?.role_id === 4) return 'bg-red-800';       // Admin - Dark Red
    return 'bg-indigo-700';                             // Default
  };

  const getQuickLinks = () => {
    const roleId = user?.role_id;

    // Student quick links
    if (roleId === 1) {
      return [
        { label: 'Submit Grievance', path: '/submit-grievance' },
        { label: 'My Grievances', path: '/my-grievances' },
        { label: 'Browse Opportunities', path: '/opportunities' }
      ];
    }

    // Faculty quick links
    if (roleId === 2) {
      return [
        { label: 'Post Opportunity', path: '/faculty/opportunities' },
        { label: 'Review Applications', path: '/faculty/applications' },
        { label: 'Messages', path: '/inbox' }
      ];
    }

    // Admin/Authority quick links - Full CRUD access
    if (roleId === 3 || roleId === 4) {
      return [
        { label: 'Admin Panel', path: '/admin' },
        { label: 'Manage Grievances', path: '/authority/grievances' },
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'Resources', path: '/vault' },
        { label: 'Calendar', path: '/calendar' }
      ];
    }

    return [];
  };

  const quickLinks = getQuickLinks();

  return (
    <nav className={`${getNavbarColor()} text-white shadow-lg sticky top-0 z-50 transition-colors`}>
      <div className="px-6 py-4">
        {/* Logo and Role Badge */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-2xl font-bold tracking-wider">
              AEGIS
            </Link>
            {user && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                {getRoleLabel()}
              </span>
            )}
          </div>

          {/* Right Section - Quick Links & Profile */}
          <div className="flex items-center gap-6">
            {/* Quick Links */}
            {user && quickLinks.length > 0 && (
              <div className="hidden lg:flex items-center gap-3">
                {quickLinks.slice(0, 4).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm px-3 py-1 rounded hover:bg-white/10 transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="px-4 py-2 rounded-lg hover:bg-white/20 transition text-sm font-semibold"
                >
                  {user.email?.split('@')[0] || 'User'}
                </button>

                {/* Dropdown Menu */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-2 bg-gray-100 border-b">
                      <p className="text-xs text-gray-600 font-semibold">
                        {getRoleLabel()}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-gray-100 transition text-sm"
                      onClick={() => setShowProfile(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 hover:bg-gray-100 transition text-sm border-t"
                      onClick={() => setShowProfile(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition border-t text-red-600 font-semibold text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-white text-indigo-700 rounded font-semibold hover:bg-gray-100">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

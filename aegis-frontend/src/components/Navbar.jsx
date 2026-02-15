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

  return (
    <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="text-2xl font-bold tracking-wider">
          AEGIS
        </Link>

        {/* Right Section - Profile & Logout */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-sm font-semibold"
              >
                {user.email?.split('@')[0] || 'User'}
              </button>

              {/* Dropdown Menu */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 hover:bg-gray-100 transition"
                    onClick={() => setShowProfile(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition border-t text-red-600 font-semibold"
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
    </nav>
  );
}

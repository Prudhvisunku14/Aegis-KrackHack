import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Profile', path: '/profile' }
      ]
    },
    {
      title: 'Identity & Governance',
      items: [
        { label: 'Submit Grievance', path: '/submit-grievance' },
        { label: 'My Grievances', path: '/my-grievances' },
        { label: 'Authority Dashboard', path: '/authority/grievances' }
      ]
    },
    {
      title: 'Chronos (Academics)',
      items: [
        { label: 'Academic Resources', path: '/vault' },
        { label: 'Calendar & Events', path: '/calendar' },
        { label: 'Destiny Manager', path: '/academics' }
      ]
    },
    {
      title: 'Opportunities',
      items: [
        { label: 'Browse Opportunities', path: '/opportunities' },
        { label: 'Scholar\'s Ledger', path: '/scholar-ledger' },
        { label: 'Inbox', path: '/inbox' },
        { label: 'Faculty Portal', path: '/faculty/opportunities' },
        { label: 'Applications', path: '/faculty/applications' }
      ]
    },
    {
      title: 'Admin',
      items: [
        { label: 'Admin Dashboard', path: '/admin' }
      ]
    }
  ];

  const getLinkClass = (isActive) => {
    const base = 'block px-4 py-2 rounded-lg transition text-sm';
    return isActive
      ? `${base} bg-indigo-600 text-white font-semibold`
      : `${base} text-gray-700 hover:bg-gray-100`;
  };

  return (
    <aside
      className={`${
        expanded ? 'w-64' : 'w-20'
      } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto`}
    >
      {/* Toggle Button */}
      <div className="p-4 border-b">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-indigo-700 hover:bg-gray-100 rounded-lg transition text-sm font-semibold"
        >
          {expanded ? 'Hide Menu' : 'Show Menu'}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="p-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {expanded && (
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 px-2">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getLinkClass(isActive(item.path))}
                >
                  {expanded && <span>{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

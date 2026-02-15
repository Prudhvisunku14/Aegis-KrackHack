import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../services/api';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    auth.me().then(res => {
      setUser(res.user);
    }).catch(err => {
      console.error('Error fetching user:', err);
    });
  }, []);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Role-based navigation
  const getNavSections = () => {
    const roleId = user?.role_id;

    // Common sections for all users
    const commonSections = [
      {
        title: 'Main',
        items: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Profile', path: '/profile' }
        ]
      }
    ];

    // Student-specific sections
    if (roleId === 1) {
      return [
        ...commonSections,
        {
          title: 'Identity & Governance',
          items: [
            { label: 'Submit Grievance', path: '/submit-grievance' },
            { label: 'My Grievances', path: '/my-grievances' }
          ]
        },
        {
          title: 'Chronos (Academics)',
          items: [
            { label: 'Academic Resources', path: '/vault' },
            { label: 'Calendar & Events', path: '/calendar' }
          ]
        },
        {
          title: 'Opportunities',
          items: [
            { label: 'Browse Opportunities', path: '/opportunities' },
            { label: 'Scholar\'s Ledger', path: '/scholar-ledger' },
            { label: 'Inbox', path: '/inbox' }
          ]
        }
      ];
    }

    // Faculty-specific sections
    if (roleId === 2) {
      return [
        ...commonSections,
        {
          title: 'Chronos (Academics)',
          items: [
            { label: 'Academic Resources', path: '/vault' },
            { label: 'Calendar & Events', path: '/calendar' }
          ]
        },
        {
          title: 'Opportunities & Applications',
          items: [
            { label: 'Post Opportunity', path: '/faculty/opportunities' },
            { label: 'Review Applications', path: '/faculty/applications' },
            { label: 'Messages', path: '/inbox' }
          ]
        }
      ];
    }

    // Admin/Authority sections (role_id 3 or 4)
    if (roleId === 3 || roleId === 4) {
      const isAdmin = roleId === 4;
      return [
        ...commonSections,
        {
          title: 'System Administration',
          items: [
            { label: 'Admin Dashboard', path: '/admin' },
            { label: 'Manage Users', path: '/admin' },
            { label: 'Manage Roles', path: '/admin' },
            { label: 'System Settings', path: '/admin' }
          ]
        },
        {
          title: 'Identity & Governance (CRUD)',
          items: [
            { label: 'All Grievances', path: '/authority/grievances' },
            { label: 'Create Grievance', path: '/submit-grievance' },
            { label: 'Assign & Resolve', path: '/authority/grievances' },
            { label: 'Grievance Reports', path: '/authority/grievances' }
          ]
        },
        {
          title: 'Opportunities & Applications (CRUD)',
          items: [
            { label: 'All Opportunities', path: '/opportunities' },
            { label: 'Create Opportunity', path: '/faculty/opportunities' },
            { label: 'Approve Postings', path: '/faculty/opportunities' },
            { label: 'Manage Applications', path: '/faculty/applications' },
            { label: 'Faculty Portal', path: '/faculty/opportunities' }
          ]
        },
        {
          title: 'Chronos (Academics - CRUD)',
          items: [
            { label: 'Academic Calendar', path: '/calendar' },
            { label: 'Create Event', path: '/calendar' },
            { label: 'Manage Schedules', path: '/calendar' },
            { label: 'Academic Resources', path: '/vault' },
            { label: 'Moderate Content', path: '/vault' }
          ]
        },
        {
          title: 'Communications',
          items: [
            { label: 'Monitor Messages', path: '/inbox' },
            { label: 'Faculty Inbox', path: '/inbox' },
            { label: 'System Notifications', path: '/inbox' }
          ]
        }
      ];
    }

    // Default: show minimal navigation
    return commonSections;
  };

  const navSections = getNavSections();

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

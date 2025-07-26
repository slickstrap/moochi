// src/Layout.jsx
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const adminEmails = ['slick.strap@outlook.com'];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'My Account', path: '/account' },
    { label: 'Configure', path: '/configure' },
    { label: 'Analyze', path: '/analyze' },
  ];

  if (user && adminEmails.includes(user.email)) {
    navItems.push({ label: 'Admin Panel', path: '/admin' });
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 space-y-4 shadow-md">
        <h2 className="text-2xl font-bold mb-6">🧠 Moochi</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded hover:bg-gray-700 ${
                location.pathname === item.path ? 'bg-gray-700 font-semibold' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Admin from './Admin';
import Layout from './Layout';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import Configure from './Configure';
import Analyze from './Analyze'; // ✅ <-- Import the real Analyze.jsx component

// ✅ Auth check hook
function useAuthRedirect(navigate) {
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);
}

// ✅ Dashboard placeholder page (new default home route)
function Dashboard() {
  const navigate = useNavigate();
  useAuthRedirect(navigate);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold">📊 Dashboard</h1>
      <p className="text-gray-300 mt-2">Reports and insights will be displayed here.</p>
    </div>
  );
}

// ✅ Admin protected wrapper
function AdminProtected() {
  const navigate = useNavigate();
  useAuthRedirect(navigate);
  return <Admin />;
}

// ✅ Router
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All layout pages go inside this route */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<Analyze />} /> {/* ✅ Real analyzer */}
        <Route path="/admin" element={<AdminProtected />} />
        <Route path="/configure" element={<Configure />} />

        {/* Future pages here like: <Route path="/account" element={<AccountPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;

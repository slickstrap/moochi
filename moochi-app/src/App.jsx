// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Admin from './Admin';
import Layout from './Layout';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import Configure from './Configure';
import Analyze from './Analyze';
import Dashboard from './Dashboard'; // ✅ Newly added Dashboard component

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

// ✅ Admin protected wrapper
function AdminProtected() {
  const navigate = useNavigate();
  useAuthRedirect(navigate);
  return <Admin />;
}

// ✅ Router setup
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* All layout pages go inside this route */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} /> {/* ✅ Live Dashboard */}
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/admin" element={<AdminProtected />} />
        <Route path="/configure" element={<Configure />} />
      </Route>
    </Routes>
  );
}

export default App;

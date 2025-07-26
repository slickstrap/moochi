import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [allowed, setAllowed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRegistration = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'registration_enabled')
        .single();

      if (error || !data || data.value !== 'true') {
        setAllowed(false);
        setTimeout(() => navigate('/login'), 2000); // optional redirect
      } else {
        setAllowed(true);
      }
    };

    checkRegistration();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setError(error.message);
    } else {
      alert('✅ Registration successful! Please check your email.');
      navigate('/login');
    }
  };

  if (allowed === false) {
    return <div className="text-center text-white p-10">🚫 Registration is currently closed.</div>;
  }

  if (allowed === null) {
    return <div className="text-center text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded bg-gray-700 border border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 rounded bg-gray-700 border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;

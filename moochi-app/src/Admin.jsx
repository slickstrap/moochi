// src/Admin.jsx
import { useEffect, useState } from 'react';

function Admin() {
  const [users, setUsers] = useState([]);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (data.length > 0) {
          setRegistrationOpen(data[0].registration_open);
        }
      } catch (jsonError) {
        console.error("Error parsing JSON from fetchSettings. Response was not JSON:");
        console.error(text); // Likely HTML error like 404 page or project misroute
      }
    } catch (error) {
      console.error('Error fetching settings:', error.message);
    }
  };

  const toggleRegistration = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/settings?id=eq.1`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ registration_open: !registrationOpen }),
      });

      if (res.ok) {
        setRegistrationOpen(!registrationOpen);
      } else {
        alert('Failed to update setting.');
      }
    } catch (error) {
      alert('Error updating setting.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ User created: ${newEmail}`);
        setNewEmail('');
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create user.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-6">👑 Admin Panel</h1>

        {/* Toggle Registration */}
        <div className="mb-6">
          <button
            onClick={toggleRegistration}
            className={`px-4 py-2 rounded ${
              registrationOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {registrationOpen ? '🔒 Close Registration' : '🔓 Open Registration'}
          </button>
        </div>

        {/* Create User Form */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">➕ Create User</h2>
          <form onSubmit={handleCreateUser} className="space-y-2">
            <input
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600"
              type="email"
              placeholder="User email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <input
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600"
              type="password"
              placeholder="Temporary password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create User
            </button>
            {message && <p className="mt-2 text-sm">{message}</p>}
          </form>
        </div>

        {/* Registered Users Table */}
        <h2 className="text-xl font-semibold mb-4">👥 Registered Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-600">
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If not authorized, show modal and clear form
        if (res.status === 401 || res.status === 403) {
          setShowModal(true);
          setIdentifier('');
          setPassword('');
          setError(null);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#03A6A1]">Super Admin Login</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username or Email</label>
          <input
            type="text"
            className="w-full border border-[#03A6A1] rounded px-3 py-2"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            className="w-full border border-[#03A6A1] rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#03A6A1] text-white font-bold py-2 px-4 rounded hover:bg-[#FFA673] transition"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
      {/* Modal for permission denied */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255, 227, 187, 0.95)' }}>
          <div className="bg-[#FFE3BB] rounded-2xl p-6 w-full max-w-sm shadow-lg relative border-2 border-[#03A6A1] flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2 text-[#03A6A1]">Permission Denied</h3>
            <p className="mb-4 text-[#23272F] text-center">Only super admins can log in here.<br />If you are a regular user, please use the regular login page.</p>
            <button
              className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition mt-2"
              onClick={() => { setShowModal(false); navigate('/login'); }}
            >
              Go to Regular Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;

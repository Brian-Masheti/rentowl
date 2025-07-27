import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFE3BB] via-[#FFF8F0] to-[#03A6A1]/10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#03A6A1]/20 flex flex-col items-center">
        <img src="/images/logo2.png" alt="RentOwl Logo" className="h-14 mb-4" />
        <h2 className="text-2xl font-bold mb-6 text-center text-[#03A6A1] tracking-wide">Super Admin Login</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4 w-full">
          <label className="block mb-1 font-semibold text-[#03A6A1]">Username or Email</label>
          <input
            type="text"
            className="w-full border-2 border-[#03A6A1] rounded-full px-4 py-2 focus:ring-2 focus:ring-[#FFA673] focus:outline-none bg-[#FFF8F0] text-[#23272F] font-semibold"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            autoFocus
            placeholder="Enter your username or email"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block mb-1 font-semibold text-[#03A6A1]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full border-2 border-[#03A6A1] rounded-full px-4 py-2 focus:ring-2 focus:ring-[#FFA673] focus:outline-none bg-[#FFF8F0] text-[#23272F] font-semibold pr-12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03A6A1] hover:text-[#FFA673] focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.675A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#03A6A1] text-white font-bold py-3 px-4 rounded-full hover:bg-[#FFA673] hover:text-[#23272F] transition text-lg tracking-wide shadow-md"
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

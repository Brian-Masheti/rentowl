import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';

const API_URL =
  window.location.hostname === 'localhost'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_NETWORK;

const leftImages = [
  '/images/logo2.png',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
];

const EyeIcon = ({ open }) =>
  open ? (
    // Eye open SVG
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  ) : (
    // Eye closed SVG
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.675A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
  );

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % leftImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      if (data.user) {
        // Block super_admin, admin, and support from logging in here
        if (['super_admin', 'admin', 'support'].includes(data.user.role)) {
          setError(
            data.user.role === 'super_admin'
              ? 'Super admins must log in at /admin/login.'
              : 'Permission denied. Please contact your super admin.'
          );
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'landlord') {
          navigate('/landlord-dashboard');
        } else if (data.user.role === 'caretaker') {
          navigate('/caretaker-dashboard');
        } else if (data.user.role === 'tenant') {
          navigate('/tenant-dashboard');
        } else {
          setError('Unknown user role.');
        }
      } else {
        setError('User information missing in response.');
      }
    } catch (err) {
      setError((err instanceof Error ? err.message : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotMsg('If an account with that email exists, a password reset link has been sent.');
    } catch {
      setForgotMsg('If an account with that email exists, a password reset link has been sent.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout title="Login to access your RentOwl dashboard" images={[leftImages[slideIndex]]}>
      <form className="space-y-6 md:space-y-7" onSubmit={handleLogin}>
        <div>
          <label htmlFor="identifier" className="block text-sm font-semibold mb-1" style={{ color: '#23272F' }}>Username or Email</label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            required
            className="w-full rounded-full border px-4 py-3 text-base focus:outline-none focus:ring-2 transition-all"
            style={{ color: '#23272F', background: '#F9E7D0', borderColor: '#03A6A1', boxShadow: 'none' }}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Enter your username or email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1" style={{ color: '#23272F' }}>Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="w-full rounded-full border px-4 py-3 text-base focus:outline-none focus:ring-2 transition-all pr-12"
              style={{ color: '#23272F', background: '#F9E7D0', borderColor: '#03A6A1', boxShadow: 'none' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03A6A1] hover:text-[#FFA673] focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold hover:underline text-[#03A6A1] mt-2"
              onClick={() => setShowForgot(true)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              Forgot Password?
            </button>
          </div>
        </div>
        {error && <div className="text-sm mb-2" style={{ color: '#FF4F0F' }}>{error}</div>}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-full font-bold text-lg transition-colors"
          style={{ background: '#03A6A1', color: 'white', letterSpacing: 1 }}
          disabled={loading || !identifier || !password}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <button type="button" onClick={handleGoogleLogin} className="bg-[#FFA673] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#03A6A1] transition flex items-center gap-2">
            <span>Login with Google</span>
          </button>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="text-center">
            <span className="text-sm text-gray-700">Don't have an account?</span>
            <Link to="/register" className="ml-2 text-sm font-semibold hover:underline" style={{ color: '#03A6A1' }}>Register</Link>
          </div>
          <button
            className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition mt-2"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </form>
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255, 227, 187, 0.95)' }}>
          <div className="bg-[#FFE3BB] rounded-2xl p-6 w-full max-w-sm shadow-lg relative border-2 border-[#03A6A1]">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotEmail(''); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2 text-[#03A6A1]">Forgot Password</h3>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
              <input
                type="email"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />
              <button
                type="submit"
                className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {forgotMsg && <div className="mt-2 text-sm text-green-600">{forgotMsg}</div>}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;

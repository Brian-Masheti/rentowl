import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const leftImages = [
  '/images/logo2.png',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
];

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % leftImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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
      // Store user info (including role) in localStorage if available
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect based on role
        if (data.user.role === 'landlord') {
          navigate('/landlord-dashboard');
        } else if (data.user.role === 'caretaker') {
          navigate('/caretaker-dashboard');
        } else if (data.user.role === 'tenant') {
          navigate('/tenant-dashboard');
        } else if (data.user.role === 'super_admin') {
          navigate('/super-admin-dashboard'); // You can create this route/component
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

  const handleForgotPassword = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side: Slideshow */}
      <div className="md:w-1/2 w-full min-h-[220px] flex items-center justify-center relative overflow-hidden order-2 md:order-1" style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
          {leftImages.map((img, i) => (
            <img
              key={img}
              src={img}
              alt={`slideshow-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: i === slideIndex ? 1 : 0,
                zIndex: i === slideIndex ? 10 : 0,
                transition: 'opacity 1s',
                background: '#FFE3BB',
              }}
            />
          ))}
        </div>
      </div>
      {/* Right Side: Login Form */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center min-h-screen relative p-0 order-1 md:order-2" style={{ background: '#FFE3BB' }}>
        {/* Logo in top-left, responsive */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col items-start z-10">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-10 md:h-12 mb-1" style={{ filter: 'drop-shadow(0 1px 2px #fff)' }} />
          <span className="text-xs text-gray-600 font-semibold tracking-wide">RentOwl v1.0.0</span>
        </div>
        <div className="w-full max-w-md px-4 sm:px-8 py-8 md:py-12 flex flex-col justify-center" style={{ minHeight: 420 }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-wide text-left" style={{ color: '#23272F' }}>Login to access your RentOwl dashboard</h2>
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
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-full border px-4 py-3 text-base focus:outline-none focus:ring-2 transition-all"
                style={{ color: '#23272F', background: '#F9E7D0', borderColor: '#03A6A1', boxShadow: 'none' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
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
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-700">Don't have an account?</span>
              <Link to="/register" className="ml-2 text-sm font-semibold hover:underline" style={{ color: '#03A6A1' }}>Register</Link>
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
        </div>
      </div>
    </div>
  );
};

export default Login;

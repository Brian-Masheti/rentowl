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

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [phone, setPhone] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = [
    { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'At least one lowercase letter', test: (pw: string) => /[a-z]/.test(pw) },
    { label: 'At least one uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'At least one number', test: (pw: string) => /[0-9]/.test(pw) },
    { label: 'At least one symbol (@!#$%^&*)', test: (pw: string) => /[@!#$%^&*]/.test(pw) },
  ];
  const passwordChecks = passwordRules.map(rule => rule.test(password));
  // Removed unused allPasswordValid

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % leftImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time username availability check
  const checkUsername = async (value: string) => {
    setUsername(value);
    if (!value) return setUsernameAvailable(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/username-available/${value}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username, email, password, role, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setShowSuccessModal(true);
    } catch (err) {
      setError((err instanceof Error ? err.message : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Removed unused handleGoogleLogin

  const confirmPasswordError = confirmPasswordTouched && password !== confirmPassword;

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
      {/* Right Side: Registration Form */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center min-h-screen relative p-0 order-1 md:order-2" style={{ background: '#FFE3BB' }}>
        {/* Logo in top-left, responsive */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col items-start z-10">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-10 md:h-12 mb-1" style={{ filter: 'drop-shadow(0 1px 2px #fff)' }} />
          <span className="text-xs text-gray-600 font-semibold tracking-wide">RentOwl v1.0.0</span>
        </div>
        <div className="w-full max-w-md px-4 sm:px-8 py-8 md:py-12 flex flex-col justify-center" style={{ minHeight: 420 }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-wide text-left" style={{ color: '#23272F' }}>Register for RentOwl</h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={username}
                onChange={e => checkUsername(e.target.value)}
                required
              />
              {username && usernameAvailable === true && <span className="text-xs text-green-600">Username available</span>}
              {username && usernameAvailable === false && <span className="text-xs text-[#FF4F0F]">Username already taken</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="e.g. +254712345678"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  onCopy={e => e.preventDefault()}
                  onPaste={e => e.preventDefault()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-xs font-semibold rounded-lg px-2 py-1 transition-all"
                  style={{ color: '#03A6A1', background: 'rgba(3,166,161,0.08)' }}
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {password && (
                <ul className="mb-2 text-xs space-y-1">
                  {passwordRules.map((rule, idx) => (
                    <li key={rule.label} style={{ color: passwordChecks[idx] ? '#03A6A1' : '#FF4F0F', fontWeight: 500 }}>
                      <span className="mr-1">{passwordChecks[idx] ? '✔' : '✖'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1]"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  required
                  onCopy={e => e.preventDefault()}
                  onPaste={e => e.preventDefault()}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-xs font-semibold rounded-lg px-2 py-1 transition-all"
                  style={{ color: '#03A6A1', background: 'rgba(3,166,161,0.08)' }}
                  onClick={() => setShowConfirmPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="flex items-center mt-1 text-[#FF4F0F] text-xs font-semibold">
                  <span className="mr-1">✖</span> Password does not match
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Role</label>
              <div className="w-full" style={{ background: '#FFE3BB', border: '1px solid #FFA673', borderRadius: '9999px', padding: 0 }}>
                <select
                  className="w-full px-4 py-2 border-none text-[#03A6A1] font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFA673]/20 transition"
                  style={{ background: 'transparent', color: '#03A6A1', borderRadius: '9999px' }}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="tenant" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Tenant</option>
                  <option value="caretaker" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Caretaker</option>
                  <option value="landlord" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Landlord</option>
                  <option value="super_admin" style={{ background: '#FFE3BB', color: '#FF4F0F', fontWeight: 'bold' }}>Super Admin (For System Owner Only)</option>
                </select>
              </div>
            </div>
            {error && <div className="text-[#FF4F0F] text-sm">{error}</div>}
            <button type="submit" className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              disabled
              className="bg-[#FFA673] text-white rounded-full px-6 py-2 font-semibold opacity-60 cursor-not-allowed flex items-center gap-2"
              title="Google login is coming soon!"
            >
              <span>Sign up with Google (Coming Soon)</span>
            </button>
            <span className="text-xs text-[#FFA673] mt-1">Google login is coming soon!</span>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-700">Already have an account?</span>
            <Link to="/" className="ml-2 text-sm font-semibold hover:underline" style={{ color: '#03A6A1' }}>Login</Link>
          </div>
        </div>
      </div>
    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255, 227, 187, 0.95)' }}>
        <div className="bg-[#FFE3BB] rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-xs w-full border-2 border-[#03A6A1]">
          <img src="/images/logo2.png" alt="RentOwl Logo" className="h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-[#03A6A1]">Registration Successful!</h3>
          <p className="text-[#23272F] mb-6 text-center">Please log in to your account.</p>
          <button
            className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/');
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default Register;

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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.675A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
  );

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [landlordCode, setLandlordCode] = useState('');
  const [phone, setPhone] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Password validation rules
  const passwordRules = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
    { label: 'At least one symbol (@!#$%^&*)', test: (pw) => /[@!#$%^&*]/.test(pw) },
  ];
  const passwordChecks = passwordRules.map(rule => rule.test(password));

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % leftImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time username availability check
  const checkUsername = async (value) => {
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

  const handleRegister = async (e) => {
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
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          role,
          phone,
          landlord: (role === 'tenant' || role === 'caretaker') ? landlordCode : undefined,
        }),
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

  const confirmPasswordError = confirmPasswordTouched && password !== confirmPassword;

  return (
    <AuthLayout title="Register for RentOwl" images={[leftImages[slideIndex]]}>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#03A6A1] mb-1">First Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Last Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Username</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
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
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Phone Number</label>
          <input
            type="tel"
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none pr-12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none pr-12"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              required
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#03A6A1] hover:text-[#FFA673] focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword(v => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showConfirmPassword} />
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
              required
            >
              <option value="" disabled style={{ textAlign: 'center' }}>------Please select your role------</option>
              <option value="tenant" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Tenant</option>
              <option value="caretaker" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Caretaker</option>
              <option value="landlord" style={{ background: '#FFE3BB', color: '#03A6A1' }}>Landlord</option>
                          </select>
          </div>
        </div>
        {(role === 'tenant' || role === 'caretaker') && (
          <div>
            <label className="block text-sm font-semibold text-[#03A6A1] mb-1">Landlord Invitation Code</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:border-[#03A6A1] focus:ring-2 focus:ring-[#03A6A1] focus:outline-none"
              value={landlordCode}
              onChange={e => setLandlordCode(e.target.value)}
              required
              placeholder="Please enter your landlord invitation code"
            />
          </div>
        )}
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
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-center">
          <span className="text-sm text-gray-700">Already have an account?</span>
          <Link to="/login" className="ml-2 text-sm font-semibold hover:underline" style={{ color: '#03A6A1' }}>Login</Link>
        </div>
        <button
          className="bg-[#03A6A1] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#FFA673] transition mt-2"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
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
                navigate('/login');
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Register;

import React from 'react';

/**
 * Displays a personalized welcome message for the logged-in user.
 * Falls back to username or 'User' if firstName is missing.
 * Optionally accepts a custom greeting (e.g., 'Welcome back').
 */
export default function PersonalizedWelcome({ greeting = 'Welcome' }) {
  let name = 'User';
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        name = user.firstName || user.username || 'User';
      } catch {}
    }
  }
  return (
    <div style={{ fontWeight: 700, fontSize: 22, color: '#03A6A1', marginBottom: 16 }}>
      {greeting}, {name}!
    </div>
  );
}

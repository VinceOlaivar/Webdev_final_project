﻿import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { supabase } from '../lib/supabase'; // Import supabase for logout
import '../css/Header.css'

export default function Header() {
  const { user, profile, loading } = useAuth(); // Get user, profile, and loading state from context
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/login'); // Redirect to login page after logout
    }
  };

  return (
    <header className="app-header">
      <div className="app-container">
        <Link to="/" className="brand">
          <span className="brand-icon"></span>
          <span className="brand-text">ArcadeHub</span>
        </Link>
        <nav className="site-nav">
          <Link to="/leaderboard" className="nav-link">
             Leaderboard
          </Link>
          {loading ? (
            <span className="nav-link">Loading...</span>
          ) : user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '4px', border: '1px solid #3b82f6' }} />
                )}
                <span className="nav-link" style={{ color: '#a78bfa', cursor: 'default', paddingLeft: 0 }}>Welcome, {profile?.username || user.email?.split('@')[0] || 'Player'}!</span>
              </div>
              <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

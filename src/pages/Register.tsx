import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Container from '../components/Container';
import Button from '../components/Button';

const PREMADE_AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Garfield',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Lucky',
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // No change needed here, this was already correct.
  const [username, setUsername] = useState(''); // New state for username
  const [avatarUrl, setAvatarUrl] = useState(PREMADE_AVATARS[0]); // Default first avatar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          username,
          avatar_url: avatarUrl 
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main style={{ paddingTop: '100px', textAlign: 'center', color: 'white' }}>
        <Container>
          <h1>Check your email!</h1>
          <p>We've sent a confirmation link to {email}.</p>
          <Link to="/login" style={{ color: '#60a5fa', marginTop: '1rem', display: 'block' }}>Return to Login</Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="register-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <Container>
        <div style={{ maxWidth: '400px', margin: '0 auto', background: '#1e293b', padding: '2.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
          <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '24px' }}>Create Account</h1>
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your unique username"
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Choose Avatar</label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', background: '#0f172a', padding: '10px', borderRadius: '6px' }}>
                {PREMADE_AVATARS.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Avatar option"
                    onClick={() => setAvatarUrl(url)}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: avatarUrl === url ? '2px solid #3b82f6' : '2px solid transparent',
                      padding: '2px',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                required
              />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
              Already have an account? <Link to="/login" style={{ color: '#60a5fa' }}>Sign In</Link>
            </p>
          </form>
        </div>
      </Container>
    </main>
  );
}
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Container from '../components/Container';
import Button from '../components/Button';
import '../css/AdminLogin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use the secure RPC to get the email associated with the username
      const { data: adminEmail, error: rpcError } = await supabase.rpc('get_admin_email_by_username', {
        p_username: username
      });

      if (rpcError || !adminEmail) {
        setError('Invalid admin credentials or account does not exist.');
        setLoading(false);
        return;
      }

      // Sign in using the retrieved email and the entered password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else if (authData.user) {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <Container>
        <div className="admin-login-card">
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-subtitle">Access the administrative dashboard</p>
          
          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <div className="admin-form-group">
              <label className="admin-form-label">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your admin username"
                className="admin-form-input"
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Password</label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-form-input admin-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-show-password-btn"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <p className="admin-error-message">{error}</p>}
            <Button type="submit" disabled={loading} className="admin-submit-btn">
              {loading ? 'Logging In...' : 'Admin Login'}
            </Button>
            <p className="admin-login-footer">
              <Link to="/login">Return to Player Login</Link>
            </p>
          </form>
        </div>
      </Container>
    </main>
  );
}
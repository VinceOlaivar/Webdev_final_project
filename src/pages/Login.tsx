import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { supabase } from '../lib/supabase'
import Container from '../components/Container'
import Button from '../components/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page" style={{ paddingTop: '100px', minHeight: '80vh' }}>
      <Container>
        <div style={{ maxWidth: '400px', margin: '0 auto', background: '#1e293b', padding: '2.5rem', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <h1 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '24px' }}>ArcadeHub Login</h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '14px' }}>Enter your details to start competing</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', outline: 'none' }}
              />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '13px', margin: '0' }}>{error}</p>}
            <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Processing...' : 'Sign In'}
            </Button>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
              Don't have an account? <Link to="/register" style={{ color: '#60a5fa' }}>Register here</Link>
            </p>
          </form>
        </div>
      </Container>
    </main>
  )
}
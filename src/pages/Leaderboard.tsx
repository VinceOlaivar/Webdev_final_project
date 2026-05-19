﻿﻿﻿﻿﻿﻿﻿import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import { supabase } from '../lib/supabase';
import '../css/Leaderboard.css';

interface Score {
  id: string;
  game_slug: string;
  score: number;
  profiles: { // Nested object for joined profile data
    username: string | null;
  } | null;
  created_at: string;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('snake');

  useEffect(() => {
    fetchScores();
  }, [activeFilter]);

  async function fetchScores() {
    setLoading(true);
    try {
      // Include Minesweeper in the lower-is-better sorting logic
      const isAscending = ['reaction', 'memory', 'minesweeper'].includes(activeFilter.toLowerCase());
      let query = supabase
        .from('scores')
        .select('id, game_slug, score, created_at, profiles(username)')
        .eq('game_slug', activeFilter.toLowerCase())
        .order('score', { ascending: isAscending })
        .limit(10);

      const { data, error } = await query;
      console.log("Leaderboard Data:", data, "Error:", error);
      if (error) throw error;

      // Map data to ensure profiles object is handled correctly even if returned as array
      const formattedScores = (data as any[] || []).map(s => ({
        ...s,
        profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
      }));
      setScores(formattedScores);
    } catch (err) {
      console.error("Failed to fetch scores:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="leaderboard-page">
      <Container>
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Global Leaderboard</h1>
          <p className="leaderboard-subtitle">Top scores from players around the world</p>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>
            <span style={{ color: '#f87171', fontWeight: 'bold' }}>Note:</span> You must be logged in for your scores to be saved.
          </p>
        </div>

        <div className="leaderboard-filters">
          {['Snake', 'Tetris', '2048', 'Typing', 'Memory', 'Reaction', 'Minesweeper', 'Breakout'].map((f) => (
            <button 
              key={f} 
              className={`filter-btn ${activeFilter === f.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.toLowerCase())}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="leaderboard-empty">
            <p>Loading scores...</p>
          </div>
        ) : scores.length > 0 ? (
          <div className="scores-list" style={{ marginTop: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Rank</th>
                  <th style={{ padding: '12px' }}>Player</th>
                  <th style={{ padding: '12px' }}>Game</th>
                  <th style={{ padding: '12px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, index) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px' }}>#{index + 1}</td>
                    <td style={{ padding: '12px' }}>{s.profiles?.username || 'Anonymous'}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{s.game_slug}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#60a5fa' }}>
                      {s.score.toLocaleString()}
                      {s.game_slug === 'reaction' 
                        ? ' ms' 
                        : s.game_slug === 'memory' 
                        ? ' moves' 
                        : s.game_slug === 'tetris' || s.game_slug === 'snake' || s.game_slug === '2048'
                        ? ' pts'
                        : s.game_slug === 'minesweeper'
                        ? 's'
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="leaderboard-empty">
            <p>No scores found for this category yet. Be the first to play!</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
            ← Back to Home
          </Link>
        </div>
      </Container>
    </main>
  );
}

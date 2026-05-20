import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Container from '../components/Container';
import '../css/Admin.css';

interface PlayerProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_banned: boolean;
  created_at: string;
}

interface ScoreHistory {
  id: string;
  game_slug: string;
  score: number;
  created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth() as any;
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<{username: string, scores: ScoreHistory[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminAccess() {
      if (!authLoading) {
        if (!user) {
          navigate('/admin-login');
          return;
        }
        const { data } = await supabase.from('admins').select('id, username').eq('id', user.id).maybeSingle();
        if (!data) {
          navigate('/');
        } else {
          setIsAdmin(true);
          setAdminUsername(data.username);
          fetchPlayers();
        }
      }
    }
    checkAdminAccess();
  }, [user, authLoading, navigate]);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_banned, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Admin Dashboard Fetch Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (playerId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this player?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('id', playerId);

      if (error) throw error;
      
      // Refresh the list to show the new status
      await fetchPlayers();
    } catch (err: any) {
      console.error('Failed to update ban status:', err.message);
      alert(`Error: ${err.message}. Check if you have the correct RLS policies enabled.`);
    }
  };

  const viewHistory = async (playerId: string, username: string) => {
    const { data, error } = await supabase
      .from('scores')
      .select('id, game_slug, score, created_at')
      .eq('user_id', playerId)
      .order('created_at', { ascending: false });

    if (!error) {
      setSelectedHistory({ username, scores: data || [] });
    }
  };

  if (loading || !isAdmin) return <div style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>Accessing restricted area...</div>;

  return (
    <main className="admin-page">
      <Container>
        <div className="admin-dashboard-header">
          <h1>🛡️ Admin Dashboard</h1>
          <p className="admin-logged-in-as">Logged in as: <span className="highlight">{adminUsername}</span></p>
        </div>
        
        <div className={`admin-dashboard-grid ${selectedHistory ? 'two-cols' : 'one-col'}`}>
          <div className="admin-section-container">
            <h2 className="admin-section-title">Manage Players</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <div className="admin-player-info">
                        <img src={player.avatar_url} className="admin-player-avatar" alt="" />
                        {player.username}
                      </div>
                    </td>
                    <td>
                      <span className={player.is_banned ? 'status-banned' : 'status-active'}>
                        {player.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button onClick={() => viewHistory(player.id, player.username)} className="admin-btn-action admin-btn-history">History</button>
                        <button onClick={() => toggleBan(player.id, player.is_banned)} className={`admin-btn-action ${player.is_banned ? 'admin-btn-unban' : 'admin-btn-ban'}`}>
                          {player.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedHistory && (
            <div className="admin-history-view">
              <div className="admin-history-header">
                <h2>History: {selectedHistory.username}</h2>
                <button onClick={() => setSelectedHistory(null)} className="admin-btn-close">Close</button>
              </div>
              {selectedHistory.scores.length === 0 ? (
                <p className="admin-history-empty">No activity found.</p>
              ) : (
                <div className="admin-history-list">
                  {selectedHistory.scores.map((score) => (
                    <div key={score.id} className="admin-history-item">
                      <span><strong className="game-slug">{score.game_slug}</strong>: {score.score.toLocaleString()}</span>
                      <span className="date">{new Date(score.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
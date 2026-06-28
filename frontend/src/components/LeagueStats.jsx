import React, { useState, useEffect } from 'react';
import { getLeagueStats, getSeasons } from '../utils/api';
import { RefreshCw, Trophy, Flame } from 'lucide-react';

export default function LeagueStats() {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [caps, setCaps] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await getSeasons();
        setSeasons(res.data.seasons);
        if (res.data.seasons.length > 0) {
          setSelectedSeason(res.data.seasons[0]);
        }
      } catch (err) {
        console.error("Error loading seasons", err);
      }
    }
    loadSeasons();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    async function loadCaps() {
      setLoading(true);
      try {
        const res = await getLeagueStats(selectedSeason);
        setCaps(res.data);
      } catch (err) {
        console.error("Error loading caps", err);
      } finally {
        setLoading(false);
      }
    }
    loadCaps();
  }, [selectedSeason]);

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between">
        <div>
          <h1 className="page-title">Orange & Purple Cap Leaderboards</h1>
          <p className="page-subtitle">Top batters and bowlers in the league for a selected season.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Season:</label>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="form-select text-sm"
          >
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {!caps ? (
        <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', minHeight: '320px' }}>
          <Trophy className="w-12 h-12 text-slate-600" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#cbd5e1' }}>Select a season</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>Select a season to view cap leaderboards.</p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <RefreshCw className="loading-spinner" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Orange Cap */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-amber)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame className="w-5 h-5 text-amber-500" />
              Orange Cap (Most Runs)
            </h2>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th style={{ color: 'var(--color-amber)' }}>Runs</th>
                    <th>Balls</th>
                    <th>Strike Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {caps.orange_cap.map((p, idx) => (
                    <tr key={p.player} style={{ background: idx === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }}>
                      <td style={{ fontWeight: '800', color: 'var(--text-muted)' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>
                        {p.player}
                        {idx === 0 && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-amber)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.25)', fontWeight: '700' }}>CAP</span>}
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--color-amber)' }}>{p.runs}</td>
                      <td>{p.balls}</td>
                      <td>{p.strike_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purple Cap */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#a855f7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy className="w-5 h-5 text-purple-500" />
              Purple Cap (Most Wickets)
            </h2>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th style={{ color: '#a855f7' }}>Wickets</th>
                    <th>Economy</th>
                  </tr>
                </thead>
                <tbody>
                  {caps.purple_cap.map((p, idx) => (
                    <tr key={p.player} style={{ background: idx === 0 ? 'rgba(168, 85, 247, 0.05)' : 'transparent' }}>
                      <td style={{ fontWeight: '800', color: 'var(--text-muted)' }}>#{idx + 1}</td>
                      <td style={{ fontWeight: '600' }}>
                        {p.player}
                        {idx === 0 && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.25)', fontWeight: '700' }}>CAP</span>}
                      </td>
                      <td style={{ fontWeight: '800', color: '#a855f7' }}>{p.wickets}</td>
                      <td>{p.economy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

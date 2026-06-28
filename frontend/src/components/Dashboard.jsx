import React, { useState, useEffect } from 'react';
import { getMatches, getSeasons, getTossImpactSummary } from '../utils/api';
import { RefreshCw } from 'lucide-react';

export default function Dashboard({ onViewMatchProgression }) {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [matches, setMatches] = useState([]);
  const [tossStats, setTossStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const seasonsRes = await getSeasons();
        setSeasons(seasonsRes.data.seasons);
        if (seasonsRes.data.seasons.length > 0) {
          setSelectedSeason(seasonsRes.data.seasons[0]);
        }
        
        const tossRes = await getTossImpactSummary();
        setTossStats(tossRes.data);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const matchesRes = await getMatches(selectedSeason);
        setMatches(matchesRes.data.matches);
      } catch (err) {
        console.error("Error loading matches", err);
      } finally {
        setLoadingMatches(false);
      }
    }
    loadMatches();
  }, [selectedSeason]);

  if (loading) {
    return (
      <div className="spinner-container">
        <RefreshCw className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">League Dashboard</h1>
          <p className="page-subtitle">Historical results, season fixture tables, and toss breakdown.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>Season Context:</span>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="form-select text-sm"
          >
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {tossStats && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total League Matches</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{tossStats.total_matches}</span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toss Winner Match Win %</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-cyan)' }}>{tossStats.toss_winner_win_pct}%</span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toss Win - Bat First Win %</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{tossStats.decisions.bat_win_pct}%</span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toss Win - Field First Win %</span>
            <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{tossStats.decisions.field_win_pct}%</span>
          </div>
        </div>
      )}

      {/* Main Section */}
      <div className="grid-2-1">
        {/* Matches List */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Season Fixtures ({selectedSeason})</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {matches.length} matches played
            </span>
          </div>

          {loadingMatches ? (
            <div className="spinner-container">
              <RefreshCw className="loading-spinner" />
            </div>
          ) : (
            <div className="custom-table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Teams</th>
                    <th>Venue</th>
                    <th>Winner</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => {
                    const teamList = m.teams.split(',');
                    return (
                      <tr key={m.match_id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                            {teamList[0]} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.8rem' }}>vs</span> {teamList[1]}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.date}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.venue}
                        </td>
                        <td>
                          {m.winner === 'no result' ? (
                            <span className="badge-gray">No Result</span>
                          ) : (
                            <span className="badge-winner">{m.winner}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => onViewMatchProgression(m.match_id)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Analyze Run Rate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Toss Decision Analytics */}
        {tossStats && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Toss Choice Distribution</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Field First Decisions</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{tossStats.decisions.field} matches</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ background: 'var(--color-cyan)', height: '6px', width: `${(tossStats.decisions.field / (tossStats.decisions.field + tossStats.decisions.bat)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bat First Decisions</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{tossStats.decisions.bat} matches</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ background: 'rgba(255,255,255,0.2)', height: '6px', width: `${(tossStats.decisions.bat / (tossStats.decisions.field + tossStats.decisions.bat)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '16px', lineHeight: '1.4' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Toss Insight</span>
              Winning the toss and chasing (field first) is the dominant strategy in modern cricket seasons due to dew and target tracking factors.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getTeams, compareTeams, getSeasons } from '../utils/api';
import { BarChart2, Award, Layers, Flame, Target, RefreshCw } from 'lucide-react';

export default function TeamComparison() {
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const teamsRes = await getTeams();
        setTeams(teamsRes.data.teams);
        
        const seasonsRes = await getSeasons();
        setSeasons(seasonsRes.data.seasons);
      } catch (err) {
        console.error("Error loading team compare data", err);
      }
    }
    loadData();
  }, []);

  async function handleCompare() {
    if (!t1 || !t2) return;
    setLoading(true);
    try {
      const res = await compareTeams(t1, t2, selectedSeason);
      setComparison(res.data);
    } catch (err) {
      console.error("Error comparing teams", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between">
        <div>
          <h1 className="page-title">Team Comparison Engine</h1>
          <p className="page-subtitle">Head-to-head match histories, phase capabilities, and average run rates.</p>
        </div>

        <div>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="form-select text-sm"
          >
            <option value="">All Seasons</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Select Box Panel */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px' }}>Select Teams to Analyze</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Team 1</label>
            <select
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="">Choose Team 1</option>
              {teams.map(t => <option key={t} value={t} disabled={t === t2}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Team 2</label>
            <select
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="">Choose Team 2</option>
              {teams.map(t => <option key={t} value={t} disabled={t === t1}>{t}</option>)}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!t1 || !t2}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
            Run Comparison
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {!comparison ? (
        <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <Layers className="w-12 h-12 text-slate-600" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#cbd5e1' }}>Select two teams to start</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            Query head to head metrics, boundary rates, powerplay scoring, and death-over capability.
          </p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <RefreshCw className="loading-spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Head to Head Summary */}
          <div className="responsive-grid-1-2">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>H2H WIN SUMMARY</h3>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '6px' }}>Head to Head Record</h2>
              </div>
              <div style={{ margin: '24px 0' }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)' }}>{comparison.head_to_head.played}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Total Matchups</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', padding: '10px 20px', borderRadius: '30px' }}>
                <span style={{ color: 'var(--color-cyan)' }}>{t1}: {comparison.head_to_head.team1_wins}</span>
                <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>|</span>
                <span style={{ color: 'var(--color-pink)' }}>{t2}: {comparison.head_to_head.team2_wins}</span>
              </div>
            </div>

            {/* H2H Stat Comparison Cards */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award className="w-5 h-5 text-yellow-500" />
                Head-to-Head Stats Comparison
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {/* Average Score */}
                <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target className="w-4 h-4 text-cyan-400" />
                    AVERAGE RUNS IN MATCHUPS
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: '700', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.head_to_head_stats.team1.avg_score}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-pink)', fontWeight: '700', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2}</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.head_to_head_stats.team2.avg_score}</span>
                    </div>
                  </div>
                </div>

                {/* Boundary Analysis */}
                <div className="stat-box" style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.4)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame className="w-4 h-4 text-pink-400" />
                    BOUNDARIES SCORED IN H2H
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: '700', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', marginTop: '6px', display: 'block' }}>
                        4s: <strong className="text-white">{comparison.head_to_head_stats.team1.fours}</strong> | 6s: <strong className="text-white">{comparison.head_to_head_stats.team1.sixes}</strong>
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-pink)', fontWeight: '700', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2}</span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', marginTop: '6px', display: 'block' }}>
                        4s: <strong className="text-white">{comparison.head_to_head_stats.team2.fours}</strong> | 6s: <strong className="text-white">{comparison.head_to_head_stats.team2.sixes}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase-wise Overall Season Metrics */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers className="w-5 h-5 text-indigo-400" />
              Overall Season Phase Capabilities (vs All Opponents)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Season Average Score */}
              <div className="stat-box" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Season Average Score</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team1.avg_score}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-pink)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team2.avg_score}</span>
                  </div>
                </div>
              </div>

              {/* Powerplay Run Rate */}
              <div className="stat-box" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Powerplay Run Rate (Overs 1-6)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team1.powerplay_rr}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-pink)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team2.powerplay_rr}</span>
                  </div>
                </div>
              </div>

              {/* Death Over Run Rate */}
              <div className="stat-box" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Death Overs Run Rate (Overs 16-20)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team1.death_rr}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-pink)', fontWeight: '700', display: 'block', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', display: 'block' }}>{comparison.overall_comparison.team2.death_rr}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

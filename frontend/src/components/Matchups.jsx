import React, { useState, useEffect } from 'react';
import { getPlayers, getPlayerMatchup, getSeasons } from '../utils/api';
import { RefreshCw, Swords } from 'lucide-react';

export default function Matchups() {
  const [players, setPlayers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  
  const [batter, setBatter] = useState('');
  const [bowler, setBowler] = useState('');
  const [matchup, setMatchup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const playersRes = await getPlayers();
        setPlayers(playersRes.data.players);
        
        const seasonsRes = await getSeasons();
        setSeasons(seasonsRes.data.seasons);
      } catch (err) {
        console.error("Error loading matchups dropdowns", err);
      }
    }
    loadData();
  }, []);

  async function handleAnalyze() {
    if (!batter || !bowler) return;
    setLoading(true);
    try {
      const res = await getPlayerMatchup(batter, bowler, selectedSeason);
      setMatchup(res.data);
    } catch (err) {
      console.error("Error fetching matchup stats", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Batter vs Bowler Matchups</h1>
          <p className="page-subtitle">Analyze ball-by-ball head-to-head metrics for any batsman and bowler combination.</p>
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

      {/* Select Matchup */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Select Opponents</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Batter</label>
            <select
              value={batter}
              onChange={(e) => setBatter(e.target.value)}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="">Choose Batter</option>
              {players.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Bowler</label>
            <select
              value={bowler}
              onChange={(e) => setBowler(e.target.value)}
              className="form-select"
              style={{ width: '100%' }}
            >
              <option value="">Choose Bowler</option>
              {players.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!batter || !bowler}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Swords className="w-4 h-4" />}
            Analyze Matchup
          </button>
        </div>
      </div>

      {/* Results */}
      {!matchup ? (
        <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <Swords className="w-10 h-10 text-slate-600" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#cbd5e1' }}>Compare Matchup Data</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            Choose a batsman and a bowler to inspect runs, balls, strike rates, dot percentages, and dismissals.
          </p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <RefreshCw className="loading-spinner" />
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {matchup.batter} vs {matchup.bowler}
          </h3>

          <div className="custom-table-container" style={{ border: 'none', marginTop: 0 }}>
            <table className="custom-table" style={{ background: 'transparent' }}>
              <tbody>
                <tr>
                  <td style={{ width: '40%', color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Runs Scored</td>
                  <td style={{ width: '60%', fontWeight: '800', color: 'var(--color-cyan)', background: 'transparent', padding: '12px 0', fontSize: '1.1rem' }}>
                    {matchup.runs} runs
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Balls Faced</td>
                  <td style={{ fontWeight: '700', background: 'transparent', padding: '12px 0' }}>
                    {matchup.balls} balls
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Strike Rate</td>
                  <td style={{ fontWeight: '800', color: 'var(--color-cyan)', background: 'transparent', padding: '12px 0' }}>
                    {matchup.strike_rate}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Dismissed by Bowler</td>
                  <td style={{ fontWeight: '800', color: matchup.dismissals > 0 ? 'var(--color-red)' : 'var(--color-emerald)', background: 'transparent', padding: '12px 0' }}>
                    {matchup.dismissals} {matchup.dismissals === 1 ? 'time' : 'times'}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Dot Balls Forced</td>
                  <td style={{ fontWeight: '700', background: 'transparent', padding: '12px 0' }}>
                    {matchup.dots} dots ({matchup.dot_pct}%)
                  </td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '12px 0' }}>Boundaries Hit</td>
                  <td style={{ fontWeight: '700', background: 'transparent', padding: '12px 0' }}>
                    Fours: <strong className="text-white">{matchup.fours}</strong> | Sixes: <strong className="text-white">{matchup.sixes}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="info-highlight-box" style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Matchup Insight</span>
            {matchup.balls === 0 ? (
              <span>These two players have not faced each other in the selected context.</span>
            ) : matchup.dismissals > 2 ? (
              <span>{matchup.bowler} has dominated this matchup, dismissing {matchup.batter} {matchup.dismissals} times.</span>
            ) : matchup.strike_rate > 150 ? (
              <span>{matchup.batter} has aggressive numbers off {matchup.bowler}, scoring at a {matchup.strike_rate} strike rate.</span>
            ) : (
              <span>Balanced duel: {matchup.batter} averages {matchup.runs} runs facing {matchup.bowler} across {matchup.balls} deliveries.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

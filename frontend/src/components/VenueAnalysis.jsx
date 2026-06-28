import React, { useState, useEffect } from 'react';
import { getVenues, getVenueDetail } from '../utils/api';
import { MapPin, RefreshCw, Trophy, Target } from 'lucide-react';

export default function VenueAnalysis() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venueStats, setVenueStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadVenues() {
      try {
        const res = await getVenues();
        setVenues(res.data.venues);
        if (res.data.venues.length > 0) {
          setSelectedVenue(res.data.venues[0]);
        }
      } catch (err) {
        console.error("Error loading venues", err);
      }
    }
    loadVenues();
  }, []);

  useEffect(() => {
    if (!selectedVenue) return;
    async function loadVenueDetail() {
      setLoading(true);
      try {
        const res = await getVenueDetail(selectedVenue);
        setVenueStats(res.data);
      } catch (err) {
        console.error("Error loading venue detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadVenueDetail();
  }, [selectedVenue]);

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between">
        <div>
          <h1 className="page-title">Venue & Pitch Analysis</h1>
          <p className="page-subtitle">Average innings scores, pace vs. spin balance, and historical toss impacts.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Venue:</label>
          <select 
            value={selectedVenue} 
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="form-select text-sm"
            style={{ minWidth: '240px' }}
          >
            {venues.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {!venueStats ? (
        <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <MapPin className="w-12 h-12 text-slate-600" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#cbd5e1' }}>Select a venue</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            Select an IPL venue to view average scores, pitch behavior, and toss records.
          </p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <RefreshCw className="loading-spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Summary Stats Row */}
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Total Matches</span>
              <span className="stat-value">{venueStats.total_matches}</span>
            </div>
            
            <div className="stat-box">
              <span className="stat-label">1st Innings Average</span>
              <span className="stat-value cyan">{venueStats.avg_first_innings}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">2nd Innings Average</span>
              <span className="stat-value">{venueStats.avg_second_innings}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Toss Winner Win %</span>
              <span className="stat-value pink">{venueStats.toss_impact.toss_winner_win_pct}%</span>
            </div>
          </div>

          {/* Matplotlib Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Pie Chart: Pace vs Spin */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <img 
                src={`data:image/png;base64,${venueStats.pie_chart}`} 
                alt="Pace vs Spin Wicket Split" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
              />
            </div>

            {/* Bar Chart: Toss Winner Decision Success */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <img 
                src={`data:image/png;base64,${venueStats.bar_chart}`} 
                alt="Toss Impact Chart" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
              />
            </div>
          </div>

          {/* Top Players at the Venue */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Top Batters */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target className="w-5 h-5 text-cyan-400" />
                Top 5 Run Scorers at this Venue
              </h3>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Batter</th>
                      <th style={{ textAlign: 'right' }}>Runs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venueStats.top_batters.map((b, i) => (
                      <tr key={b.name}>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>#{i+1}</span>
                          {b.name}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-cyan)' }}>{b.runs} runs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Bowlers */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy className="w-5 h-5 text-pink-400" />
                Top 5 Wicket Takers at this Venue
              </h3>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Bowler</th>
                      <th style={{ textAlign: 'right' }}>Wickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venueStats.top_bowlers.map((b, i) => (
                      <tr key={b.name}>
                        <td style={{ fontWeight: '600' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>#{i+1}</span>
                          {b.name}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--color-pink)' }}>{b.wickets} wickets</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

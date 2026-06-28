import React, { useState, useEffect } from 'react';
import { getMatchDetail } from '../utils/api';
import { X, RefreshCw, Trophy, Clock } from 'lucide-react';

export default function MatchProgressionModal({ matchId, onClose }) {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await getMatchDetail(matchId);
        setMatchData(res.data);
      } catch (err) {
        console.error("Error loading match progression", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [matchId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn">
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="spinner-container">
            <RefreshCw className="loading-spinner" />
          </div>
        ) : (
          matchData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Details */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', paddingRight: '40px' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                  Match Analysis: #{matchId}
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '12px' }}>
                  {matchData.team1} vs {matchData.team2}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock className="w-3.5 h-3.5" />
                    {matchData.info.date}
                  </div>
                  <span>•</span>
                  <div>{matchData.info.venue}</div>
                </div>
              </div>

              {/* Match Result Alert */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--color-emerald)', padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Trophy className="w-5 h-5 flex-shrink-0" />
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                  Winner: {matchData.info.winner === 'no result' ? 'No Result' : `${matchData.info.winner} won by ${matchData.info.winner_runs ? matchData.info.winner_runs + ' runs' : matchData.info.winner_wickets + ' wickets'}`}
                </span>
              </div>

              {/* Matplotlib Run Rate Progress Line Chart */}
              <div className="chart-container">
                <img 
                  src={`data:image/png;base64,${matchData.chart}`} 
                  alt="Match Progression Chart" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
                />
              </div>

              {/* Overs Stats Table */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Overs Breakdown</h3>
                <div className="custom-table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="custom-table" style={{ textAlign: 'center' }}>
                    <thead>
                      <tr>
                        <th>Over</th>
                        <th colSpan="2" style={{ color: 'var(--color-cyan)', fontWeight: '800', borderRight: '1px solid var(--border-light)' }}>{matchData.team1} (Inn 1)</th>
                        <th colSpan="2" style={{ color: 'var(--color-pink)', fontWeight: '800' }}>{matchData.team2} (Inn 2)</th>
                      </tr>
                      <tr style={{ background: 'rgba(15, 23, 42, 0.4)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <th>#</th>
                        <th>Runs (Wkts)</th>
                        <th style={{ borderRight: '1px solid var(--border-light)' }}>Run Rate</th>
                        <th>Runs (Wkts)</th>
                        <th>Run Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 20 }).map((_, index) => {
                        const overNum = index;
                        const o1 = matchData.innings1.find(x => x.over_num === overNum);
                        const o2 = matchData.innings2.find(x => x.over_num === overNum);

                        return (
                          <tr key={overNum}>
                            <td style={{ fontWeight: '850', color: 'var(--text-muted)' }}>Over {overNum + 1}</td>
                            
                            {/* Innings 1 */}
                            <td>{o1 ? `${o1.cum_runs} (${o1.cum_wickets})` : '-'}</td>
                            <td style={{ borderRight: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o1 ? `${o1.run_rate.toFixed(1)}/ov` : '-'}</td>

                            {/* Innings 2 */}
                            <td>{o2 ? `${o2.cum_runs} (${o2.cum_wickets})` : '-'}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o2 ? `${o2.run_rate.toFixed(1)}/ov` : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )
        )}
      </div>
    </div>
  );
}

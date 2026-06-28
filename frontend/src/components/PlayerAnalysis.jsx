import React, { useState, useEffect } from 'react';
import { getPlayers, getPlayerDetail, comparePlayers, getSeasons } from '../utils/api';
import { Search, User, RefreshCw, BarChart2, ArrowRightLeft } from 'lucide-react';

export default function PlayerAnalysis() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  
  // Single Player Analysis State
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Comparison State
  const [compareMode, setCompareMode] = useState(false);
  const [compareP1, setCompareP1] = useState('');
  const [compareP2, setCompareP2] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const seasonsRes = await getSeasons();
        setSeasons(seasonsRes.data.seasons);
        
        const playersRes = await getPlayers();
        setPlayers(playersRes.data.players);
      } catch (err) {
        console.error("Error loading players data", err);
      }
    }
    loadInitial();
  }, []);

  // Handle loading stats for single player
  useEffect(() => {
    if (!selectedPlayer) return;
    async function loadStats() {
      setLoadingStats(true);
      try {
        const res = await getPlayerDetail(selectedPlayer, selectedSeason);
        setPlayerStats(res.data);
      } catch (err) {
        console.error("Error loading player details", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, [selectedPlayer, selectedSeason]);

  // Handle comparison query
  async function handleCompare() {
    if (!compareP1 || !compareP2) return;
    setLoadingCompare(true);
    try {
      const res = await comparePlayers(compareP1, compareP2, selectedSeason);
      setCompareResult(res.data);
    } catch (err) {
      console.error("Error comparing players", err);
    } finally {
      setLoadingCompare(false);
    }
  }

  const filteredPlayers = players.filter(p => 
    p.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="animate-fade-in">
      <div className="flex-row-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Player Analytics</h1>
          <p className="page-subtitle">Career statistics, search parameters, and player comparison overlays.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareResult(null);
            }}
            className="btn-secondary text-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {compareMode ? 'Exit Compare' : 'Compare Mode'}
          </button>
          
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

      {!compareMode ? (
        /* SINGLE PLAYER MODE */
        <div className="responsive-grid-1-2_5">
          {/* Player Search Sidebar */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Search Player</h2>
            
            <div className="search-widget">
              <input 
                type="text" 
                placeholder="Type name (e.g. Kohli)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '38px' }}
              />
              <Search className="search-icon-pos w-4 h-4" style={{ top: '15px' }} />
            </div>

            {searchTerm && (
              <div className="search-results-list" style={{ marginBottom: '16px' }}>
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedPlayer(p);
                        setSearchTerm('');
                      }}
                      className="search-item-btn"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      {p}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No players found
                  </p>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Quick Selection
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { name: 'Virat Kohli', value: 'V Kohli' },
                  { name: 'MS Dhoni', value: 'MS Dhoni' },
                  { name: 'Rohit Sharma', value: 'RG Sharma' },
                  { name: 'David Warner', value: 'DA Warner' },
                  { name: 'Yuzvendra Chahal', value: 'YS Chahal' },
                  { name: 'Jasprit Bumrah', value: 'JJ Bumrah' },
                  { name: 'Rashid Khan', value: 'Rashid Khan' }
                ].map(p => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPlayer(p.value)}
                    className="btn-secondary"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      borderColor: selectedPlayer === p.value ? 'var(--color-cyan)' : 'rgba(255,255,255,0.08)',
                      background: selectedPlayer === p.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: selectedPlayer === p.value ? 'var(--color-cyan)' : 'var(--text-muted)',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Player Stats Panel */}
          <div>
            {!selectedPlayer ? (
              <div className="glass-card" style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                <User className="w-10 h-10 text-slate-650" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '750', color: 'var(--text-muted)' }}>No Player Selected</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Select a player from the sidebar to load statistics.
                </p>
              </div>
            ) : loadingStats ? (
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                <RefreshCw className="loading-spinner" />
              </div>
            ) : (
              playerStats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Bio Header */}
                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>{playerStats.player_name}</h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Teams: {playerStats.teams.join(', ')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', padding: '5px 10px', borderRadius: '4px' }}>
                      {selectedSeason ? `Season ${selectedSeason}` : 'All Seasons'}
                    </span>
                  </div>

                  {/* Batting Card */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                      Batting Summary
                    </h3>
                    <div className="custom-table-container" style={{ border: 'none', marginTop: 0 }}>
                      <table className="custom-table" style={{ background: 'transparent' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '25%', color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Matches</td>
                            <td style={{ width: '25%', fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.matches}</td>
                            <td style={{ width: '25%', color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Runs</td>
                            <td style={{ width: '25%', fontWeight: '700', color: 'var(--color-cyan)', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.runs}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Average</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.average}</td>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Strike Rate</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.strike_rate}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Highest Score</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.highest_score}</td>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>50s / 100s</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.fifties} / {playerStats.batting.hundreds}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Fours / Sixes</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.fours} / {playerStats.batting.sixes}</td>
                            <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Ducks</td>
                            <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.batting.ducks}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bowling Card */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                      Bowling Summary
                    </h3>
                    {playerStats.bowling.overs > 0 ? (
                      <div className="custom-table-container" style={{ border: 'none', marginTop: 0 }}>
                        <table className="custom-table" style={{ background: 'transparent' }}>
                          <tbody>
                            <tr>
                              <td style={{ width: '25%', color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Overs</td>
                              <td style={{ width: '25%', fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.overs}</td>
                              <td style={{ width: '25%', color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Wickets</td>
                              <td style={{ width: '25%', fontWeight: '700', color: 'var(--color-pink)', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.wickets}</td>
                            </tr>
                            <tr>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Economy</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.economy}</td>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Average</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.average}</td>
                            </tr>
                            <tr>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Best Bowling</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.best_bowling}</td>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Strike Rate</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.strike_rate}</td>
                            </tr>
                            <tr>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>Runs Conceded</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.runs_conceded}</td>
                              <td style={{ color: 'var(--text-muted)', background: 'transparent', padding: '10px 0' }}>4w / 5w Hauls</td>
                              <td style={{ fontWeight: '700', background: 'transparent', padding: '10px 0' }}>{playerStats.bowling.four_w} / {playerStats.bowling.five_w}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                        Player did not bowl in selected context.
                      </p>
                    )}
                  </div>

                  {/* Phase Analysis Card */}
                  <div className="glass-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                      Game Phase Performance Breakdown
                    </h3>
                    
                    {/* Batting Phases */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-cyan)', marginBottom: '10px' }}>Batting by Phases</h4>
                      <div className="custom-table-container" style={{ border: 'none', marginTop: 0 }}>
                        <table className="custom-table" style={{ background: 'transparent' }}>
                          <thead>
                            <tr style={{ background: 'transparent' }}>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Phase</th>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Runs</th>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Balls</th>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Outs</th>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Avg</th>
                              <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Strike Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Powerplay (Overs 1-6)</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700' }}>{playerStats.phases.batting.powerplay.runs}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.powerplay.balls}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.powerplay.dismissals}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.powerplay.average}</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-cyan)' }}>{playerStats.phases.batting.powerplay.strike_rate}</td>
                            </tr>
                            <tr>
                              <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Middle (Overs 7-15)</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700' }}>{playerStats.phases.batting.middle.runs}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.middle.balls}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.middle.dismissals}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.middle.average}</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-cyan)' }}>{playerStats.phases.batting.middle.strike_rate}</td>
                            </tr>
                            <tr>
                              <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Death (Overs 16-20)</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700' }}>{playerStats.phases.batting.death.runs}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.death.balls}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.death.dismissals}</td>
                              <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.batting.death.average}</td>
                              <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-cyan)' }}>{playerStats.phases.batting.death.strike_rate}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowling Phases if player has bowled */}
                    {playerStats.bowling.overs > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-pink)', marginBottom: '10px' }}>Bowling by Phases</h4>
                        <div className="custom-table-container" style={{ border: 'none', marginTop: 0 }}>
                          <table className="custom-table" style={{ background: 'transparent' }}>
                            <thead>
                              <tr style={{ background: 'transparent' }}>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Phase</th>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Overs</th>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Runs</th>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Wickets</th>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Economy</th>
                                <th style={{ background: 'transparent', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>Strike Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Powerplay (Overs 1-6)</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.powerplay.overs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.powerplay.runs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-pink)' }}>{playerStats.phases.bowling.powerplay.wickets}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.powerplay.economy}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.powerplay.strike_rate || '-'}</td>
                              </tr>
                              <tr>
                                <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Middle (Overs 7-15)</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.middle.overs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.middle.runs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-pink)' }}>{playerStats.phases.bowling.middle.wickets}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.middle.economy}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.middle.strike_rate || '-'}</td>
                              </tr>
                              <tr>
                                <td style={{ background: 'transparent', padding: '10px 0', color: 'var(--text-muted)' }}>Death (Overs 16-20)</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.death.overs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.death.runs}</td>
                                <td style={{ background: 'transparent', padding: '10px 0', fontWeight: '700', color: 'var(--color-pink)' }}>{playerStats.phases.bowling.death.wickets}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.death.economy}</td>
                                <td style={{ background: 'transparent', padding: '10px 0' }}>{playerStats.phases.bowling.death.strike_rate || '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        /* COMPARISON MODE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Select Players to Compare</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Player 1</label>
                <select
                  value={compareP1}
                  onChange={(e) => setCompareP1(e.target.value)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Choose Player 1</option>
                  {players.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Player 2</label>
                <select
                  value={compareP2}
                  onChange={(e) => setCompareP2(e.target.value)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Choose Player 2</option>
                  {players.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <button
                onClick={handleCompare}
                disabled={!compareP1 || !compareP2}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {loadingCompare ? <RefreshCw className="animate-spin w-4 h-4" /> : <BarChart2 className="w-4 h-4" />}
                Compare Statistics
              </button>
            </div>
          </div>

          {compareResult && (
            <div className="responsive-grid-1_2-1_8">
              {/* Matplotlib Radar Chart */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={`data:image/png;base64,${compareResult.chart}`} 
                  alt="Player Comparison Chart" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>

              {/* Side-by-Side Statistics Grid */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px' }}>Compare Performance Data</h3>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th style={{ color: 'var(--color-cyan)', fontWeight: '700' }}>{compareResult.player1.player_name}</th>
                        <th style={{ color: 'var(--color-pink)', fontWeight: '700' }}>{compareResult.player2.player_name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Batting Matches</td>
                        <td>{compareResult.player1.batting.matches}</td>
                        <td>{compareResult.player2.batting.matches}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Runs Scored</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-cyan)' }}>{compareResult.player1.batting.runs}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-pink)' }}>{compareResult.player2.batting.runs}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Batting Average</td>
                        <td>{compareResult.player1.batting.average}</td>
                        <td>{compareResult.player2.batting.average}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Strike Rate</td>
                        <td style={{ fontWeight: '600' }}>{compareResult.player1.batting.strike_rate}</td>
                        <td style={{ fontWeight: '600' }}>{compareResult.player2.batting.strike_rate}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Highest Score</td>
                        <td>{compareResult.player1.batting.highest_score}</td>
                        <td>{compareResult.player2.batting.highest_score}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>50s / 100s</td>
                        <td>{compareResult.player1.batting.fifties} / {compareResult.player1.batting.hundreds}</td>
                        <td>{compareResult.player2.batting.fifties} / {compareResult.player2.batting.hundreds}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Sixes</td>
                        <td>{compareResult.player1.batting.sixes}</td>
                        <td>{compareResult.player2.batting.sixes}</td>
                      </tr>
                      {(compareResult.player1.bowling.overs > 0 || compareResult.player2.bowling.overs > 0) && (
                        <>
                          <tr style={{ borderTop: '1px solid var(--border-light)' }}>
                            <td colSpan="3" style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '20px', paddingBottom: '10px' }}>Bowling Metrics</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Wickets</td>
                            <td style={{ fontWeight: '700', color: 'var(--color-cyan)' }}>{compareResult.player1.bowling.wickets}</td>
                            <td style={{ fontWeight: '700', color: 'var(--color-pink)' }}>{compareResult.player2.bowling.wickets}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Economy</td>
                            <td>{compareResult.player1.bowling.economy || 'N/A'}</td>
                            <td>{compareResult.player2.bowling.economy || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Bowling Strike Rate</td>
                            <td>{compareResult.player1.bowling.strike_rate || 'N/A'}</td>
                            <td>{compareResult.player2.bowling.strike_rate || 'N/A'}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

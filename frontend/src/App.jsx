import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import PlayerAnalysis from './components/PlayerAnalysis';
import TeamComparison from './components/TeamComparison';
import VenueAnalysis from './components/VenueAnalysis';
import LeagueStats from './components/LeagueStats';
import UploadData from './components/UploadData';
import Matchups from './components/Matchups';
import MatchProgressionModal from './components/MatchProgressionModal';
import { 
  Trophy, 
  User, 
  Users, 
  MapPin, 
  UploadCloud, 
  LayoutDashboard,
  Award,
  Swords,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [progressionMatchId, setProgressionMatchId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'players', label: 'Players', icon: User },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'matchups', label: 'Matchups', icon: Swords },
    { id: 'caps', label: 'Cap leaderboards', icon: Award },
    { id: 'upload', label: 'Upload Live Data', icon: UploadCloud },
  ];

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div>
          {/* Logo / Header */}
          <div 
            className="sidebar-logo" 
            style={{ marginBottom: '30px', cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            <div className="logo-icon" style={{ background: '#2563eb' }}>
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="logo-text" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>cricAnalytics</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar for Mobile Nav */}
        <header className="mobile-header">
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            <Trophy className="w-5 h-5 text-cyan-400" />
            <span className="logo-text text-white">cricAnalytics</span>
          </div>
          
          <div style={{ width: '40px' }}></div> {/* Spacer to keep title centered */}
        </header>

        {/* Mobile Drawer Navigation overlay & drawer */}
        {isMobileMenuOpen && (
          <>
            <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="mobile-drawer">
              <div className="mobile-drawer-header">
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  onClick={handleLogoClick}
                >
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  <span className="logo-text text-white">cricAnalytics</span>
                </div>
                <button className="mobile-drawer-close" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mobile-drawer-nav">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`mobile-drawer-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* Content Container */}
        <main className="app-main-content">
          {activeTab === 'dashboard' && (
            <Dashboard onViewMatchProgression={(matchId) => setProgressionMatchId(matchId)} />
          )}
          {activeTab === 'players' && <PlayerAnalysis />}
          {activeTab === 'teams' && <TeamComparison />}
          {activeTab === 'venues' && <VenueAnalysis />}
          {activeTab === 'matchups' && <Matchups />}
          {activeTab === 'caps' && <LeagueStats />}
          {activeTab === 'upload' && <UploadData />}
        </main>
      </div>

      {/* Match Progression Modal Overlay */}
      {progressionMatchId !== null && (
        <MatchProgressionModal 
          matchId={progressionMatchId} 
          onClose={() => setProgressionMatchId(null)} 
        />
      )}

    </div>
  );
}

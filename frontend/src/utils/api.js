import axios from 'axios';

const API_BASE_URL = 'http://localhost:8005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getSeasons = () => api.get('/seasons/');
export const getTeams = () => api.get('/teams/');
export const getVenues = () => api.get('/venues/');
export const getPlayers = (params) => api.get('/players/', { params });

export const getPlayerDetail = (name, season) => {
  const params = season ? { season } : {};
  return api.get(`/players/${encodeURIComponent(name)}/`, { params });
};

export const comparePlayers = (p1, p2, season) => {
  const params = { p1, p2 };
  if (season) params.season = season;
  return api.get('/players/compare', { params });
};

export const getPlayerMatchup = (batter, bowler, season) => {
  const params = { batter, bowler };
  if (season) params.season = season;
  return api.get('/players/matchup/', { params });
};

export const compareTeams = (t1, t2, season) => {
  const params = { t1, t2 };
  if (season) params.season = season;
  return api.get('/teams/compare', { params });
};

export const getVenueDetail = (venueName) => api.get('/venues/detail', { params: { venue: venueName } });
export const getTossImpactSummary = () => api.get('/venues/toss-impact');

export const getLeagueStats = (season) => api.get('/league/season-stats', { params: { season } });

export const getMatches = (season, team) => {
  const params = {};
  if (season) params.season = season;
  if (team) params.team = team;
  return api.get('/matches/', { params });
};

export const getMatchDetail = (matchId) => api.get(`/matches/${matchId}/progression/`);

export const uploadMatchData = (infoFile, delivFile) => {
  const formData = new FormData();
  formData.append('info_file', infoFile);
  formData.append('deliv_file', delivFile);
  
  return api.post('/league/upload-match/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;

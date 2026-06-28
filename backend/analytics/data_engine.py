import pandas as pd
import numpy as np
import os

class CricketDataEngine:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.matches_path = os.path.join(self.backend_dir, "matches_compiled.csv")
        self.deliveries_path = os.path.join(self.backend_dir, "deliveries_compiled.csv")

        print("Loading cricket datasets into Pandas...")
        self.matches_df = pd.read_csv(self.matches_path)
        self.deliveries_df = pd.read_csv(self.deliveries_path)
        
        # Clean seasons to standard format (mapping dual-year names to match years)
        def map_season(s):
            s = str(s).strip()
            if s == '2007/08': return '2008'
            if s == '2009/10': return '2010'
            if s == '2020/21': return '2020'
            return s.split('/')[0]
            
        self.matches_df['season'] = self.matches_df['season'].apply(map_season)
        self.deliveries_df['season'] = self.deliveries_df['season'].apply(map_season)

        # Standardise venues to group spelling duplicates together
        def map_venue(v):
            if not isinstance(v, str): return v
            v = v.strip()
            v_lower = v.lower()
            if 'chinnaswamy' in v_lower: return 'M Chinnaswamy Stadium'
            if 'wankhede' in v_lower: return 'Wankhede Stadium'
            if 'eden gardens' in v_lower: return 'Eden Gardens'
            if 'rajiv gandhi' in v_lower: return 'Rajiv Gandhi International Stadium'
            if 'chidambaram' in v_lower or 'chepauk' in v_lower: return 'MA Chidambaram Stadium'
            if 'punjab cricket' in v_lower or 'is bindra' in v_lower or 'pca' in v_lower: return 'Punjab Cricket Association IS Bindra Stadium'
            if 'sawai mansingh' in v_lower: return 'Sawai Mansingh Stadium'
            if 'dy patil' in v_lower: return 'Dr DY Patil Sports Academy'
            if 'brabourne' in v_lower: return 'Brabourne Stadium'
            if 'maharashtra cricket' in v_lower or 'subrata roy' in v_lower: return 'Maharashtra Cricket Association Stadium'
            if 'arun jaitley' in v_lower or 'feroz shah' in v_lower: return 'Arun Jaitley Stadium'
            if 'ekana' in v_lower or 'vajpayee' in v_lower: return 'Ekana Cricket Stadium'
            if 'sheikh zayed' in v_lower or 'zayed cricket' in v_lower: return 'Sheikh Zayed Stadium'
            if 'narendra modi' in v_lower or 'motera' in v_lower: return 'Narendra Modi Stadium'
            if 'himachal pradesh' in v_lower: return 'Himachal Pradesh Cricket Association Stadium'
            if 'y.s. rajasekhara' in v_lower or 'aca-vdca' in v_lower: return 'Dr. Y.S. Rajasekhara Reddy Cricket Stadium'
            if 'yadavindra' in v_lower: return 'Maharaja Yadavindra Singh Stadium'
            if 'veer narayan' in v_lower: return 'Shaheed Veer Narayan Singh Stadium'
            return v

        self.matches_df['venue'] = self.matches_df['venue'].apply(map_venue)
        self.deliveries_df['venue'] = self.deliveries_df['venue'].apply(map_venue)

        # Standardise team names to merge Bangalore/Bengaluru and Rising Pune Supergiant variants
        def map_team(t):
            if not isinstance(t, str): return t
            t = t.strip()
            if t == 'Royal Challengers Bangalore':
                return 'Royal Challengers Bengaluru'
            if t == 'Rising Pune Supergiant':
                return 'Rising Pune Supergiants'
            return t

        self.matches_df['toss_winner'] = self.matches_df['toss_winner'].apply(map_team)
        self.matches_df['winner'] = self.matches_df['winner'].apply(map_team)
        self.matches_df['teams'] = self.matches_df['teams'].apply(lambda x: ",".join([map_team(ti) for ti in str(x).split(',')]) if pd.notna(x) else x)
        self.deliveries_df['batting_team'] = self.deliveries_df['batting_team'].apply(map_team)
        self.deliveries_df['bowling_team'] = self.deliveries_df['bowling_team'].apply(map_team)
        
        # Parse numeric columns
        self.deliveries_df['runs_off_bat'] = pd.to_numeric(self.deliveries_df['runs_off_bat'], errors='coerce').fillna(0).astype(int)
        self.deliveries_df['extras'] = pd.to_numeric(self.deliveries_df['extras'], errors='coerce').fillna(0).astype(int)
        self.deliveries_df['wides'] = pd.to_numeric(self.deliveries_df['wides'], errors='coerce').fillna(0)
        self.deliveries_df['noballs'] = pd.to_numeric(self.deliveries_df['noballs'], errors='coerce').fillna(0)
        self.deliveries_df['byes'] = pd.to_numeric(self.deliveries_df['byes'], errors='coerce').fillna(0)
        self.deliveries_df['legbyes'] = pd.to_numeric(self.deliveries_df['legbyes'], errors='coerce').fillna(0)
        
        # Bowler style database (heuristics for top bowlers)
        self.bowler_styles = self._load_bowler_styles()
        print(f"Data engine ready. Matches: {len(self.matches_df)}, Deliveries: {len(self.deliveries_df)}")

    def reload(self):
        print("Reloading datasets...")
        self.matches_df = pd.read_csv(self.matches_path)
        self.deliveries_df = pd.read_csv(self.deliveries_path)
        
        def map_season(s):
            s = str(s).strip()
            if s == '2007/08': return '2008'
            if s == '2009/10': return '2010'
            if s == '2020/21': return '2020'
            return s.split('/')[0]
            
        self.matches_df['season'] = self.matches_df['season'].apply(map_season)
        self.deliveries_df['season'] = self.deliveries_df['season'].apply(map_season)

        def map_venue(v):
            if not isinstance(v, str): return v
            v = v.strip()
            v_lower = v.lower()
            if 'chinnaswamy' in v_lower: return 'M Chinnaswamy Stadium'
            if 'wankhede' in v_lower: return 'Wankhede Stadium'
            if 'eden gardens' in v_lower: return 'Eden Gardens'
            if 'rajiv gandhi' in v_lower: return 'Rajiv Gandhi International Stadium'
            if 'chidambaram' in v_lower or 'chepauk' in v_lower: return 'MA Chidambaram Stadium'
            if 'punjab cricket' in v_lower or 'is bindra' in v_lower or 'pca' in v_lower: return 'Punjab Cricket Association IS Bindra Stadium'
            if 'sawai mansingh' in v_lower: return 'Sawai Mansingh Stadium'
            if 'dy patil' in v_lower: return 'Dr DY Patil Sports Academy'
            if 'brabourne' in v_lower: return 'Brabourne Stadium'
            if 'maharashtra cricket' in v_lower or 'subrata roy' in v_lower: return 'Maharashtra Cricket Association Stadium'
            if 'arun jaitley' in v_lower or 'feroz shah' in v_lower: return 'Arun Jaitley Stadium'
            if 'ekana' in v_lower or 'vajpayee' in v_lower: return 'Ekana Cricket Stadium'
            if 'sheikh zayed' in v_lower or 'zayed cricket' in v_lower: return 'Sheikh Zayed Stadium'
            if 'narendra modi' in v_lower or 'motera' in v_lower: return 'Narendra Modi Stadium'
            if 'himachal pradesh' in v_lower: return 'Himachal Pradesh Cricket Association Stadium'
            if 'y.s. rajasekhara' in v_lower or 'aca-vdca' in v_lower: return 'Dr. Y.S. Rajasekhara Reddy Cricket Stadium'
            if 'yadavindra' in v_lower: return 'Maharaja Yadavindra Singh Stadium'
            if 'veer narayan' in v_lower: return 'Shaheed Veer Narayan Singh Stadium'
            return v

        self.matches_df['venue'] = self.matches_df['venue'].apply(map_venue)
        self.deliveries_df['venue'] = self.deliveries_df['venue'].apply(map_venue)

        # Standardise team names to merge Bangalore/Bengaluru and Rising Pune Supergiant variants
        def map_team(t):
            if not isinstance(t, str): return t
            t = t.strip()
            if t == 'Royal Challengers Bangalore':
                return 'Royal Challengers Bengaluru'
            if t == 'Rising Pune Supergiant':
                return 'Rising Pune Supergiants'
            return t

        self.matches_df['toss_winner'] = self.matches_df['toss_winner'].apply(map_team)
        self.matches_df['winner'] = self.matches_df['winner'].apply(map_team)
        self.matches_df['teams'] = self.matches_df['teams'].apply(lambda x: ",".join([map_team(ti) for ti in str(x).split(',')]) if pd.notna(x) else x)
        self.deliveries_df['batting_team'] = self.deliveries_df['batting_team'].apply(map_team)
        self.deliveries_df['bowling_team'] = self.deliveries_df['bowling_team'].apply(map_team)
        
        self.deliveries_df['runs_off_bat'] = pd.to_numeric(self.deliveries_df['runs_off_bat'], errors='coerce').fillna(0).astype(int)
        self.deliveries_df['extras'] = pd.to_numeric(self.deliveries_df['extras'], errors='coerce').fillna(0).astype(int)
        self.deliveries_df['wides'] = pd.to_numeric(self.deliveries_df['wides'], errors='coerce').fillna(0)
        self.deliveries_df['noballs'] = pd.to_numeric(self.deliveries_df['noballs'], errors='coerce').fillna(0)
        self.deliveries_df['byes'] = pd.to_numeric(self.deliveries_df['byes'], errors='coerce').fillna(0)
        self.deliveries_df['legbyes'] = pd.to_numeric(self.deliveries_df['legbyes'], errors='coerce').fillna(0)

    def _load_bowler_styles(self):
        # A dictionary mapping popular IPL bowlers to Spin or Pace
        # Any bowler not in this dict can be classified using standard heuristics (defaulting to Pace/Medium)
        spin_bowlers = {
            # Top Spinners
            'YS Chahal', 'A Mishra', 'PP Chawla', 'R Ashwin', 'SP Narine', 'Harbhajan Singh', 
            'Rashid Khan', 'RA Jadeja', 'Amit Mishra', 'Piyush Chawla', 'Ravichandran Ashwin', 
            'Sunil Narine', 'Kuldeep Yadav', 'Krunal Pandya', 'Yuzvendra Chahal', 'Mujeeb Ur Rahman',
            'Axar Patel', 'K Gowtham', 'Shakib Al Hasan', 'DJ Hooda', 'M Ashwin', 'Murugan Ashwin',
            'Washington Sundar', 'Washington Sundar', 'GJ Maxwell', 'Imran Tahir', 'Ravi Bishnoi',
            'Shahbaz Ahmed', 'Varun Chakravarthy', 'V Chakravarthy', 'Lalit Yadav', 'Mujeeb Ur Rahman',
            'Maheesh Theekshana', 'M Theekshana', 'KC Cariappa', 'Mohammad Nabi', 'Sandeep Lamichhane',
            'R Tewatia', 'Rahul Tewatia', 'Karn Sharma', 'Praveen Tambe', 'PV Tambe', 'Iqbal Abdulla',
            'S Nadeem', 'Shahbaz Nadeem', 'Karan Sharma', 'Swapnil Singh', 'RD Chahar', 'Rahul Chahar',
            'Mayank Markande', 'M Markande', 'Harpreet Brar', 'Krunal Pandya', 'KH Pandya', 'J Suchith',
            'Noor Ahmad', 'Noor Ahmad', 'Suyash Sharma', 'Adam Zampa', 'A Zampa', 'Adil Rashid',
            'Tabraiz Shamsi', 'Mujeeb Zadran', 'Wanindu Hasaranga', 'W Hasaranga', 'Sikandar Raza'
        }
        
        pace_bowlers = {
            # Top Pacers
            'SL Malinga', 'Lasith Malinga', 'DJ Bravo', 'Dwayne Bravo', 'B Kumar', 'Bhuvneshwar Kumar',
            'SP Bumrah', 'Jasprit Bumrah', 'UT Yadav', 'Umesh Yadav', 'Mohammed Shami', 'M Shami',
            'Sandeep Sharma', 'S Sharma', 'Z Khan', 'Zaheer Khan', 'A Nehra', 'Ashish Nehra',
            'JD Unadkat', 'Jaydev Unadkat', 'Harshal Patel', 'HV Patel', 'Mohammed Siraj', 'M Siraj',
            'AR Patel', 'Axar Patel', 'TA Boult', 'Trent Boult', 'K Rabada', 'Kagiso Rabada',
            'Mustafizur Rahman', 'M Rahman', 'Arshdeep Singh', 'A Singh', 'Shardul Thakur', 'S Thakur',
            'Deepak Chahar', 'DL Chahar', 'KK Ahmed', 'Khaleel Ahmed', 'T Natarajan', 'Mohit Sharma',
            'MM Sharma', 'Praveen Kumar', 'P Kumar', 'RP Singh', 'Rudra Pratap Singh', 'Avesh Khan',
            'I Sharma', 'Ishant Sharma', 'MM Patel', 'Munaf Patel', 'M Prasidh Krishna', 'Prasidh Krishna',
            'LH Ferguson', 'Lockie Ferguson', 'Alzarri Joseph', 'A Joseph', 'Marco Jansen', 'M Jansen',
            'Umran Malik', 'Navdeep Saini', 'N Saini', 'Daniel Sams', 'DR Sams', 'Nathan Coulter-Nile',
            'N Coulter-Nile', 'Chris Morris', 'CH Morris', 'Jofra Archer', 'JC Archer', 'Pat Cummins',
            'PJ Cummins', 'Mitchell Starc', 'MA Starc', 'Josh Hazlewood', 'JR Hazlewood', 'Anrich Nortje',
            'A Nortje', 'Lungi Ngidi', 'L Ngidi', 'Kuldip Yadav', 'Mukesh Kumar', 'Akash Madhwal',
            'Tushar Deshpande', 'T Deshpande', 'Matheesha Pathirana', 'M Pathirana', 'Mohit Rathee'
        }
        
        styles = {}
        for b in spin_bowlers:
            styles[b] = "Spin"
        for b in pace_bowlers:
            styles[b] = "Pace"
        return styles

    def get_bowler_type(self, bowler_name):
        return self.bowler_styles.get(bowler_name, "Pace")  # Default to Pace if unknown

    def get_unique_players(self, team=None, season=None):
        df = self.deliveries_df
        if season:
            df = df[df['season'] == str(season)]
        
        if team:
            strikers = df[df['batting_team'] == team]['striker'].unique()
            bowlers = df[df['bowling_team'] == team]['bowler'].unique()
        else:
            strikers = df['striker'].unique()
            bowlers = df['bowler'].unique()
            
        players = sorted(list(set(strikers) | set(bowlers)))
        return players

    def get_unique_teams(self):
        return sorted(list(self.matches_df['teams'].str.split(',').explode().unique()))

    def get_unique_venues(self):
        return sorted(list(self.matches_df['venue'].dropna().unique()))

    def get_unique_seasons(self):
        return sorted(list(self.matches_df['season'].dropna().unique()), reverse=True)

    def get_player_stats(self, player_name, season=None):
        # Filter deliveries
        deliv = self.deliveries_df
        if season:
            deliv = deliv[deliv['season'] == str(season)]
            
        # Batting stats
        bat_df = deliv[deliv['striker'] == player_name]
        bat_matches = bat_df['match_id'].nunique()
        
        runs = int(bat_df['runs_off_bat'].sum())
        # Balls faced excludes wides
        balls_faced = int(bat_df[bat_df['wides'] == 0].shape[0])
        
        # Wickets/Dismissals: count rows where player was dismissed
        dismissals = int(deliv[deliv['player_dismissed'] == player_name].shape[0])
        
        strike_rate = round((runs / balls_faced * 100), 2) if balls_faced > 0 else 0.0
        average = round((runs / dismissals), 2) if dismissals > 0 else (runs if balls_faced > 0 else 0.0)
        
        fours = int((bat_df['runs_off_bat'] == 4).sum())
        sixes = int((bat_df['runs_off_bat'] == 6).sum())
        
        # Scores per innings
        scores = bat_df.groupby('match_id')['runs_off_bat'].sum()
        highest_score = int(scores.max()) if not scores.empty else 0
        hundreds = int((scores >= 100).sum())
        fifties = int(((scores >= 50) & (scores < 100)).sum())
        ducks = int(((scores == 0) & (bat_df.groupby('match_id')['player_dismissed'].apply(lambda x: (x == player_name).any()))).sum())

        # Bowling stats
        bowl_df = deliv[deliv['bowler'] == player_name]
        bowl_matches = bowl_df['match_id'].nunique()
        
        # Balls bowled excludes wides & noballs for over calculations
        balls_bowled = int(bowl_df[(bowl_df['wides'] == 0) & (bowl_df['noballs'] == 0)].shape[0])
        overs = round(balls_bowled / 6, 1)
        
        # Runs conceded charges batsman runs + wides + noballs
        runs_conceded = int(bowl_df['runs_off_bat'].sum() + bowl_df['wides'].sum() + bowl_df['noballs'].sum())
        
        # Wickets: caught, bowled, lbw, stumped, caught and bowled, hit wicket
        valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket']
        wickets = int(bowl_df[bowl_df['wicket_type'].isin(valid_wickets)].shape[0])
        
        economy = round((runs_conceded / (balls_bowled / 6)), 2) if balls_bowled > 0 else 0.0
        bowling_strike_rate = round((balls_bowled / wickets), 2) if wickets > 0 else 0.0
        bowling_average = round((runs_conceded / wickets), 2) if wickets > 0 else 0.0
        
        # Bowling figures per match
        match_wickets = bowl_df[bowl_df['wicket_type'].isin(valid_wickets)].groupby('match_id').size()
        
        # Calculate runs conceded per delivery to avoid groupby.apply issues
        runs_conceded_delivery = bowl_df['runs_off_bat'] + bowl_df['wides'] + bowl_df['noballs']
        match_runs = runs_conceded_delivery.groupby(bowl_df['match_id']).sum()
        
        figures_df = pd.DataFrame({'wickets': match_wickets, 'runs': match_runs})
        figures_df['wickets'] = figures_df['wickets'].fillna(0).astype(int)
        figures_df['runs'] = figures_df['runs'].fillna(0).astype(int)
        
        four_w = int((figures_df['wickets'] == 4).sum())
        five_w = int((figures_df['wickets'] >= 5).sum())
        
        best_bowling = "N/A"
        if not figures_df.empty:
            best_row = figures_df.sort_values(by=['wickets', 'runs'], ascending=[False, True]).iloc[0]
            best_bowling = f"{int(best_row['wickets'])}/{int(best_row['runs'])}"

        # Player Teams
        player_teams = list(set(bat_df['batting_team'].unique()) | set(bowl_df['bowling_team'].unique()))

        # Phase analysis
        pp_bat = self._get_batting_phase_stats(bat_df, deliv, player_name, 0.0, 6.0)
        mid_bat = self._get_batting_phase_stats(bat_df, deliv, player_name, 6.0, 15.0)
        death_bat = self._get_batting_phase_stats(bat_df, deliv, player_name, 15.0, 100.0)
        
        pp_bowl = self._get_bowling_phase_stats(bowl_df, player_name, 0.0, 6.0)
        mid_bowl = self._get_bowling_phase_stats(bowl_df, player_name, 6.0, 15.0)
        death_bowl = self._get_bowling_phase_stats(bowl_df, player_name, 15.0, 100.0)

        return {
            'player_name': player_name,
            'teams': player_teams,
            'batting': {
                'matches': bat_matches,
                'runs': runs,
                'balls_faced': balls_faced,
                'strike_rate': strike_rate,
                'average': average,
                'fours': fours,
                'sixes': sixes,
                'highest_score': highest_score,
                'hundreds': hundreds,
                'fifties': fifties,
                'ducks': ducks
            },
            'bowling': {
                'matches': bowl_matches,
                'overs': overs,
                'runs_conceded': runs_conceded,
                'wickets': wickets,
                'economy': economy,
                'strike_rate': bowling_strike_rate,
                'average': bowling_average,
                'four_w': four_w,
                'five_w': five_w,
                'best_bowling': best_bowling
            },
            'phases': {
                'batting': {
                    'powerplay': pp_bat,
                    'middle': mid_bat,
                    'death': death_bat
                },
                'bowling': {
                    'powerplay': pp_bowl,
                    'middle': mid_bowl,
                    'death': death_bowl
                }
            }
        }

    def _get_batting_phase_stats(self, bat_df, deliv, player_name, min_ball, max_ball):
        phase_df = bat_df[(bat_df['ball'] >= min_ball) & (bat_df['ball'] < max_ball)]
        runs = int(phase_df['runs_off_bat'].sum())
        balls = int(phase_df[phase_df['wides'] == 0].shape[0])
        dismissals = int(deliv[
            (deliv['player_dismissed'] == player_name) & 
            (deliv['ball'] >= min_ball) & 
            (deliv['ball'] < max_ball)
        ].shape[0])
        
        strike_rate = round((runs / balls * 100), 2) if balls > 0 else 0.0
        average = round((runs / dismissals), 2) if dismissals > 0 else (runs if balls > 0 else 0.0)
        
        return {
            'runs': runs,
            'balls': balls,
            'dismissals': dismissals,
            'strike_rate': strike_rate,
            'average': average
        }

    def _get_bowling_phase_stats(self, bowl_df, player_name, min_ball, max_ball):
        phase_df = bowl_df[(bowl_df['ball'] >= min_ball) & (bowl_df['ball'] < max_ball)]
        balls = int(phase_df[(phase_df['wides'] == 0) & (phase_df['noballs'] == 0)].shape[0])
        overs = round(balls / 6, 1)
        runs = int(phase_df['runs_off_bat'].sum() + phase_df['wides'].sum() + phase_df['noballs'].sum())
        
        valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket']
        wickets = int(phase_df[phase_df['wicket_type'].isin(valid_wickets)].shape[0])
        
        economy = round((runs / (balls / 6)), 2) if balls > 0 else 0.0
        strike_rate = round((balls / wickets), 2) if wickets > 0 else 0.0
        
        return {
            'overs': overs,
            'runs': runs,
            'wickets': wickets,
            'economy': economy,
            'strike_rate': strike_rate
        }

    def compare_players(self, player1, player2, season=None):
        stats1 = self.get_player_stats(player1, season)
        stats2 = self.get_player_stats(player2, season)
        return {
            'player1': stats1,
            'player2': stats2
        }

    def get_matchup_stats(self, batter, bowler, season=None):
        deliv = self.deliveries_df
        if season:
            deliv = deliv[deliv['season'] == str(season)]
            
        df = deliv[(deliv['striker'] == batter) & (deliv['bowler'] == bowler)]
        if df.empty:
            return {
                'batter': batter,
                'bowler': bowler,
                'runs': 0,
                'balls': 0,
                'strike_rate': 0.0,
                'dismissals': 0,
                'dots': 0,
                'dot_pct': 0.0,
                'fours': 0,
                'sixes': 0
            }
            
        runs = int(df['runs_off_bat'].sum())
        balls_df = df[df['wides'] == 0]
        balls = len(balls_df)
        
        strike_rate = round((runs / balls * 100), 2) if balls > 0 else 0.0
        
        valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket']
        dismissals = int(df[(df['player_dismissed'] == batter) & (df['wicket_type'].isin(valid_wickets))].shape[0])
        
        dots = int(df[(df['runs_off_bat'] == 0) & (df['wides'] == 0) & (df['noballs'] == 0)].shape[0])
        dot_pct = round((dots / balls * 100), 2) if balls > 0 else 0.0
        
        fours = int((df['runs_off_bat'] == 4).sum())
        sixes = int((df['runs_off_bat'] == 6).sum())
        
        return {
            'batter': batter,
            'bowler': bowler,
            'runs': runs,
            'balls': balls,
            'strike_rate': strike_rate,
            'dismissals': dismissals,
            'dots': dots,
            'dot_pct': dot_pct,
            'fours': fours,
            'sixes': sixes
        }

    def compare_teams(self, team1, team2, season=None):
        matches = self.matches_df
        if season:
            matches = matches[matches['season'] == str(season)]
            
        # Head to Head matches
        h2h_matches = matches[
            (matches['teams'].str.contains(team1)) & (matches['teams'].str.contains(team2))
        ]
        
        total_played = h2h_matches.shape[0]
        team1_wins = h2h_matches[h2h_matches['winner'] == team1].shape[0]
        team2_wins = h2h_matches[h2h_matches['winner'] == team2].shape[0]
        no_result = total_played - team1_wins - team2_wins

        # Get delivery-level metrics for matches between these teams
        h2h_ids = h2h_matches['match_id'].unique()
        deliv = self.deliveries_df[self.deliveries_df['match_id'].isin(h2h_ids)]
        
        # Team 1 scoring stats
        t1_deliv = deliv[deliv['batting_team'] == team1]
        t1_runs = int(t1_deliv['runs_off_bat'].sum() + t1_deliv['extras'].sum())
        t1_matches_bat = t1_deliv['match_id'].nunique()
        t1_avg_score = round(t1_runs / t1_matches_bat, 1) if t1_matches_bat > 0 else 0.0
        t1_fours = int((t1_deliv['runs_off_bat'] == 4).sum())
        t1_sixes = int((t1_deliv['runs_off_bat'] == 6).sum())
        
        # Team 2 scoring stats
        t2_deliv = deliv[deliv['batting_team'] == team2]
        t2_runs = int(t2_deliv['runs_off_bat'].sum() + t2_deliv['extras'].sum())
        t2_matches_bat = t2_deliv['match_id'].nunique()
        t2_avg_score = round(t2_runs / t2_matches_bat, 1) if t2_matches_bat > 0 else 0.0
        t2_fours = int((t2_deliv['runs_off_bat'] == 4).sum())
        t2_sixes = int((t2_deliv['runs_off_bat'] == 6).sum())

        # Overall Team Averages (against all opponents)
        all_deliv = self.deliveries_df
        if season:
            all_deliv = all_deliv[all_deliv['season'] == str(season)]
            
        def get_team_overall_stats(team_name):
            t_df = all_deliv[all_deliv['batting_team'] == team_name]
            t_runs = int(t_df['runs_off_bat'].sum() + t_df['extras'].sum())
            t_matches = t_df['match_id'].nunique()
            t_avg = round(t_runs / t_matches, 1) if t_matches > 0 else 0.0
            
            # Phase runs & wickets
            # Powerplay: balls 0.1 to 5.6
            pp = t_df[t_df['ball'] < 6.0]
            pp_runs = int(pp['runs_off_bat'].sum() + pp['extras'].sum())
            pp_balls = pp[(pp['wides'] == 0) & (pp['noballs'] == 0)].shape[0]
            pp_rr = round((pp_runs / pp_balls * 6), 2) if pp_balls > 0 else 0.0
            
            # Death overs: balls 15.1 to 19.6
            death = t_df[t_df['ball'] >= 15.0]
            death_runs = int(death['runs_off_bat'].sum() + death['extras'].sum())
            death_balls = death[(death['wides'] == 0) & (death['noballs'] == 0)].shape[0]
            death_rr = round((death_runs / death_balls * 6), 2) if death_balls > 0 else 0.0
            
            return {'avg_score': t_avg, 'powerplay_rr': pp_rr, 'death_rr': death_rr}

        team1_overall = get_team_overall_stats(team1)
        team2_overall = get_team_overall_stats(team2)

        return {
            'head_to_head': {
                'played': total_played,
                'team1_wins': team1_wins,
                'team2_wins': team2_wins,
                'no_result': no_result
            },
            'head_to_head_stats': {
                'team1': {
                    'avg_score': t1_avg_score,
                    'fours': t1_fours,
                    'sixes': t1_sixes
                },
                'team2': {
                    'avg_score': t2_avg_score,
                    'fours': t2_fours,
                    'sixes': t2_sixes
                }
            },
            'overall_comparison': {
                'team1': team1_overall,
                'team2': team2_overall
            }
        }

    def get_venue_stats(self, venue_name):
        matches = self.matches_df[self.matches_df['venue'] == venue_name]
        total_matches = matches.shape[0]
        
        if total_matches == 0:
            return {}

        # First vs Second Innings Average
        match_ids = matches['match_id'].unique()
        deliv = self.deliveries_df[self.deliveries_df['match_id'].isin(match_ids)]
        
        # Innings 1
        inn1 = deliv[deliv['innings'] == 1]
        inn1_matches = inn1['match_id'].nunique()
        inn1_total = inn1['runs_off_bat'].sum() + inn1['extras'].sum()
        inn1_avg = round(inn1_total / inn1_matches, 1) if inn1_matches > 0 else 0.0
        
        # Innings 2
        inn2 = deliv[deliv['innings'] == 2]
        inn2_matches = inn2['match_id'].nunique()
        inn2_total = inn2['runs_off_bat'].sum() + inn2['extras'].sum()
        inn2_avg = round(inn2_total / inn2_matches, 1) if inn2_matches > 0 else 0.0

        # Toss Impact
        toss_winner_match_winner = matches[matches['toss_winner'] == matches['winner']].shape[0]
        toss_impact_pct = round(toss_winner_match_winner / total_matches * 100, 1) if total_matches > 0 else 0.0
        
        # Decision Success
        bat_first_wins = matches[
            ((matches['toss_winner'] == matches['winner']) & (matches['toss_decision'] == 'bat')) |
            ((matches['toss_winner'] != matches['winner']) & (matches['toss_decision'] == 'field'))
        ].shape[0]
        
        field_first_wins = total_matches - bat_first_wins
        
        # Pace vs Spin on this venue
        valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket']
        wickets_df = deliv[deliv['wicket_type'].isin(valid_wickets)].copy()
        
        wickets_df['bowler_type'] = wickets_df['bowler'].apply(self.get_bowler_type)
        pace_w = int((wickets_df['bowler_type'] == "Pace").sum())
        spin_w = int((wickets_df['bowler_type'] == "Spin").sum())
        
        # Top 5 run scorers and top 5 wicket takers at this venue
        top_batters = deliv.groupby('striker')['runs_off_bat'].sum().sort_values(ascending=False).head(5)
        top_batters = [{'name': name, 'runs': int(val)} for name, val in top_batters.items()]
        
        top_bowlers = deliv[deliv['wicket_type'].isin(valid_wickets)].groupby('bowler').size().sort_values(ascending=False).head(5)
        top_bowlers = [{'name': name, 'wickets': int(val)} for name, val in top_bowlers.items()]

        return {
            'venue_name': venue_name,
            'total_matches': total_matches,
            'avg_first_innings': inn1_avg,
            'avg_second_innings': inn2_avg,
            'toss_impact': {
                'toss_winner_win_pct': toss_impact_pct,
                'bat_first_wins': bat_first_wins,
                'field_first_wins': field_first_wins
            },
            'bowling_split': {
                'pace_wickets': pace_w,
                'spin_wickets': spin_w
            },
            'top_batters': top_batters,
            'top_bowlers': top_bowlers
        }

    def get_toss_impact_overall(self):
        matches = self.matches_df
        total_matches = matches.shape[0]
        
        toss_winner_wins = matches[matches['toss_winner'] == matches['winner']].shape[0]
        toss_winner_win_pct = round(toss_winner_wins / total_matches * 100, 2)
        
        decision_count = matches['toss_decision'].value_counts()
        bat_decisions = int(decision_count.get('bat', 0))
        field_decisions = int(decision_count.get('field', 0))
        
        bat_wins = matches[(matches['toss_decision'] == 'bat') & (matches['toss_winner'] == matches['winner'])].shape[0]
        field_wins = matches[(matches['toss_decision'] == 'field') & (matches['toss_winner'] == matches['winner'])].shape[0]
        
        bat_win_pct = round(bat_wins / bat_decisions * 100, 2) if bat_decisions > 0 else 0.0
        field_win_pct = round(field_wins / field_decisions * 100, 2) if field_decisions > 0 else 0.0
        
        return {
            'total_matches': total_matches,
            'toss_winner_wins': toss_winner_wins,
            'toss_winner_win_pct': toss_winner_win_pct,
            'decisions': {
                'bat': bat_decisions,
                'field': field_decisions,
                'bat_win_pct': bat_win_pct,
                'field_win_pct': field_win_pct
            }
        }

    def get_orange_purple_cap(self, season):
        deliv = self.deliveries_df[self.deliveries_df['season'] == str(season)]
        
        # Orange Cap
        orange = deliv.groupby('striker')['runs_off_bat'].sum().sort_values(ascending=False).head(10)
        orange_list = []
        for name, runs in orange.items():
            bat_df = deliv[deliv['striker'] == name]
            balls = int(bat_df[bat_df['wides'] == 0].shape[0])
            sr = round((runs / balls * 100), 2) if balls > 0 else 0.0
            orange_list.append({'player': name, 'runs': int(runs), 'balls': balls, 'strike_rate': sr})
            
        # Purple Cap
        valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket']
        purple = deliv[deliv['wicket_type'].isin(valid_wickets)].groupby('bowler').size().sort_values(ascending=False).head(10)
        purple_list = []
        for name, wickets in purple.items():
            bowl_df = deliv[deliv['bowler'] == name]
            balls = int(bowl_df[(bowl_df['wides'] == 0) & (bowl_df['noballs'] == 0)].shape[0])
            runs = int(bowl_df['runs_off_bat'].sum() + bowl_df['wides'].sum() + bowl_df['noballs'].sum())
            econ = round((runs / (balls / 6)), 2) if balls > 0 else 0.0
            purple_list.append({'player': name, 'wickets': int(wickets), 'economy': econ})
            
        return {
            'orange_cap': orange_list,
            'purple_cap': purple_list
        }

    def get_run_rate_progression(self, match_id):
        deliv = self.deliveries_df[self.deliveries_df['match_id'].astype(str) == str(match_id)].copy()
        
        if deliv.empty:
            return {}
            
        # Sort deliveries
        deliv = deliv.sort_values(by=['innings', 'ball'])
        
        # Helper to compute cumulative metrics over overs
        def compute_progression(inn_df):
            inn_df = inn_df.copy()
            # Calculate total runs (bat + extras) per ball
            inn_df['runs'] = inn_df['runs_off_bat'] + inn_df['extras']
            
            # Cumulative runs
            inn_df['cum_runs'] = inn_df['runs'].cumsum()
            
            # Wickets cumulative
            valid_wickets = ['caught', 'bowled', 'lbw', 'stumped', 'caught and bowled', 'hit wicket', 'run out']
            inn_df['is_wicket'] = inn_df['wicket_type'].isin(valid_wickets).astype(int)
            inn_df['cum_wickets'] = inn_df['is_wicket'].cumsum()
            
            # Extract overs (rounded or floor)
            inn_df['over_num'] = inn_df['ball'].apply(lambda x: int(float(x)))
            
            # Group by over to see progress
            over_progress = inn_df.groupby('over_num').agg({
                'cum_runs': 'last',
                'cum_wickets': 'last'
            }).reset_index()
            
            # Fill missing overs up to 19 (overs 0-19)
            over_progress = over_progress.set_index('over_num').reindex(range(20)).ffill().fillna(0).reset_index()
            
            # Run rate for each over
            over_progress['runs_in_over'] = over_progress['cum_runs'].diff().fillna(over_progress['cum_runs'].iloc[0])
            over_progress['run_rate'] = over_progress['runs_in_over']
            
            return over_progress.to_dict(orient='records')
            
        inn1 = deliv[deliv['innings'] == 1]
        inn2 = deliv[deliv['innings'] == 2]
        
        prog1 = compute_progression(inn1) if not inn1.empty else []
        prog2 = compute_progression(inn2) if not inn2.empty else []
        
        t1_name = inn1['batting_team'].iloc[0] if not inn1.empty else "Innings 1"
        t2_name = inn2['batting_team'].iloc[0] if not inn2.empty else "Innings 2"
        
        return {
            'match_id': match_id,
            'team1': t1_name,
            'team2': t2_name,
            'innings1': prog1,
            'innings2': prog2
        }

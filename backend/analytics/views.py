import os
import tempfile
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .data_engine import CricketDataEngine
from .charts import (
    generate_player_comparison_chart,
    generate_venue_split_chart,
    generate_match_progression_chart,
    generate_toss_impact_chart
)

# Initialize the data engine once
engine = CricketDataEngine.get_instance()

@api_view(['GET'])
def get_seasons(request):
    seasons = engine.get_unique_seasons()
    return Response({'seasons': seasons})

@api_view(['GET'])
def get_teams(request):
    teams = engine.get_unique_teams()
    return Response({'teams': teams})

@api_view(['GET'])
def get_venues(request):
    venues = engine.get_unique_venues()
    return Response({'venues': venues})

@api_view(['GET'])
def get_players(request):
    team = request.GET.get('team')
    season = request.GET.get('season')
    players = engine.get_unique_players(team=team, season=season)
    return Response({'players': players})

@api_view(['GET'])
def get_player_detail(request, name):
    season = request.GET.get('season')
    try:
        stats = engine.get_player_stats(name, season=season)
        return Response(stats)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def compare_players_view(request):
    p1 = request.GET.get('p1')
    p2 = request.GET.get('p2')
    season = request.GET.get('season')
    
    if not p1 or not p2:
        return Response({'error': 'Parameters p1 and p2 are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        comparison_stats = engine.compare_players(p1, p2, season=season)
        
        # Generate chart
        chart_b64 = generate_player_comparison_chart(
            p1, comparison_stats['player1']['batting'],
            p2, comparison_stats['player2']['batting']
        )
        comparison_stats['chart'] = chart_b64
        
        return Response(comparison_stats)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_matchup_view(request):
    batter = request.GET.get('batter')
    bowler = request.GET.get('bowler')
    season = request.GET.get('season')
    
    if not batter or not bowler:
        return Response({'error': 'Parameters batter and bowler are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        matchup = engine.get_matchup_stats(batter, bowler, season=season)
        return Response(matchup)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def compare_teams_view(request):
    t1 = request.GET.get('t1')
    t2 = request.GET.get('t2')
    season = request.GET.get('season')
    
    if not t1 or not t2:
        return Response({'error': 'Parameters t1 and t2 are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        comparison = engine.compare_teams(t1, t2, season=season)
        return Response(comparison)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_venue_detail(request):
    venue_name = request.GET.get('venue')
    if not venue_name:
        return Response({'error': 'Venue parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        stats = engine.get_venue_stats(venue_name)
        if not stats:
            return Response({'error': 'Venue not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Generate charts
        pace_w = stats['bowling_split']['pace_wickets']
        spin_w = stats['bowling_split']['spin_wickets']
        stats['pie_chart'] = generate_venue_split_chart(venue_name, pace_w, spin_w)
        
        stats['bar_chart'] = generate_toss_impact_chart(stats['toss_impact'])
        
        return Response(stats)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_toss_impact_summary(request):
    try:
        summary = engine.get_toss_impact_overall()
        return Response(summary)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_league_stats(request):
    season = request.GET.get('season')
    if not season:
        return Response({'error': 'Season parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        stats = engine.get_orange_purple_cap(season)
        return Response(stats)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_matches(request):
    season = request.GET.get('season')
    team = request.GET.get('team')
    
    matches = engine.matches_df
    if season:
        matches = matches[matches['season'] == str(season)]
    if team:
        matches = matches[matches['teams'].str.contains(team, na=False)]
        
    matches_list = matches[['match_id', 'season', 'date', 'venue', 'teams', 'winner', 'outcome']].fillna('').to_dict(orient='records')
    return Response({'matches': matches_list})

@api_view(['GET'])
def get_match_detail(request, match_id):
    try:
        prog_data = engine.get_run_rate_progression(match_id)
        if not prog_data:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)
            
        prog_data['chart'] = generate_match_progression_chart(prog_data)
        
        # Add basic info from matches list
        match_info = engine.matches_df[engine.matches_df['match_id'].astype(str) == str(match_id)].fillna('').iloc[0].to_dict()
        prog_data['info'] = match_info
        
        return Response(prog_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def upload_match_data(request):
    info_file = request.FILES.get('info_file')
    deliv_file = request.FILES.get('deliv_file')
    
    if not info_file or not deliv_file:
        return Response({'error': 'Both info_file and deliv_file are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        # 1. Parse uploaded info file to dictionary
        info_lines = info_file.read().decode('utf-8').splitlines()
        
        # Read match_id and convert info key-values
        match_id = None
        info_dict = {}
        teams = []
        players = []
        umpires = []
        
        for line in info_lines:
            parts = line.strip().split(',', 2)
            if len(parts) >= 3 and parts[0] == 'info':
                key = parts[1]
                val = parts[2].strip('"')
                if key == 'match_id':
                    match_id = val
                elif key == 'team':
                    teams.append(val)
                elif key == 'player':
                    players.append(val)
                elif key == 'umpire':
                    umpires.append(val)
                else:
                    info_dict[key] = val
                    
        if not match_id:
            # Fallback to file name if match_id isn't in file lines
            match_id = info_file.name.replace("_info.csv", "")
            
        info_dict['match_id'] = int(match_id)
        info_dict['teams'] = ",".join(teams)
        info_dict['player'] = ",".join(players)
        info_dict['umpire'] = ",".join(umpires)
        
        # Convert to single-row dataframe matching matches_df columns
        new_match_df = pd.DataFrame([info_dict])
        
        # Reorder to match compiled matches columns
        matches_df_cols = engine.matches_df.columns.tolist()
        # Add columns if they do not exist
        for col in matches_df_cols:
            if col not in new_match_df.columns:
                new_match_df[col] = None
        new_match_df = new_match_df[matches_df_cols]
        
        # 2. Parse deliveries file
        new_deliv_df = pd.read_csv(deliv_file)
        # Add match_id if not present
        if 'match_id' not in new_deliv_df.columns:
            new_deliv_df['match_id'] = int(match_id)
            
        # 3. Save files by appending
        # Read full files, append, and save
        m_df = pd.read_csv(engine.matches_path)
        d_df = pd.read_csv(engine.deliveries_path)
        
        # Check if match_id already exists to prevent duplicate uploads
        if int(match_id) in m_df['match_id'].values:
            return Response({'error': f'Match with ID {match_id} already exists in database'}, status=status.HTTP_400_BAD_REQUEST)
            
        m_df = pd.concat([m_df, new_match_df], ignore_index=True)
        d_df = pd.concat([d_df, new_deliv_df], ignore_index=True)
        
        m_df.to_csv(engine.matches_path, index=False)
        d_df.to_csv(engine.deliveries_path, index=False)
        
        # 4. Reload data engine
        engine.reload()
        
        return Response({
            'success': True,
            'message': f'Successfully uploaded match {match_id}. Platform database updated!'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

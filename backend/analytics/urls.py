from django.urls import path
from . import views

urlpatterns = [
    path('seasons/', views.get_seasons, name='seasons'),
    path('teams/', views.get_teams, name='teams'),
    path('venues/', views.get_venues, name='venues'),
    path('players/', views.get_players, name='players'),
    path('players/compare', views.compare_players_view, name='compare_players'),
    path('players/matchup/', views.get_matchup_view, name='player_matchup'),
    path('players/<str:name>/', views.get_player_detail, name='player_detail'),
    path('teams/compare', views.compare_teams_view, name='compare_teams'),
    path('venues/detail', views.get_venue_detail, name='venue_detail'),
    path('venues/toss-impact', views.get_toss_impact_summary, name='toss_impact'),
    path('league/season-stats', views.get_league_stats, name='season_stats'),
    path('matches/', views.list_matches, name='list_matches'),
    path('matches/<int:match_id>/progression/', views.get_match_detail, name='match_progression'),
    path('league/upload-match/', views.upload_match_data, name='upload_match'),
]

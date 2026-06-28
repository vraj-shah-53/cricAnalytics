from django.test import TestCase
from .data_engine import CricketDataEngine
from .charts import (
    generate_player_comparison_chart,
    generate_venue_split_chart,
    generate_match_progression_chart,
    generate_toss_impact_chart
)

class CricketAnalyticsTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.engine = CricketDataEngine.get_instance()

    def test_engine_loaded(self):
        self.assertIsNotNone(self.engine.matches_df)
        self.assertIsNotNone(self.engine.deliveries_df)
        self.assertTrue(len(self.engine.matches_df) > 0)
        self.assertTrue(len(self.engine.deliveries_df) > 0)

    def test_unique_lists(self):
        seasons = self.engine.get_unique_seasons()
        self.assertTrue(len(seasons) > 0)
        
        teams = self.engine.get_unique_teams()
        self.assertTrue(len(teams) > 0)
        
        venues = self.engine.get_unique_venues()
        self.assertTrue(len(venues) > 0)

    def test_player_stats(self):
        # MS Dhoni is guaranteed to be in the dataset
        stats = self.engine.get_player_stats("MS Dhoni")
        self.assertEqual(stats['player_name'], "MS Dhoni")
        self.assertTrue('batting' in stats)
        self.assertTrue('bowling' in stats)
        self.assertTrue(stats['batting']['runs'] > 0)

    def test_compare_players(self):
        stats = self.engine.compare_players("MS Dhoni", "Virat Kohli")
        self.assertEqual(stats['player1']['player_name'], "MS Dhoni")
        self.assertEqual(stats['player2']['player_name'], "Virat Kohli")

        # Test chart generation
        chart_b64 = generate_player_comparison_chart(
            "MS Dhoni", stats['player1']['batting'],
            "Virat Kohli", stats['player2']['batting']
        )
        self.assertIsNotNone(chart_b64)
        self.assertTrue(isinstance(chart_b64, str))

    def test_venue_stats(self):
        venues = self.engine.get_unique_venues()
        if venues:
            venue = venues[0]
            stats = self.engine.get_venue_stats(venue)
            self.assertEqual(stats['venue_name'], venue)
            self.assertTrue('avg_first_innings' in stats)
            
            # Test chart generation
            chart1 = generate_venue_split_chart(venue, stats['bowling_split']['pace_wickets'], stats['bowling_split']['spin_wickets'])
            chart2 = generate_toss_impact_chart(stats['toss_impact'])
            self.assertIsNotNone(chart1)
            self.assertIsNotNone(chart2)

    def test_orange_purple_cap(self):
        seasons = self.engine.get_unique_seasons()
        if seasons:
            season = seasons[0]
            caps = self.engine.get_orange_purple_cap(season)
            self.assertTrue('orange_cap' in caps)
            self.assertTrue('purple_cap' in caps)
            self.assertTrue(len(caps['orange_cap']) > 0)

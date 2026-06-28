import urllib.request
import json
import base64

def check_endpoint(url):
    print(f"Checking {url}...")
    try:
        response = urllib.request.urlopen(url)
        data = json.loads(response.read().decode('utf-8'))
        print(f"  [OK] Status 200. Keys returned: {list(data.keys())}")
        return data
    except Exception as e:
        print(f"  [ERROR] {e}")
        return None

base_url = "http://localhost:8005/api"

# 1. Seasons
check_endpoint(f"{base_url}/seasons/")

# 2. Teams
check_endpoint(f"{base_url}/teams/")

# 3. Venues
check_endpoint(f"{base_url}/venues/")

# 4. Players list
check_endpoint(f"{base_url}/players/")

# 5. Player details
check_endpoint(f"{base_url}/players/MS%20Dhoni/")

# 6. Player compare
check_endpoint(f"{base_url}/players/compare?p1=MS%20Dhoni&p2=Virat%20Kohli")

# 7. Team compare
check_endpoint(f"{base_url}/teams/compare?t1=Chennai%20Super%20Kings&t2=Mumbai%20Indians")

# 8. Venue detail
check_endpoint(f"{base_url}/venues/detail?venue=M%20Chinnaswamy%20Stadium")

# 9. Toss impact summary
check_endpoint(f"{base_url}/venues/toss-impact")

# 10. League season stats
check_endpoint(f"{base_url}/league/season-stats?season=2019")

# 11. Match List
matches = check_endpoint(f"{base_url}/matches?season=2019")

# 12. Match details
if matches and 'matches' in matches and len(matches['matches']) > 0:
    match_id = matches['matches'][0]['match_id']
    check_endpoint(f"{base_url}/matches/{match_id}/progression/")

# 13. Matchups
check_endpoint(f"{base_url}/players/matchup/?batter=V%20Kohli&bowler=JJ%20Bumrah")

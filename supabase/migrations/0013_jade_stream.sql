/*
  # Add mock leaderboard data
  
  1. Changes
    - Adds sample player stats for testing the leaderboard
    - Creates realistic mock data for total points, games played, and playtime
    - Ensures data is consistent with the player_stats table structure

  2. Notes
    - This is temporary test data until auth is re-enabled
    - Data represents a variety of player activity levels
*/

-- Insert mock player stats
INSERT INTO player_stats (
  id,
  user_id,
  total_points,
  games_played,
  total_playtime,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    15750,
    142,
    '168:30:00'::interval,
    now() - interval '6 months',
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    12340,
    98,
    '124:45:00'::interval,
    now() - interval '5 months',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    '33333333-3333-3333-3333-333333333333',
    8920,
    76,
    '89:15:00'::interval,
    now() - interval '4 months',
    now() - interval '3 days'
  ),
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    6540,
    45,
    '52:20:00'::interval,
    now() - interval '3 months',
    now() - interval '5 days'
  ),
  (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    4230,
    28,
    '34:10:00'::interval,
    now() - interval '2 months',
    now() - interval '4 days'
  );

-- Update the LeaderboardPage component to use these mock user IDs
COMMENT ON TABLE player_stats IS 'Mock user IDs for testing:
- Player 1: 11111111-1111-1111-1111-111111111111
- Player 2: 22222222-2222-2222-2222-222222222222
- Player 3: 33333333-3333-3333-3333-333333333333
- Player 4: 44444444-4444-4444-4444-444444444444
- Player 5: 55555555-5555-5555-5555-555555555555';
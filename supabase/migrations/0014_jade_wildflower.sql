/*
  # Add mock users and player stats
  
  1. Changes
    - Creates mock users in auth schema if they don't exist
    - Adds corresponding player stats for mock users
    - Ensures referential integrity with auth.users table

  2. Notes
    - Creates temporary mock data for testing
    - All mock users have consistent UUIDs
    - Uses ON CONFLICT to handle potential duplicates
*/

-- Create mock users in auth schema
DO $$ 
BEGIN
  INSERT INTO auth.users (id, email, created_at)
  VALUES
    ('11111111-1111-1111-1111-111111111111', 'player1@example.com', now() - interval '6 months'),
    ('22222222-2222-2222-2222-222222222222', 'player2@example.com', now() - interval '5 months'),
    ('33333333-3333-3333-3333-333333333333', 'player3@example.com', now() - interval '4 months'),
    ('44444444-4444-4444-4444-444444444444', 'player4@example.com', now() - interval '3 months'),
    ('55555555-5555-5555-5555-555555555555', 'player5@example.com', now() - interval '2 months')
  ON CONFLICT (id) DO NOTHING;
END $$;

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
  )
ON CONFLICT (user_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  games_played = EXCLUDED.games_played,
  total_playtime = EXCLUDED.total_playtime,
  updated_at = EXCLUDED.updated_at;
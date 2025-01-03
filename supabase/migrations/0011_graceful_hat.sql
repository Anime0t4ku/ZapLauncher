/*
  # Add leaderboard and achievements system

  1. New Tables
    - `game_achievements`: Stores available achievements and their point values
    - `player_stats`: Tracks player statistics and total points
    - `player_achievements`: Records which achievements players have earned

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Allow players to view all stats but only update their own
*/

-- Create game_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create player_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  total_playtime interval DEFAULT '0'::interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create player_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES game_achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Game achievements are viewable by everyone" ON game_achievements;
  DROP POLICY IF EXISTS "Players can view all player stats" ON player_stats;
  DROP POLICY IF EXISTS "Players can update their own stats" ON player_stats;
  DROP POLICY IF EXISTS "Players can view all achievements" ON player_achievements;
  DROP POLICY IF EXISTS "Players can insert their own achievements" ON player_achievements;
END $$;

-- Create policies
CREATE POLICY "Game achievements are viewable by everyone"
  ON game_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can view all player stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update their own stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Players can view all achievements"
  ON player_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert their own achievements"
  ON player_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert default achievements if they don't exist
INSERT INTO game_achievements (title, description, points, icon)
SELECT * FROM (VALUES
  ('First Game', 'Play your first game', 100, 'GamepadIcon'),
  ('Game Master', 'Play 100 different games', 1000, 'TrophyIcon'),
  ('Speed Runner', 'Complete a game in under 30 minutes', 500, 'TimerIcon'),
  ('Dedicated Player', 'Accumulate 24 hours of playtime', 750, 'ClockIcon'),
  ('Collection King', 'Add 50 games to your collection', 500, 'CrownIcon')
) AS v(title, description, points, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM game_achievements WHERE title = v.title
);
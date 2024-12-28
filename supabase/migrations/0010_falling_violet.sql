/*
  # Add leaderboard system

  1. New Tables
    - `player_stats`
      - Tracks player achievements and points
    - `game_achievements`
      - Defines achievements that can be earned
    - `player_achievements`
      - Records achievements earned by players

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create game_achievements table
CREATE TABLE game_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create player_stats table
CREATE TABLE player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  total_playtime interval DEFAULT '0'::interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create player_achievements table
CREATE TABLE player_achievements (
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

-- Insert some default achievements
INSERT INTO game_achievements (title, description, points, icon) VALUES
  ('First Game', 'Play your first game', 100, 'GamepadIcon'),
  ('Game Master', 'Play 100 different games', 1000, 'TrophyIcon'),
  ('Speed Runner', 'Complete a game in under 30 minutes', 500, 'TimerIcon'),
  ('Dedicated Player', 'Accumulate 24 hours of playtime', 750, 'ClockIcon'),
  ('Collection King', 'Add 50 games to your collection', 500, 'CrownIcon');
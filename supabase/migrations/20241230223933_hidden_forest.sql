/*
  # Add Leaderboard and Systems Schema

  1. New Tables
    - systems: Game systems/platforms
    - system_cores: Core files for each system
    - player_stats: User statistics and achievements
    - game_achievements: Available achievements
    - player_achievements: User earned achievements

  2. Security
    - Enable RLS on all tables
    - Add policies for viewing and updating data
*/

-- Create systems table
CREATE TABLE IF NOT EXISTS systems (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text,
  icon text,
  description text,
  year text,
  manufacturer text,
  color text,
  gradient text,
  created_at timestamptz DEFAULT now()
);

-- Create system_cores table
CREATE TABLE IF NOT EXISTS system_cores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id text REFERENCES systems(id) ON DELETE CASCADE,
  name text NOT NULL,
  filename text NOT NULL,
  description text,
  version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(system_id, filename)
);

-- Create game_achievements table
CREATE TABLE IF NOT EXISTS game_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create player_stats table
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

-- Create player_achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES game_achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Systems are viewable by everyone"
  ON systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System cores are viewable by everyone"
  ON system_cores FOR SELECT
  TO authenticated
  USING (true);

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

-- Insert default systems
INSERT INTO systems (id, name, short_name, icon, description, year, manufacturer, color, gradient)
VALUES
  (
    'nes',
    'Nintendo Entertainment System',
    'NES',
    'Gamepad2',
    '8-bit home video game console',
    '1983',
    'Nintendo',
    'rgb(229, 62, 62)',
    'from-red-500 to-red-600'
  ),
  (
    'snes',
    'Super Nintendo Entertainment System',
    'SNES',
    'Cpu',
    '16-bit home video game console',
    '1990',
    'Nintendo',
    'rgb(129, 140, 248)',
    'from-indigo-400 to-indigo-500'
  ),
  (
    'genesis',
    'Sega Genesis',
    'Genesis',
    'Sword',
    '16-bit home video game console',
    '1988',
    'Sega',
    'rgb(34, 197, 94)',
    'from-green-500 to-green-600'
  ),
  (
    'arcade',
    'Arcade Systems',
    'Arcade',
    'Joystick',
    'Classic arcade systems',
    '1970s-1990s',
    'Various',
    'rgb(234, 179, 8)',
    'from-yellow-500 to-yellow-600'
  );

-- Insert default achievements
INSERT INTO game_achievements (title, description, points, icon)
VALUES
  ('First Game', 'Play your first game', 100, 'GamepadIcon'),
  ('Game Master', 'Play 100 different games', 1000, 'TrophyIcon'),
  ('Speed Runner', 'Complete a game in under 30 minutes', 500, 'TimerIcon'),
  ('Dedicated Player', 'Accumulate 24 hours of playtime', 750, 'ClockIcon'),
  ('Collection King', 'Add 50 games to your collection', 500, 'CrownIcon');

-- Function to update player stats
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS trigger AS $$
BEGIN
  -- Create player stats record if it doesn't exist
  INSERT INTO player_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update total points
  UPDATE player_stats
  SET total_points = (
    SELECT COALESCE(SUM(ga.points), 0)
    FROM player_achievements pa
    JOIN game_achievements ga ON ga.id = pa.achievement_id
    WHERE pa.user_id = NEW.user_id
  )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating player stats
DROP TRIGGER IF EXISTS on_achievement_earned ON player_achievements;
CREATE TRIGGER on_achievement_earned
  AFTER INSERT ON player_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();

-- Function to update playtime
CREATE OR REPLACE FUNCTION update_playtime(
  player_id uuid,
  session_duration interval
)
RETURNS void AS $$
BEGIN
  UPDATE player_stats
  SET 
    total_playtime = total_playtime + session_duration,
    games_played = games_played + 1,
    updated_at = now()
  WHERE user_id = player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON systems TO authenticated;
GRANT SELECT ON system_cores TO authenticated;
GRANT SELECT ON game_achievements TO authenticated;
GRANT SELECT ON player_stats TO authenticated;
GRANT SELECT ON player_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION update_playtime TO authenticated;
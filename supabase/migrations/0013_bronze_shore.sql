/*
  # Add leaderboard functions and triggers

  1. New Functions
    - `update_player_stats`: Updates player statistics when achievements are earned
    - `calculate_total_points`: Calculates total points for a player
    - `update_playtime`: Updates total playtime for a player

  2. Triggers
    - Add trigger for automatically updating player stats
    - Add trigger for recalculating points when achievements are earned

  3. Indexes
    - Add indexes for better leaderboard query performance
*/

-- Create function to update player stats
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

-- Create function to update playtime
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
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_stats_points 
  ON player_stats (total_points DESC);

CREATE INDEX IF NOT EXISTS idx_player_achievements_user 
  ON player_achievements (user_id);

CREATE INDEX IF NOT EXISTS idx_player_stats_playtime 
  ON player_stats (total_playtime DESC);

-- Grant necessary permissions
ALTER FUNCTION update_playtime(uuid, interval) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION update_playtime TO authenticated;
/*
  # Simplify auth system and user roles
  
  1. Changes
    - Drop existing policies that depend on role column
    - Remove complex role system
    - Add friends list support
    - Simplify user roles table
    
  2. Security
    - Enable RLS
    - Add policies for friends list
*/

-- Drop existing policies that depend on role column
DROP POLICY IF EXISTS "Only admins can modify age ratings" ON age_ratings;
DROP POLICY IF EXISTS "Only admins and parents can modify roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Only admins and parents can modify restrictions" ON user_restrictions;
DROP POLICY IF EXISTS "Only admins can modify game ratings" ON game_ratings;
DROP POLICY IF EXISTS "Only admins can modify system backgrounds" ON system_backgrounds;

-- Drop dependent tables
DROP TABLE IF EXISTS user_restrictions CASCADE;
DROP TABLE IF EXISTS game_ratings CASCADE;
DROP TABLE IF EXISTS age_ratings CASCADE;

-- Simplify user_roles table
ALTER TABLE user_roles 
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS parent_id,
  DROP COLUMN IF EXISTS last_login;

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends table
CREATE POLICY "Users can view their own friends"
  ON friends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add friends"
  ON friends
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends"
  ON friends
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to add friend
CREATE OR REPLACE FUNCTION add_friend(friend_handle text)
RETURNS boolean AS $$
DECLARE
  friend_user_id uuid;
BEGIN
  -- Get friend's user_id from handle
  SELECT user_id INTO friend_user_id
  FROM user_roles
  WHERE handle = friend_handle;

  IF friend_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Add friend
  INSERT INTO friends (user_id, friend_id)
  VALUES (auth.uid(), friend_user_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove friend
CREATE OR REPLACE FUNCTION remove_friend(friend_handle text)
RETURNS boolean AS $$
DECLARE
  friend_user_id uuid;
BEGIN
  -- Get friend's user_id from handle
  SELECT user_id INTO friend_user_id
  FROM user_roles
  WHERE handle = friend_handle;

  IF friend_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Remove friend
  DELETE FROM friends
  WHERE user_id = auth.uid()
  AND friend_id = friend_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for friends list with handles
CREATE OR REPLACE VIEW friends_with_handles AS
SELECT 
  f.user_id,
  f.friend_id,
  ur.handle as friend_handle,
  f.created_at
FROM friends f
JOIN user_roles ur ON ur.user_id = f.friend_id;

-- Grant access to the view
GRANT SELECT ON friends_with_handles TO authenticated;
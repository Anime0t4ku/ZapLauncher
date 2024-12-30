/*
  # Create User Handles System

  1. Changes
    - Create user_handles table for storing user handles
    - Add handle verification function
    - Set up RLS policies
    - Create friends functionality

  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Create user_handles table
CREATE TABLE IF NOT EXISTS user_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_handle UNIQUE (user_id),
  CONSTRAINT unique_handle UNIQUE (handle)
);

-- Enable RLS
ALTER TABLE user_handles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all handles"
  ON user_handles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own handle"
  ON user_handles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create handle verification function
CREATE OR REPLACE FUNCTION verify_user_handle(
  user_id uuid,
  new_handle text,
  OUT success boolean,
  OUT error text,
  OUT handle text
)
RETURNS record AS $$
BEGIN
  -- Validate handle format
  IF new_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{2,29}$' THEN
    success := false;
    error := 'Handle must start with a letter or number and be 3-30 characters';
    RETURN;
  END IF;

  -- Check if handle is taken
  IF EXISTS (
    SELECT 1 FROM user_handles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'This handle is already taken';
    RETURN;
  END IF;

  -- Update handle
  UPDATE user_handles
  SET 
    handle = new_handle,
    updated_at = now()
  WHERE user_id = verify_user_handle.user_id
  RETURNING handle INTO handle;

  success := true;
  error := null;
EXCEPTION
  WHEN OTHERS THEN
    success := false;
    error := 'Unable to update handle. Please try again.';
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS for friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends
CREATE POLICY "Users can view their own friends"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add friends"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create friends view
CREATE VIEW friends_with_handles AS
SELECT 
  f.user_id,
  f.friend_id,
  uh.handle as friend_handle,
  f.created_at
FROM friends f
JOIN user_handles uh ON uh.user_id = f.friend_id;

-- Grant necessary permissions
GRANT SELECT ON friends_with_handles TO authenticated;
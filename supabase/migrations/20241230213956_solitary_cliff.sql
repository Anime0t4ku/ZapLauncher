/*
  # Fix Schema Migration

  1. Tables
    - Safely create user_handles table if it doesn't exist
    - Safely create friends table if it doesn't exist
    
  2. Security
    - Safely create RLS policies
    - Update handle verification function
*/

-- Safely create user_handles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_handles'
  ) THEN
    CREATE TABLE user_handles (
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
  END IF;
END $$;

-- Safely create friends table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'friends'
  ) THEN
    CREATE TABLE friends (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, friend_id)
    );

    -- Enable RLS
    ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safely create policies
DO $$ 
BEGIN
  -- Policies for user_handles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view all handles'
  ) THEN
    CREATE POLICY "Users can view all handles"
      ON user_handles FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own handle'
  ) THEN
    CREATE POLICY "Users can update their own handle"
      ON user_handles FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policies for friends
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view their own friends'
  ) THEN
    CREATE POLICY "Users can view their own friends"
      ON friends FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can add friends'
  ) THEN
    CREATE POLICY "Users can add friends"
      ON friends FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can remove friends'
  ) THEN
    CREATE POLICY "Users can remove friends"
      ON friends FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace handle verification function
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

  -- Update handle within transaction
  BEGIN
    UPDATE user_handles
    SET 
      handle = new_handle,
      updated_at = now()
    WHERE user_id = verify_user_handle.user_id
    RETURNING handle INTO handle;

    IF handle IS NULL THEN
      success := false;
      error := 'User not found';
      RETURN;
    END IF;

    success := true;
    error := null;
  EXCEPTION
    WHEN OTHERS THEN
      success := false;
      error := 'Database error: ' || SQLERRM;
      RETURN;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace view for friends list
CREATE OR REPLACE VIEW friends_with_handles AS
SELECT 
  f.user_id,
  f.friend_id,
  uh.handle as friend_handle,
  f.created_at
FROM friends f
JOIN user_handles uh ON uh.user_id = f.friend_id;

-- Grant necessary permissions
GRANT SELECT ON user_handles TO authenticated;
GRANT SELECT ON friends_with_handles TO authenticated;
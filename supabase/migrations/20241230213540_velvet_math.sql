/*
  # Update User Handle System

  1. Changes
    - Drop existing policies
    - Recreate policies with IF NOT EXISTS
    - Add better error handling to functions
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all handles" ON user_handles;
DROP POLICY IF EXISTS "Users can update their own handle" ON user_handles;

-- Create policies with IF NOT EXISTS
DO $$ 
BEGIN
  -- Create select policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_handles' 
    AND policyname = 'Users can view all handles'
  ) THEN
    CREATE POLICY "Users can view all handles"
      ON user_handles FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Create update policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_handles' 
    AND policyname = 'Users can update their own handle'
  ) THEN
    CREATE POLICY "Users can update their own handle"
      ON user_handles FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Update handle verification function with better error handling
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
/*
  # Add user handles and verification

  1. Changes
    - Add handle column to user_roles
    - Add handle validation and verification functions
    - Update existing users with default handles
    - Add unique constraint for handles

  2. Security
    - Validate handle format
    - Ensure unique handles
    - Safe handle generation
*/

-- Add handle column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'handle'
  ) THEN
    ALTER TABLE user_roles 
    ADD COLUMN handle text;

    -- Add unique constraint
    ALTER TABLE user_roles
    ADD CONSTRAINT unique_handle UNIQUE (handle);
  END IF;
END $$;

-- Create handle validation function
CREATE OR REPLACE FUNCTION validate_handle(handle text)
RETURNS boolean AS $$
BEGIN
  RETURN handle ~ '^[a-zA-Z0-9_-]{3,30}$';
END;
$$ LANGUAGE plpgsql;

-- Create handle verification function
CREATE OR REPLACE FUNCTION verify_user_handle(
  user_id uuid,
  new_handle text,
  OUT success boolean,
  OUT error text,
  OUT handle text
) AS $$
BEGIN
  -- Validate handle format
  IF NOT validate_handle(new_handle) THEN
    success := false;
    error := 'Invalid handle format. Use 3-30 characters, letters, numbers, underscore, or hyphen.';
    RETURN;
  END IF;

  -- Check if handle is already taken
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'Handle already taken';
    RETURN;
  END IF;

  -- Update handle
  UPDATE user_roles
  SET 
    handle = new_handle,
    updated_at = now()
  WHERE user_id = verify_user_handle.user_id;

  IF NOT FOUND THEN
    success := false;
    error := 'User not found';
    RETURN;
  END IF;

  success := true;
  error := null;
  handle := new_handle;
END;
$$ LANGUAGE plpgsql;

-- Update mock data with handles
UPDATE user_roles
SET handle = CASE
  WHEN user_id = '11111111-1111-1111-1111-111111111111' THEN 'player1'
  WHEN user_id = '22222222-2222-2222-2222-222222222222' THEN 'player2'
  WHEN user_id = '33333333-3333-3333-3333-333333333333' THEN 'player3'
  WHEN user_id = '44444444-4444-4444-4444-444444444444' THEN 'player4'
  WHEN user_id = '55555555-5555-5555-5555-555555555555' THEN 'player5'
  ELSE 'user' || substr(gen_random_uuid()::text, 1, 8)
END
WHERE handle IS NULL;
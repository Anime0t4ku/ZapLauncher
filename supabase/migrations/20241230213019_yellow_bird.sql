/*
  # Simplify Authentication System

  1. Changes
    - Remove role functionality
    - Keep handle system for user identification
    - Simplify user_roles table to just handles
    - Update functions and triggers

  2. Security
    - Maintain RLS policies
    - Keep handle verification
*/

-- Rename user_roles table to user_handles for clarity
ALTER TABLE IF EXISTS user_roles 
  RENAME TO user_handles;

-- Simplify table structure
ALTER TABLE user_handles
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS parent_id,
  DROP COLUMN IF EXISTS last_login,
  DROP COLUMN IF EXISTS email_verified;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS verify_user_email(uuid);
DROP FUNCTION IF EXISTS get_user_role(uuid);

-- Create simplified function for new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
  attempts integer := 0;
  max_attempts integer := 10;
BEGIN
  -- Generate default handle from email or random string
  default_handle := COALESCE(
    regexp_replace(
      split_part(NEW.email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '',
      'g'
    ),
    'user'
  );

  -- Ensure valid handle format
  IF length(default_handle) < 3 OR default_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
    default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  -- Truncate if too long
  default_handle := substring(default_handle from 1 for 20);

  -- Keep trying until we get a unique handle
  WHILE attempts < max_attempts LOOP
    BEGIN
      INSERT INTO user_handles (
        user_id,
        handle,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        default_handle,
        now(),
        now()
      );
      
      RETURN NEW;
    EXCEPTION 
      WHEN unique_violation THEN
        default_handle := substring(default_handle from 1 for 16) 
          || substr(gen_random_uuid()::text, 1, 4);
        attempts := attempts + 1;
      WHEN OTHERS THEN
        RAISE WARNING 'Error creating user handle: %', SQLERRM;
        RETURN NEW;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update handle verification function
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

-- Update RLS policies
ALTER TABLE user_handles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all handles" ON user_handles;
CREATE POLICY "Users can view all handles"
  ON user_handles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own handle" ON user_handles;
CREATE POLICY "Users can update their own handle"
  ON user_handles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update friends view
DROP VIEW IF EXISTS friends_with_handles;
CREATE VIEW friends_with_handles AS
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
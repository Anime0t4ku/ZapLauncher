/*
  # Fix user roles and authentication

  1. Changes
    - Improve role handling
    - Add email verification tracking
    - Add better handle generation
    - Fix user creation flow

  2. Security
    - Add proper constraints
    - Improve error handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create improved function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_handle text;
  clean_email text;
BEGIN
  -- Extract username part from email and clean it
  clean_email := regexp_replace(
    split_part(NEW.email, '@', 1),
    '[^a-zA-Z0-9_-]',
    '',
    'g'
  );
  
  -- Ensure minimum length
  IF length(clean_email) < 3 THEN
    clean_email := 'user';
  END IF;
  
  -- Truncate if too long
  default_handle := substring(clean_email from 1 for 20);
  
  -- Add random suffix if handle exists
  WHILE EXISTS (SELECT 1 FROM user_roles WHERE handle = default_handle) LOOP
    default_handle := substring(clean_email from 1 for 16) || substr(gen_random_uuid()::text, 1, 4);
  END LOOP;

  -- Insert new user role with generated handle
  INSERT INTO user_roles (
    user_id,
    role,
    handle,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'user',
    default_handle,
    false,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    handle = EXCLUDED.handle,
    updated_at = now()
  WHERE user_roles.handle IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate handle format
  IF new_handle !~ '^[a-zA-Z0-9_-]{3,30}$' THEN
    success := false;
    error := 'Handle must be 3-30 characters and can only contain letters, numbers, underscore, or hyphen';
    RETURN;
  END IF;

  -- Check if handle is taken
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE handle = new_handle 
    AND user_id != verify_user_handle.user_id
  ) THEN
    success := false;
    error := 'This handle is already taken';
    RETURN;
  END IF;

  -- Update handle
  UPDATE user_roles
  SET 
    handle = new_handle,
    updated_at = now()
  WHERE user_id = verify_user_handle.user_id
  RETURNING handle INTO handle;

  IF handle IS NULL THEN
    success := false;
    error := 'Failed to update handle';
    RETURN;
  END IF;

  success := true;
  error := null;
END;
$$;
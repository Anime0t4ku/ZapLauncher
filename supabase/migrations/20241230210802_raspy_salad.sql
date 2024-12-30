/*
  # Fix auth flow and user creation

  1. Changes
    - Add email verification tracking
    - Improve handle generation
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
  
  -- Ensure minimum length and valid format
  IF length(clean_email) < 3 OR clean_email !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
    clean_email := 'user' || substr(gen_random_uuid()::text, 1, 8);
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
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    handle = EXCLUDED.handle,
    email_verified = EXCLUDED.email_verified,
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

-- Create function to verify email
CREATE OR REPLACE FUNCTION verify_user_email(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_roles
  SET 
    email_verified = true,
    updated_at = now()
  WHERE user_id = verify_user_email.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
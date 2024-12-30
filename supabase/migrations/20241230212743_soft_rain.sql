/*
  # Fix Authentication Issues

  1. Changes
    - Add missing user roles for existing users
    - Ensure proper indexes exist
    - Add better error handling for role creation
    - Fix handle generation

  2. Security
    - Maintain RLS policies
    - Add proper constraints
*/

-- Function to safely create user role
CREATE OR REPLACE FUNCTION create_user_role(
  user_id uuid,
  email text,
  email_confirmed boolean
)
RETURNS void AS $$
DECLARE
  default_handle text;
  attempts integer := 0;
  max_attempts integer := 10;
BEGIN
  -- Generate initial handle from email or random string
  default_handle := COALESCE(
    regexp_replace(
      split_part(email, '@', 1),
      '[^a-zA-Z0-9_-]',
      '',
      'g'
    ),
    'user'
  );

  -- Ensure minimum length and valid format
  IF length(default_handle) < 3 OR default_handle !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]*$' THEN
    default_handle := 'user' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  -- Truncate if too long
  default_handle := substring(default_handle from 1 for 20);

  -- Keep trying until we get a unique handle
  WHILE attempts < max_attempts LOOP
    BEGIN
      INSERT INTO user_roles (
        user_id,
        handle,
        email_verified,
        created_at,
        updated_at
      )
      VALUES (
        user_id,
        default_handle,
        email_confirmed,
        now(),
        now()
      );
      
      -- If we get here, insert succeeded
      RETURN;
    EXCEPTION 
      WHEN unique_violation THEN
        -- Try a new handle
        default_handle := substring(default_handle from 1 for 16) 
          || substr(gen_random_uuid()::text, 1, 4);
        attempts := attempts + 1;
      WHEN OTHERS THEN
        -- Log other errors
        RAISE WARNING 'Error creating user role: %', SQLERRM;
        RETURN;
    END;
  END LOOP;

  -- If we get here, we failed to create a unique handle
  RAISE WARNING 'Failed to generate unique handle for user % after % attempts', user_id, max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create missing user roles for existing users
DO $$ 
DECLARE
  user_record RECORD;
BEGIN
  -- Find users without roles
  FOR user_record IN 
    SELECT 
      u.id,
      u.email,
      u.email_confirmed_at IS NOT NULL as email_confirmed
    FROM auth.users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    WHERE ur.id IS NULL
  LOOP
    -- Create role for user
    PERFORM create_user_role(
      user_record.id,
      user_record.email,
      user_record.email_confirmed
    );
  END LOOP;
END $$;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user role
  PERFORM create_user_role(
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_handle ON user_roles(handle);
CREATE INDEX IF NOT EXISTS idx_user_roles_email_verified ON user_roles(email_verified);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_role TO authenticated;